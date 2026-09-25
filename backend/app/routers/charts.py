from fastapi import APIRouter

from app.services.deezer import get_trending_tracks

router = APIRouter(prefix="/api/charts", tags=["charts"])

@router.get("/trending")
async def trending_tracks(limit: int = 20):
    tracks = await get_trending_tracks(limit=limit)
    return {"data": tracks}