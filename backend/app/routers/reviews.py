from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse, ReviewSummary, ReviewUpdate
from app.services.activity import record_activity, remove_activity

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

def sync_review_activity(db: Session, review: Review) -> None:
    record_activity(
        db,
        user_id=review.user_id,
        activity_type="review",
        reference_id=review.id,
        item_type=review.item_type,
        external_id=review.external_id,
        rating=review.rating,
        title=review.title,
        subtitle=review.subtitle,
        image_url=review.image_url,
    )

@router.get("", response_model=list[ReviewResponse])
def list_reviews(
    item_type: str,
    external_id: int,
    db: Session = Depends(get_db),
):
    return(
        db.query(Review)
        .filter(Review.item_type == item_type, Review.external_id == external_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    
@router.get("/summary", response_model=ReviewSummary)
def get_review_summary(
    item_type: str,
    external_id: int,
    db: Session = Depends(get_db),
):
    result = (
        db.query(func.avg(Review.rating), func.count(Review.id))
        .filter(Review.item_type == item_type, Review.external_id == external_id)
        .one()
    )
    average, count = result
    return ReviewSummary(
        item_type=item_type,
        external_id=external_id,
        average_rating=round(float(average), 2) if average is not None else 0.0,
        review_count=count or 0,
    )
    
@router.get("/me", response_model=list[ReviewResponse])
def list_my_review(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )

@router.post("", response_model=ReviewResponse, status_code=201)
def create_or_update_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Review)
        .filter(
            Review.user_id == current_user.id,
            Review.item_type == payload.item_type,
            Review.external_id == payload.external_id,
        )
        .first()
    )
    
    if existing:
        existing.rating = payload.rating
        existing.comment = payload.comment
        existing.title = payload.title
        existing.subtitle = payload.subtitle
        existing.image_url = payload.image_url
        db.commit()
        db.refresh(existing)
        sync_review_activity(db, existing)
        return existing
    
    review = Review(
        user_id=current_user.id,
        item_type=payload.item_type,
        external_id=payload.external_id,
        rating=payload.rating,
        comment=payload.comment,
        title=payload.title,
        subtitle=payload.subtitle,
        image_url=payload.image_url,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    sync_review_activity(db, review)
    return review

def get_owned_review(review_id: int, db: Session, current_user: User) -> Review:
    review = (
        db.query(Review)
        .filter(Review.id == review_id, Review.user_id == current_user.id)
        .first()
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.patch("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = get_owned_review(review_id, db, current_user)
    review.rating = payload.rating
    review.comment = payload.comment
    db.commit()
    db.refresh(review)
    sync_review_activity(db, review)
    return review

@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = get_owned_review(review_id, db, current_user)
    review_id_value = review_id
    db.delete(review)
    db.commit()
    remove_activity(db, activity_type="review", reference_id=review_id_value)