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
    
async def get_related_artists(artist_id: int, limit: int = 5) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/artist/{artist_id}/related", params={"limit": limit}
        )
        response.raise_for_status()
        return response.json().get("data", [])
    
async def get_album(album_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DEEZER_BASE_URL}/album/{album_id}")
        response.raise_for_status()
        return response.json()
    
async def get_popular_albums(limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/chart/0/albums", params={"limit": limit}
        )
        response.raise_for_status()
        return response.json().get("data", [])
    
async def get_popular_artists(limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/chart/0/artists", params={"limit": limit}
        )
        response.raise_for_status()
        return response.json().get("data", [])
    
async def get_new_releases(limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/chart/0/albums", params={"limit": 30}
        )
        response.raise_for_status()
        albums = response.json().get("data", [])
        
        detailed = []
        for album in albums:
            try:
                detail_response = await client.get(f"{DEEZER_BASE_URL}/album/{album['id']}")
                detail_response.raise_for_status()
                detail = detail_response.json()
                album["release_date"] = detail.get("release_date", "")
            except httpx.HTTPStatusError:
                album["release_date"]
            detailed.append(album)

    detailed.sort(key=lambda album: album.get("release_date", ""), reverse=True)
    return detailed[:limit]

async def get_genres() -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DEEZER_BASE_URL}/genre")
        response.raise_for_status()
        genres = response.json().get("data", [])
    return [genre for genre in genres if genre.get("id") != 0]

async def get_genre(genre_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DEEZER_BASE_URL}/genre/{genre_id}")
        response.raise_for_status()
        return response.json()

async def get_genre_artists(genre_id: int, limit: int = 20) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DEEZER_BASE_URL}/genre/{genre_id}/artists", params={"limit": limit}
        )
        response.raise_for_status()
        return response.json().get("data", [])