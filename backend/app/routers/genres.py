from fastapi import APIRouter, HTTPException
import httpx

from app.services.deezer import get_genre, get_genre_artists, get_genres

router = APIRouter(prefix="/api/genres", tags=["genres"])

@router.get("")
async def list_genres():
    genres = await get_genres()
    return {"data": genres}

@router.get("/{genre_id}")
async def genre_detail(genre_id: int):
    try:
        genre = await get_genre(genre_id)
    except httpx.HTTPStatusError:
        raise HTTPException(status_code=404, detail="Genre not found")
    
    artists = await get_genre_artists(genre_id)
    return {**genre, "artists": artists}