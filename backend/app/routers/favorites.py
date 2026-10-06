from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.favorite import FavoriteCreate, FavoriteResponse

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.get("", response_model=list[FavoriteResponse])
def list_favorites(
    item_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Favorite).filter(Favorite.user_id == current_user.id)
    if item_type:
        query = query.filter(Favorite.item_type == item_type)
    return query.order_by(Favorite.created_at.desc()).all()

@router.post("", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    payload: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.item_type == payload.item_type,
            Favorite.external_id == payload.external_id,
        )
        .first()
    )
    if existing:
        return existing
    
    favorite = Favorite(user_id=current_user.id, **payload.model_dump())
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite

@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favorite = (
        db.query(Favorite)
        .filter(Favorite.id == favorite_id, Favorite.user_id == current_user.id)
        .first()
    )
    if favorite is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Favorite not found")
    
    db.delete(favorite)
    db.commit()