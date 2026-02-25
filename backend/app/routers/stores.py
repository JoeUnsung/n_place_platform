from fastapi import APIRouter, Depends
from supabase import Client

from app.deps import get_supabase
from app.models.dashboard import DashboardSummary
from app.models.stores import StoreCreate, StoreResponse
from app.services import dashboard_service, store_service

router = APIRouter(prefix="/api/stores", tags=["stores"])


@router.post("", response_model=StoreResponse, status_code=201)
async def create_store(payload: StoreCreate, db: Client = Depends(get_supabase)):
    return await store_service.create_store(db, payload)


@router.get("", response_model=list[StoreResponse])
async def list_stores(db: Client = Depends(get_supabase)):
    return await store_service.list_stores(db)


@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(store_id: str, db: Client = Depends(get_supabase)):
    return await store_service.get_store(db, store_id)


@router.delete("/{store_id}", status_code=204)
async def delete_store(store_id: str, db: Client = Depends(get_supabase)):
    await store_service.delete_store(db, store_id)


@router.get("/{store_id}/dashboard", response_model=DashboardSummary)
async def get_dashboard(store_id: str, db: Client = Depends(get_supabase)):
    return await dashboard_service.get_dashboard(db, store_id)
