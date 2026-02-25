from datetime import date

from supabase import Client

from app.collector.naver_map import collector
from app.models.rankings import RankingResponse


async def collect_ranking(db: Client, keyword_id: str) -> RankingResponse:
    kw_result = db.table("tracked_keywords").select("*, stores(naver_place_id)").eq("id", keyword_id).single().execute()
    kw = kw_result.data
    place_id = kw["stores"]["naver_place_id"]

    rank = await collector.find_store_rank(kw["keyword"], place_id)

    row = {
        "tracked_keyword_id": keyword_id,
        "rank_position": rank.rank_position if rank else None,
        "total_results": rank.total_results if rank else None,
        "visitor_count": rank.visitor_count if rank else None,
        "blog_review_count": rank.blog_review_count if rank else None,
    }
    result = db.table("ranking_snapshots").insert(row).execute()
    return RankingResponse(**result.data[0])


async def get_rankings(
    db: Client,
    keyword_id: str,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[RankingResponse]:
    query = (
        db.table("ranking_snapshots")
        .select("*")
        .eq("tracked_keyword_id", keyword_id)
        .order("collected_at", desc=True)
    )
    if date_from:
        query = query.gte("collected_at", date_from.isoformat())
    if date_to:
        query = query.lte("collected_at", date_to.isoformat() + "T23:59:59")
    result = query.execute()
    return [RankingResponse(**r) for r in result.data]
