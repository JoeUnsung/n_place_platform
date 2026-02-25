from supabase import Client

from app.models.dashboard import (
    DashboardKeyword,
    DashboardStore,
    DashboardSummary,
    KeywordWithRank,
)
from app.models.rankings import RankingResponse


async def get_dashboard(db: Client, store_id: str) -> DashboardSummary:
    store_result = db.table("stores").select("*").eq("id", store_id).single().execute()
    store = store_result.data

    kw_result = (
        db.table("tracked_keywords")
        .select("*")
        .eq("store_id", store_id)
        .order("created_at")
        .execute()
    )

    keywords_with_rank: list[KeywordWithRank] = []
    for kw in kw_result.data:
        latest = (
            db.table("ranking_snapshots")
            .select("*")
            .eq("tracked_keyword_id", kw["id"])
            .order("collected_at", desc=True)
            .limit(1)
            .execute()
        )
        latest_rank = RankingResponse(**latest.data[0]) if latest.data else None
        keywords_with_rank.append(
            KeywordWithRank(
                id=kw["id"],
                keyword=kw["keyword"],
                is_active=kw["is_active"],
                latest_rank=latest_rank,
            )
        )

    return DashboardSummary(
        store_id=store["id"],
        naver_place_id=store["naver_place_id"],
        name=store.get("name"),
        category=store.get("category"),
        address=store.get("address"),
        naver_place_url=store.get("naver_place_url"),
        keywords=keywords_with_rank,
        updated_at=store.get("updated_at"),
    )


async def get_all_dashboard(db: Client) -> list[DashboardStore]:
    stores_result = db.table("stores").select("*").order("created_at", desc=True).execute()

    dashboard_stores: list[DashboardStore] = []
    for store in stores_result.data:
        kw_result = (
            db.table("tracked_keywords")
            .select("*")
            .eq("store_id", store["id"])
            .order("created_at")
            .execute()
        )

        keywords: list[DashboardKeyword] = []
        for kw in kw_result.data:
            snapshots = (
                db.table("ranking_snapshots")
                .select("rank_position")
                .eq("tracked_keyword_id", kw["id"])
                .order("collected_at", desc=True)
                .limit(2)
                .execute()
            )

            latest_rank: int | None = None
            prev_rank: int | None = None
            rank_change: int | None = None

            if snapshots.data:
                latest_rank = snapshots.data[0].get("rank_position")
                if len(snapshots.data) > 1:
                    prev_rank = snapshots.data[1].get("rank_position")
                if latest_rank is not None and prev_rank is not None:
                    rank_change = prev_rank - latest_rank

            keywords.append(
                DashboardKeyword(
                    id=kw["id"],
                    store_id=kw.get("store_id"),
                    keyword=kw["keyword"],
                    is_active=kw["is_active"],
                    collection_time=kw.get("collection_time"),
                    alert_enabled=kw.get("alert_enabled", False),
                    created_at=kw.get("created_at"),
                    updated_at=kw.get("updated_at"),
                    latest_rank=latest_rank,
                    prev_rank=prev_rank,
                    rank_change=rank_change,
                )
            )

        dashboard_stores.append(
            DashboardStore(
                id=store["id"],
                naver_place_id=store["naver_place_id"],
                name=store.get("name"),
                category=store.get("category"),
                address=store.get("address"),
                naver_place_url=store.get("naver_place_url"),
                keywords=keywords,
                updated_at=store.get("updated_at"),
            )
        )

    return dashboard_stores
