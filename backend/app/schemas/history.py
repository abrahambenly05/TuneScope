from datetime import datetime

from pydantic import BaseModel, ConfigDict

class HistoryCreate(BaseModel):
    external_id: int
    title: str
    subtitle: str | None = None
    image_url: str | None = None
    
class HistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: int
    external_id: int
    title: str
    subtitle: str | None
    image_url: str | None
    played_at: datetime
    
class TopTrackResponse(BaseModel):
    external_id: int
    title: str
    subtitle: str | None
    image_url: str | None
    play_count: int