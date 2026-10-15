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
    
class TopArtistResponse(BaseModel):
    name: str
    play_count: int
    
class DailyPlaysResponse(BaseModel):
    date: str
    plays: int
    
class HistoryStatsResponse(BaseModel):
    total_plays: int
    unique_tracks: int
    unique_artists: int
    top_artists: list[TopArtistResponse]
    plays_per_day: list[DailyPlaysResponse]