from fastapi import APIRouter
from app.controllers.dashboard_controller import dashboard_controller

router = APIRouter()


@router.get("/dashboard/stats", tags=["Dashboard"])
async def get_dashboard_stats():
    return dashboard_controller.get_stats()
