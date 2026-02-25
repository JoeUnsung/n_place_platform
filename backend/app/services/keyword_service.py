from supabase import Client

from app.models.keywords import KeywordCreate, KeywordResponse, KeywordUpdate


async def add_keyword(db: Client, store_id: str, payload: KeywordCreate) -> KeywordResponse:
    row = {
        "store_id": store_id,
        "keyword": payload.keyword,
        "collection_time": payload.collection_time.isoformat() if payload.collection_time else None,
        "alert_enabled": payload.alert_enabled,
    }
    result = db.table("tracked_keywords").insert(row).execute()
    return KeywordResponse(**result.data[0])


async def get_keyword(db: Client, keyword_id: str) -> KeywordResponse:
    result = db.table("tracked_keywords").select("*").eq("id", keyword_id).single().execute()
    return KeywordResponse(**result.data)


async def list_keywords(db: Client, store_id: str) -> list[KeywordResponse]:
    result = (
        db.table("tracked_keywords")
        .select("*")
        .eq("store_id", store_id)
        .order("created_at", desc=True)
        .execute()
    )
    return [KeywordResponse(**r) for r in result.data]


async def update_keyword(db: Client, keyword_id: str, payload: KeywordUpdate) -> KeywordResponse:
    updates = payload.model_dump(exclude_none=True)
    if "collection_time" in updates and updates["collection_time"] is not None:
        updates["collection_time"] = updates["collection_time"].isoformat()
    result = db.table("tracked_keywords").update(updates).eq("id", keyword_id).execute()
    return KeywordResponse(**result.data[0])


async def delete_keyword(db: Client, keyword_id: str) -> None:
    db.table("tracked_keywords").delete().eq("id", keyword_id).execute()
