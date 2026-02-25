from datetime import datetime

from pydantic import BaseModel

from app.models.rankings import RankingResponse


class KeywordWithRank(BaseModel):
    id: str
    keyword: str
    is_active: bool
    latest_rank: RankingResponse | None = None


class DashboardSummary(BaseModel):
    store_id: str
    naver_place_id: str
    name: str | None = None
    category: str | None = None
    address: str | None = None
    naver_place_url: str | None = None
    keywords: list[KeywordWithRank] = []
    updated_at: datetime | None = None


class DashboardKeyword(BaseModel):
    id: str
    store_id: str | None = None
    keyword: str
    is_active: bool
    collection_time: str | None = None
    alert_enabled: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None
    latest_rank: int | None = None
    prev_rank: int | None = None
    rank_change: int | None = None
    latest_visitor_count: int | None = None
    latest_blog_review_count: int | None = None
    latest_collected_at: str | None = None


class DashboardStore(BaseModel):
    id: str
    naver_place_id: str
    name: str | None = None
    category: str | None = None
    address: str | None = None
    naver_place_url: str | None = None
    keywords: list[DashboardKeyword] = []
    updated_at: datetime | None = None
