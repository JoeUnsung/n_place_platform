import asyncio
import json
import logging
import re

import httpx

from app.collector.base import BaseCollector, RankingResult, StoreInfo
from app.config import settings

logger = logging.getLogger(__name__)

# Official Naver Local Search API
NAVER_API_URL = "https://openapi.naver.com/v1/search/local.json"
NAVER_API_MAX_DISPLAY = 5

# pcmap endpoints (Apollo state parsing)
SEARCH_URL = "https://pcmap.place.naver.com/place/list"
PLACE_DETAIL_URL = "https://pcmap.place.naver.com/place"

SCRAPE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://map.naver.com/",
}

REQUEST_DELAY = 1.5

_HTML_TAG_RE = re.compile(r"<[^>]+>")
_APOLLO_STATE_RE = re.compile(r"window\.__APOLLO_STATE__\s*=\s*")


def _strip_html(text: str) -> str:
    return _HTML_TAG_RE.sub("", text).strip()


def _extract_apollo_state(html: str) -> dict | None:
    """Extract window.__APOLLO_STATE__ JSON from the HTML page."""
    m = _APOLLO_STATE_RE.search(html)
    if not m:
        return None
    start = m.end()
    depth = 0
    for i, ch in enumerate(html[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(html[start : i + 1])
                except json.JSONDecodeError:
                    logger.error("Failed to parse __APOLLO_STATE__ JSON")
                    return None
    return None


class NaverMapCollector(BaseCollector):
    """Naver Map collector. Uses official API as primary, pcmap Apollo state as fallback."""

    def __init__(self) -> None:
        self._scrape_client: httpx.AsyncClient | None = None
        self._api_client: httpx.AsyncClient | None = None

    @property
    def _has_api_keys(self) -> bool:
        return bool(settings.NAVER_CLIENT_ID and settings.NAVER_CLIENT_SECRET)

    async def _get_api_client(self) -> httpx.AsyncClient:
        if self._api_client is None or self._api_client.is_closed:
            self._api_client = httpx.AsyncClient(
                headers={
                    "X-Naver-Client-Id": settings.NAVER_CLIENT_ID,
                    "X-Naver-Client-Secret": settings.NAVER_CLIENT_SECRET,
                },
                timeout=httpx.Timeout(10.0),
            )
        return self._api_client

    async def _get_scrape_client(self) -> httpx.AsyncClient:
        if self._scrape_client is None or self._scrape_client.is_closed:
            self._scrape_client = httpx.AsyncClient(
                headers=SCRAPE_HEADERS,
                timeout=httpx.Timeout(15.0),
                follow_redirects=True,
            )
        return self._scrape_client

    async def _fetch_html(self, url: str, params: dict | None = None) -> str:
        client = await self._get_scrape_client()
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.text

    # ------------------------------------------------------------------
    # Official API methods
    # ------------------------------------------------------------------

    async def search_keyword_api(self, keyword: str, display: int = NAVER_API_MAX_DISPLAY) -> list[RankingResult]:
        """Search using official Naver Local Search API (max 5 results).

        Note: The official API returns external links (not naver place URLs),
        so place_id cannot be reliably extracted. This method is best used
        for metadata (name, category, address) rather than ranking by place_id.
        """
        display = min(display, NAVER_API_MAX_DISPLAY)
        client = await self._get_api_client()
        response = await client.get(
            NAVER_API_URL,
            params={"query": keyword, "display": display, "start": 1, "sort": "random"},
        )
        response.raise_for_status()
        data = response.json()

        results: list[RankingResult] = []
        for rank, item in enumerate(data.get("items", []), start=1):
            link = item.get("link", "")
            place_id = self._extract_place_id_from_link(link)
            results.append(
                RankingResult(
                    rank_position=rank,
                    total_results=data.get("total"),
                    visitor_count=None,
                    blog_review_count=None,
                    place_id=place_id or "",
                )
            )

        logger.info("API returned %d results for keyword: %s", len(results), keyword)
        return results

    @staticmethod
    def _extract_place_id_from_link(link: str) -> str | None:
        match = re.search(r"/place/(\d+)", link)
        if match:
            return match.group(1)
        match = re.search(r"sid=(\d+)", link)
        if match:
            return match.group(1)
        return None

    async def _get_store_info_api(self, keyword: str) -> StoreInfo | None:
        """Try to get store info from official API by searching its name."""
        client = await self._get_api_client()
        response = await client.get(
            NAVER_API_URL,
            params={"query": keyword, "display": 1, "start": 1, "sort": "random"},
        )
        response.raise_for_status()
        data = response.json()

        items = data.get("items", [])
        if not items:
            return None

        item = items[0]
        link = item.get("link", "")
        place_id = self._extract_place_id_from_link(link)

        return StoreInfo(
            name=_strip_html(item.get("title", "")),
            category=item.get("category"),
            address=item.get("roadAddress") or item.get("address"),
            naver_place_url=link or f"https://pcmap.place.naver.com/place/{place_id}",
            naver_place_id=place_id or "",
        )

    # ------------------------------------------------------------------
    # pcmap Apollo state parsing methods
    # ------------------------------------------------------------------

    async def search_keyword_scrape(self, keyword: str, display: int = 50) -> list[RankingResult]:
        """Search by parsing __APOLLO_STATE__ from pcmap.place.naver.com."""
        logger.info("Fetching pcmap Apollo state for keyword: %s", keyword)
        html = await self._fetch_html(SEARCH_URL, params={"query": keyword})

        apollo = _extract_apollo_state(html)
        if not apollo:
            logger.warning("No __APOLLO_STATE__ found for keyword: %s", keyword)
            return []

        # Get ordered item list from ROOT_QUERY
        root_query = apollo.get("ROOT_QUERY", {})
        ordered_refs: list[str] = []
        for key, val in root_query.items():
            if isinstance(val, dict) and "items" in val:
                items = val["items"]
                if isinstance(items, list) and items:
                    first = items[0] if items else {}
                    if isinstance(first, dict) and "RestaurantListSummary" in first.get("__ref", ""):
                        ordered_refs = [item.get("__ref", "") for item in items if isinstance(item, dict)]
                        break

        if not ordered_refs:
            logger.warning("No ordered restaurant list found for keyword: %s", keyword)
            return []

        results: list[RankingResult] = []
        for rank, ref in enumerate(ordered_refs[:display], start=1):
            entry = apollo.get(ref, {})
            place_id = str(entry.get("id", ""))
            if not place_id:
                continue

            results.append(
                RankingResult(
                    rank_position=rank,
                    total_results=len(ordered_refs),
                    visitor_count=_safe_int(entry.get("visitorReviewCount")),
                    blog_review_count=_safe_int(entry.get("blogCafeReviewCount")),
                    place_id=place_id,
                )
            )

        logger.info("Apollo state returned %d results for keyword: %s", len(results), keyword)
        return results

    async def _get_store_info_scrape(self, place_id: str) -> StoreInfo | None:
        """Get store info by parsing __APOLLO_STATE__ from the place detail page."""
        try:
            html = await self._fetch_html(f"{PLACE_DETAIL_URL}/{place_id}")
        except httpx.HTTPStatusError as e:
            logger.error("Failed to fetch store info page: %s", e)
            return None

        apollo = _extract_apollo_state(html)
        if not apollo:
            logger.warning("No __APOLLO_STATE__ found for place_id: %s", place_id)
            return None

        # Look for the entry matching this place_id
        entry = None
        for key, val in apollo.items():
            if isinstance(val, dict) and str(val.get("id")) == place_id and val.get("name"):
                entry = val
                break

        if not entry:
            logger.warning("Could not find entry for place_id: %s in Apollo state", place_id)
            return None

        return StoreInfo(
            name=entry["name"],
            category=entry.get("category"),
            address=entry.get("roadAddress") or entry.get("address"),
            naver_place_url=f"https://pcmap.place.naver.com/place/{place_id}",
            naver_place_id=place_id,
        )

    # ------------------------------------------------------------------
    # Public interface (pcmap primary for ranking, API for enrichment)
    # ------------------------------------------------------------------

    async def search_keyword(self, keyword: str, display: int = 50) -> list[RankingResult]:
        try:
            return await self.search_keyword_scrape(keyword, display)
        except Exception:
            logger.exception("pcmap search failed for keyword: %s", keyword)

        if self._has_api_keys:
            try:
                return await self.search_keyword_api(keyword, display)
            except Exception:
                logger.exception("API search also failed for keyword: %s", keyword)

        return []

    async def get_store_info(self, place_id: str) -> StoreInfo | None:
        logger.info("Fetching store info for place_id: %s", place_id)

        # Parse Apollo state from detail page (has place_id-specific data)
        info = await self._get_store_info_scrape(place_id)

        # Enrich with official API data if available
        if info and self._has_api_keys:
            try:
                api_info = await self._get_store_info_api(info.name)
                if api_info:
                    info.category = api_info.category or info.category
                    info.address = api_info.address or info.address
            except Exception:
                logger.exception("API store info enrichment failed for place_id: %s", place_id)

        return info

    async def find_store_rank(self, keyword: str, place_id: str) -> RankingResult | None:
        logger.info("Finding rank for place_id=%s, keyword=%s", place_id, keyword)

        # pcmap Apollo state gives full ranking with place_ids
        try:
            results = await self.search_keyword_scrape(keyword)
            for result in results:
                if result.place_id == place_id:
                    logger.info("Found rank %d for place_id=%s", result.rank_position, place_id)
                    return result
            logger.info("Place %s not found in %d results for keyword: %s", place_id, len(results), keyword)
            return None
        except Exception:
            logger.exception("pcmap search failed in find_store_rank for keyword: %s", keyword)
            return None

    async def close(self) -> None:
        if self._api_client and not self._api_client.is_closed:
            await self._api_client.aclose()
        if self._scrape_client and not self._scrape_client.is_closed:
            await self._scrape_client.aclose()


def _safe_int(value: object) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


collector = NaverMapCollector()
