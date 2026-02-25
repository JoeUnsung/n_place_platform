from supabase import Client

from app.collector.naver_map import collector
from app.models.stores import StoreCreate, StoreResponse


async def create_store(db: Client, payload: StoreCreate) -> StoreResponse:
    info = await collector.get_store_info(payload.naver_place_id)

    row = {
        "naver_place_id": payload.naver_place_id,
        "name": info.name if info else payload.naver_place_id,
        "category": info.category if info else None,
        "address": info.address if info else None,
        "naver_place_url": info.naver_place_url if info else None,
    }
    result = db.table("stores").insert(row).execute()
    return StoreResponse(**result.data[0])


async def get_store(db: Client, store_id: str) -> StoreResponse:
    result = db.table("stores").select("*").eq("id", store_id).single().execute()
    return StoreResponse(**result.data)


async def list_stores(db: Client) -> list[StoreResponse]:
    result = db.table("stores").select("*").order("created_at", desc=True).execute()
    return [StoreResponse(**r) for r in result.data]


async def delete_store(db: Client, store_id: str) -> None:
    db.table("stores").delete().eq("id", store_id).execute()
