import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.deps import get_supabase
from app.services import ranking_service

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def collect_all_rankings() -> None:
    # TODO(PoC): Per-keyword collection_time is ignored for now.
    # All active keywords are collected on a single hourly interval.
    db = get_supabase()
    result = db.table("tracked_keywords").select("id").eq("is_active", True).execute()

    for kw in result.data:
        try:
            await ranking_service.collect_ranking(db, kw["id"])
            logger.info("Collected ranking for keyword %s", kw["id"])
        except Exception:
            logger.exception("Failed to collect ranking for keyword %s", kw["id"])


def start_scheduler() -> None:
    scheduler.add_job(
        collect_all_rankings,
        "interval",
        hours=1,
        id="collect_rankings",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started")


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")
