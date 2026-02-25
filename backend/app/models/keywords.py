from datetime import datetime, time

from pydantic import BaseModel


class KeywordCreate(BaseModel):
    keyword: str
    collection_time: time | None = None
    alert_enabled: bool = False


class KeywordUpdate(BaseModel):
    is_active: bool | None = None
    collection_time: time | None = None
    alert_enabled: bool | None = None


class KeywordResponse(BaseModel):
    id: str
    store_id: str
    keyword: str
    is_active: bool
    collection_time: time | None = None
    alert_enabled: bool
    created_at: datetime
    updated_at: datetime | None = None
