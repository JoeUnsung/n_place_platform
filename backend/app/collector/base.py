from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class StoreInfo:
    name: str
    category: str | None
    address: str | None
    naver_place_url: str
    naver_place_id: str


@dataclass
class RankingResult:
    rank_position: int | None
    total_results: int | None
    visitor_count: int | None
    blog_review_count: int | None
    place_id: str


class BaseCollector(ABC):
    @abstractmethod
    async def search_keyword(self, keyword: str, display: int = 50) -> list[RankingResult]:
        ...

    @abstractmethod
    async def get_store_info(self, place_id: str) -> StoreInfo | None:
        ...

    @abstractmethod
    async def find_store_rank(self, keyword: str, place_id: str) -> RankingResult | None:
        ...
