from datetime import datetime

from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    item_type: str
    external_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    title: str
    subtitle: str | None = None
    image_url: str | None = None

class ReviewUpdate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    
class ReviewResponse(BaseModel):
    id: int
    user_id: int
    item_type: str
    external_id: int
    rating: int
    comment: str | None
    title: str
    subtitle: str | None
    image_url: str | None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
    
class ReviewSummary(BaseModel):
    item_type: str
    external_id: int
    average_rating: float
    review_count: int