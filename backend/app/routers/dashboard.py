from fastapi import APIRouter, Depends
from supabase import Client

from app.deps import get_supabase
from app.models.dashboard import DashboardStore
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=list[DashboardStore])
async def get_all_dashboard(db: Client = Depends(get_supabase)):
    return await dashboard_service.get_all_dashboard(db)
