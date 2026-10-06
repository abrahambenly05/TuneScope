from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

class FavoriteCreate(BaseModel):
    item_type: Literal["track", "artist", "album"]
    external_id: int
    title: str
    subtitle: str | None = None
    image_url: str | None = None
    
class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    item_type: str
    external_id: int
    title: str
    subtitle: str | None
    image_url: str | None
    created_at: datetime