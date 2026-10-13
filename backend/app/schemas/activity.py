from datetime import datetime

from pydantic import BaseModel

class ActivityResponse(BaseModel):
    id: int
    user_id: int
    owner_name: str
    activity_type: str
    reference_id: int
    item_type: str | None
    external_id: int | None
    rating: int | None
    title: str
    subtitle: str | None
    image_url: str | None
    created_at: datetime