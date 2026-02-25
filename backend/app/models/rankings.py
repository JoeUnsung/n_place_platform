from datetime import datetime

from pydantic import BaseModel


class RankingResponse(BaseModel):
    id: str
    tracked_keyword_id: str
    rank_position: int | None = None
    total_results: int | None = None
    visitor_count: int | None = None
    blog_review_count: int | None = None
    collected_at: datetime
