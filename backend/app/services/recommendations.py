import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.history import ListeningHistory
from app.services.deezer import get_artist_top_tracks, get_related_artists, get_track

def get_seed_track_ids(db: Session, user_id: int, limit: int = 3) -> list[int]:
    rows = (
        db.query(ListeningHistory.external_id)
        .filter(ListeningHistory.user_id == user_id)
        .group_by(ListeningHistory.external_id)
        .order_by(func.count(ListeningHistory.id).desc())
        .limit(limit)
        .all()
    )
    return [row.external_id for row in rows]

def get_played_track_ids(db: Session, user_id: int) -> set[int]:
    rows = (
        db.query(ListeningHistory.external_id)
        .filter(ListeningHistory.user_id == user_id)
        .distinct()
        .all()
    )
    return {row.external_id for row in rows}

async def build_recommendations(
    db: Session, user_id: int, limit: int = 20
) -> list[dict]:
    seed_track_ids = get_seed_track_ids(db, user_id)
    if not seed_track_ids:
        return []
    
    known_artist_ids: set[int] = set()
    related_artist_ids: list[int] = []
    
    for track_id in seed_track_ids:
        try:
            track = await get_track(track_id)
        except httpx.HTTPStatusError:
            continue
        
        artist_id = track.get("artist", {}).get("id")
        if not artist_id:
            continue
        
        known_artist_ids.add(artist_id)
        
        try:
            related = await get_related_artists(artist_id)
        except httpx.HTTPStatusError:
            continue
        
        for artist in related:
            related_id = artist.get("id")
            if related_id and related_id not in known_artist_ids:
                known_artist_ids.add(related_id)
                related_artist_ids.append(related_id)
                 
    seen_track_ids = get_played_track_ids(db, user_id)
    recommendations: list[dict] = []
        
    for artist_id in related_artist_ids:
        if len(recommendations) >= limit:
            break
            
        try:
            top_tracks = await get_artist_top_tracks(artist_id, limit=3)
        except httpx.HTTPStatusError:
            continue
            
        for track in top_tracks:
            track_id = track.get("id")
            if track_id and track_id not in seen_track_ids:
                seen_track_ids.add(track_id)
                recommendations.append(track)
                if len(recommendations) >= limit:
                    break
            
    return recommendations