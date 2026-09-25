import httpx

DEEZER_BASE_URL = "https://api.deezer.com"

async def get_trending_tracks(limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/chart/0/tracks",
            params={"limit": limit},
        )
        response.raise_for_status()
        data = response.json()
    return data.get("data", [])

async def search_tracks(query: str, limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/search/track",
            params={"q": query, "limit": limit},
        )
        response.raise_for_status()
        data = response.json()
    return data.get("data", [])

async def search_artists(query: str, limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/search/artist",
            params={"q": query, "limit": limit},
        )
        response.raise_for_status()
        data = response.json()
    return data.get("data", [])

async def search_albums(query: str, limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/search/album",
            params={"q": query, "limit": limit},
        )
        response.raise_for_status()
        data = response.json()
    return data.get("data", [])

async def get_track(track_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DEEZER_BASE_URL}/track/{track_id}")
        response.raise_for_status()
        return response.json()
    
async def get_artist(artist_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DEEZER_BASE_URL}/artist/{artist_id}")
        response.raise_for_status()
        return response.json()
    
async def get_artist_top_tracks(artist_id: int, limit: int = 10) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/artist/{artist_id}/top", params={"limit": limit}
        )
        response.raise_for_status()
        return response.json().get("data", [])
    
async def get_artist_albums(artist_id: int, limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/artist/{artist_id}/albums", params={"limit": limit}
        )
        response.raise_for_status()
        return response.json().get("data", [])
    
async def get_album(album_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DEEZER_BASE_URL}/album/{album_id}")
        response.raise_for_status()
        return response.json()