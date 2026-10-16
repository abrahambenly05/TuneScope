import httpx

from app.config import settings

LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/"

async def get_tag_top_tracks(tag: str, limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            LASTFM_BASE_URL,
            params={
                "method": "tag.gettoptracks",
                "tag": tag,
                "limit": limit,
                "api_key": settings.lastfm_api_key,
                "format": "json",
            },
        )
        response.raise_for_status()
        data = response.json()
        
    return data.get("tracks", {}).get("track", [])