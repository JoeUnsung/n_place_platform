from datetime import date

from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.deps import get_supabase
from app.models.rankings import RankingResponse
from app.services import ranking_service

router = APIRouter(prefix="/api/keywords", tags=["rankings"])


@router.post("/{keyword_id}/collect", response_model=RankingResponse, status_code=201)
async def collect_ranking(keyword_id: str, db: Client = Depends(get_supabase)):
    return await ranking_service.collect_ranking(db, keyword_id)


@router.get("/{keyword_id}/rankings", response_model=list[RankingResponse])
async def get_rankings(
    keyword_id: str,
    from_: date | None = Query(None, alias="from"),
    to: date | None = Query(None),
    db: Client = Depends(get_supabase),
):
    return await ranking_service.get_rankings(db, keyword_id, from_, to)
