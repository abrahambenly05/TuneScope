from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models.history import ListeningHistory
from app.models.user import User
from app.schemas.history import HistoryCreate, HistoryResponse, TopTrackResponse

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

@router.delete("/me", status_code=204)
def clear_my_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(ListeningHistory).filter(
        ListeningHistory.user_id == current_user.id
    ).delete()
    db.commit()