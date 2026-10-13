from sqlalchemy.orm import Session

from app.models.activity import Activity

def record_activity(
    db: Session,
    *,
    user_id: int,
    activity_type: str,
    reference_id: int,
    title: str,
    subtitle: str | None = None,
    image_url: str | None = None,
    item_type: str | None = None,
    external_id: int | None = None,
    rating: int | None = None,
) -> Activity:
    existing = (
        db.query(Activity)
        .filter(
            Activity.activity_type == activity_type,
            Activity.reference_id == reference_id,
        )
        .first()
    )
    
    if existing:
        existing.title = title
        existing.subtitle = subtitle
        existing.image_url = image_url
        existing.item_type = item_type
        existing.external_id = external_id
        existing.rating = rating
        db.commit()
        return existing
    
    activity = Activity(
        user_id=user_id,
        activity_type=activity_type,
        reference_id=reference_id,
        item_type=item_type,
        external_id=external_id,
        rating=rating,
        title=title,
        subtitle=subtitle,
        image_url=image_url,
    )
    db.add(activity)
    db.commit()
    return activity

def remove_activity(db: Session, *, activity_type: str, reference_id: int) -> None:
    db.query(Activity).filter(
        Activity.activity_type == activity_type,
        Activity.reference_id == reference_id,
    ).delete()
    db.commit()