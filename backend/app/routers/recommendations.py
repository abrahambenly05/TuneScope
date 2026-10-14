from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models.user import User
from app.services.recommendations import build_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.get("/tracks")
async def recommended_tracks(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await build_recommendations(db, current_user.id, limit=limit)