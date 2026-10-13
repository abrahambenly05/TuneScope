from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityResponse

router = APIRouter(prefix="/api/activities", tags=["activities"])

def to_response(activity: Activity, owner_name: str) -> ActivityResponse:
    return ActivityResponse(
        id=activity.id,
        user_id=activity.user_id,
        owner_name=owner_name,
        activity_type=activity.activity_type,
        reference_id=activity.reference_id,
        item_type=activity.item_type,
        external_id=activity.external_id,
        rating=activity.rating,
        title=activity.title,
        subtitle=activity.subtitle,
        image_url=activity.image_url,
        created_at=activity.created_at,
    )

@router.get("", response_model=list[ActivityResponse])
def list_activities(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Activity, User.display_name)
        .join(User, Activity.user_id == User.id)
        .order_by(Activity.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [to_response(activity, owner_name) for activity, owner_name in rows]

@router.get("/me", response_model=list[ActivityResponse])
def list_my_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .all()
    )
    return [to_response(activity, current_user.display_name) for activity in activities]