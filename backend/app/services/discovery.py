import httpx

from app.services.deezer import search_tracks
from app.services.lastfm import get_tag_top_tracks

MOODS: dict[str, str] = {
    "chill": "chill",
    "focus": "instrumental",
    "workout": "workout",
    "happy": "happy",
    "sad": "sad",
    "party": "party",
}

async def discover_tracks_by_mood(mood: str, limit: int=12) -> list[dict]:
    tag = MOODS.get(mood)
    if tag is None:
        return[]
    
    try:
        tagged_tracks = await get_tag_top_tracks(tag, limit=limit + 8)
    except httpx.HTTPError:
        return []
    
    tracks: list[dict] = []
    seen_ids: set[int] = set()
    
    for item in tagged_tracks:
        if len(tracks) >= limit:
            break
        
        title = item.get("name")
        artist = item.get("artist", {}).get("name")
        if not title or not artist:
            continue
        
        try:
            results = await search_tracks(f"{artist} {title}", limit=1)
        except httpx.HTTPError:
            continue
        
        if not results:
            continue
        
        track = results[0]
        track_id = track.get("id")
        if track_id and track_id not in seen_ids:
            seen_ids.add(track_id)
            tracks.append(track)
            
    return tracks