from fastapi import APIRouter, Depends
from supabase import Client

from app.deps import get_supabase
from app.models.keywords import KeywordCreate, KeywordResponse, KeywordUpdate
from app.services import keyword_service

router = APIRouter(tags=["keywords"])


@router.post(
    "/api/stores/{store_id}/keywords",
    response_model=KeywordResponse,
    status_code=201,
)
async def add_keyword(
    store_id: str, payload: KeywordCreate, db: Client = Depends(get_supabase)
):
    return await keyword_service.add_keyword(db, store_id, payload)


@router.get(
    "/api/stores/{store_id}/keywords",
    response_model=list[KeywordResponse],
)
async def list_keywords(store_id: str, db: Client = Depends(get_supabase)):
    return await keyword_service.list_keywords(db, store_id)


@router.get("/api/keywords/{keyword_id}", response_model=KeywordResponse)
async def get_keyword(keyword_id: str, db: Client = Depends(get_supabase)):
    return await keyword_service.get_keyword(db, keyword_id)


@router.patch("/api/keywords/{keyword_id}", response_model=KeywordResponse)
async def update_keyword(
    keyword_id: str, payload: KeywordUpdate, db: Client = Depends(get_supabase)
):
    return await keyword_service.update_keyword(db, keyword_id, payload)


@router.delete("/api/keywords/{keyword_id}", status_code=204)
async def delete_keyword(keyword_id: str, db: Client = Depends(get_supabase)):
    await keyword_service.delete_keyword(db, keyword_id)
