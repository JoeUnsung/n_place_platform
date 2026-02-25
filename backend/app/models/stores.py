from datetime import datetime

from pydantic import BaseModel


class StoreCreate(BaseModel):
    naver_place_id: str


class StoreResponse(BaseModel):
    id: str
    naver_place_id: str
    name: str
    category: str | None = None
    address: str | None = None
    naver_place_url: str | None = None
    created_at: datetime
    updated_at: datetime
