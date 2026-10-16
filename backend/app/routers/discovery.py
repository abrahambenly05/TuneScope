from fastapi import APIRouter, HTTPException, Query

from app.services.discovery import MOODS, discover_tracks_by_mood

router = APIRouter(prefix="/api/discovery", tags=["discovery"])

@router.get("/moods")
def list_moods() -> list[str]:
    return list(MOODS.keys())

@router.get("/tracks")
async def discover_tracks(
    mood: str,
    limit: int = Query(12, ge=1, le=30),
):
    if mood not in MOODS:
        raise HTTPException(status_code=404, detail="Unknown mood")
    
    return await discover_tracks_by_mood(mood, limit=limit)