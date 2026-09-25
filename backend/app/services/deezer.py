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