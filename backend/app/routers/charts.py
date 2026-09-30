from fastapi import APIRouter

from app.services.deezer import (
    get_new_releases,
    get_popular_albums,
    get_popular_artists,
    get_trending_tracks,
)

router = APIRouter(prefix="/api/charts", tags=["charts"])

@router.get("/trending")
async def trending_tracks(limit: int = 20):
    tracks = await get_trending_tracks(limit=limit)
    return {"data": tracks}

@router.get("/albums")
async def popular_albums(limit: int = 20):
    albums = await get_popular_albums(limit=limit)
    return{"data": albums}

@router.get("/artists")
async def popular_artists(limit: int = 20):
    artists = await get_popular_artists(limit=limit)
    return {"data": artists}

@router.get("/new-releases")
async def new_releases(limit: int = 20):
    releases = await get_new_releases(limit=limit)
    return {"data": releases}