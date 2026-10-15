from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models.history import ListeningHistory
from app.models.user import User
from app.schemas.history import (
    DailyPlaysResponse,
    HistoryCreate, 
    HistoryResponse,
    HistoryStatsResponse,
    TopArtistResponse, 
    TopTrackResponse,
)

router = APIRouter(prefix="/api/history", tags=["history"])

@router.post("", response_model=HistoryResponse, status_code=201)
def record_play(
    payload: HistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = ListeningHistory(user_id=current_user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/me", response_model=list[HistoryResponse])
def list_my_history(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ListeningHistory)
        .filter(ListeningHistory.user_id == current_user.id)
        .order_by(ListeningHistory.played_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
@router.get("/top-tracks", response_model=list[TopTrackResponse])
def list_top_tracks(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            ListeningHistory.external_id,
            func.max(ListeningHistory.title).label("title"),
            func.max(ListeningHistory.subtitle).label("subtitle"),
            func.max(ListeningHistory.image_url).label("image_url"),
            func.count(ListeningHistory.id).label("play_count"),
        )
        .filter(ListeningHistory.user_id == current_user.id)
        .group_by(ListeningHistory.external_id)
        .order_by(func.count(ListeningHistory.id).desc())
        .limit(limit)
        .all()
    )
    return [
        TopTrackResponse(
            external_id=row.external_id,
            title=row.title,
            subtitle=row.subtitle,
            image_url=row.image_url,
            play_count=row.play_count,
        )
        for row in rows
    ]
    
@router.get("/stats", response_model=HistoryStatsResponse)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_plays, unique_tracks, unique_artists = (
        db.query(
            func.count(ListeningHistory.id),
            func.count(distinct(ListeningHistory.external_id)),
            func.count(distinct(ListeningHistory.subtitle)),
        )
        .filter(ListeningHistory.user_id == current_user.id)
        .one()
    )
    artist_rows =(
        db.query(
            ListeningHistory.subtitle,
            func.count(ListeningHistory.id).label("plays"),
        )
        .filter(
            ListeningHistory.user_id == current_user.id,
            ListeningHistory.subtitle.isnot(None),
        )
        .group_by(ListeningHistory.subtitle)
        .order_by(func.count(ListeningHistory.id).desc())
        .limit(5)
        .all()
    )
    
    start_of_today = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    since = start_of_today - timedelta(days=13)
    
    played_rows = (
        db.query(ListeningHistory.played_at)
        .filter(
            ListeningHistory.user_id == current_user.id,
            ListeningHistory.played_at >= since,
        )
        .all()
    )
    
    counts: dict[str, int] = {}
    for (played_at,) in played_rows:
        key = played_at.date().isoformat()
        counts[key] = counts.get(key, 0) + 1
        
    plays_per_day = [
        DailyPlaysResponse(
            date=(since + timedelta(days=offset)).date().isoformat(),
            plays=counts.get((since + timedelta(days=offset)).date().isoformat(), 0),
        )
        for offset in range(14)
    ]
    
    return HistoryStatsResponse(
        total_plays=total_plays,
        unique_tracks=unique_tracks,
        unique_artists=unique_artists,
        top_artists=[
            TopArtistResponse(name=name, play_count=plays) for name, plays in artist_rows
        ],
        plays_per_day=plays_per_day,
    )

@router.delete("/me", status_code=204)
def clear_my_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ListeningHistory).filter(
        ListeningHistory.user_id == current_user.id
    ).delete()
    db.commit()