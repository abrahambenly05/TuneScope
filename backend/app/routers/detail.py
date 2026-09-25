from fastapi import APIRouter, HTTPException
import httpx

from app.services.deezer import (
    get_album,
    get_artist,
    get_artist_albums,
    get_artist_top_tracks,
    get_track,
)

router = APIRouter(prefix="/api", tags=["detail"])

@router.get("/tracks/{track_id}")
async def track_detail(track_id: int):
    try:
        return await get_track(track_id)
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail="Track not found")

@router.get("/artists/{artist_id}")
async def artist_detail(artist_id: int):
    try:
        artist = await get_artist(artist_id)
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail="Artist not found")

    top_tracks = await get_artist_top_tracks(artist_id)
    albums = await get_artist_albums(artist_id)
    
    return {
        **artist,
        "top_tracks": top_tracks,
        "albums": albums,
    }
    
@router.get("/albums/{album_id}")
async def album_detail(album_id: int):
    try:
        return await get_album(album_id)
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail="Album not found")