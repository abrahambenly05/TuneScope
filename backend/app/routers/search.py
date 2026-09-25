from fastapi import APIRouter, Query

from app.services.deezer import search_albums, search_artists, search_tracks

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("/tracks")
async def search_track_endpoint(q: str = Query(..., min_length=1), limit: int = 20):
    results = await search_tracks(query=q, limit=limit)
    return {"data": results}

@router.get("/artists")
async def search_artists_endpoint(q: str = Query(..., min_length=1), limit: int = 20):
    results = await search_artists(query=q, limit=limit)
    return {"data": results}

@router.get("/albums")
async def search_albums_endpoint(q: str = Query(..., min_length=1), limit: int = 20):
    results = await search_albums(query=q, limit=limit)
    return {"data": results}