from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

class PlaylistCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    is_public: bool = False
    
class PlaylistRename(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    
class PlaylistVisibility(BaseModel):
    is_public: bool
    
class TrackAdd(BaseModel):
    external_id: int
    title: str
    subtitle: str | None = None
    image_url: str | None = None

class TrackReorder(BaseModel):
    track_id: int
    position: int
    
class PlaylistTrackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    external_id: int
    title: str
    subtitle: str | None
    image_url: str | None
    position: int
    
class PlaylistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    is_public: bool
    created_at: datetime

class PlaylistDetailResponse(PlaylistResponse):
    tracks: list[PlaylistTrackResponse]
    
class PublicPlaylistResponse(PlaylistResponse):
    owner_name: str
    track_count: int
    
class PublicPlaylistDetailResponse(PublicPlaylistResponse):
    tracks: list[PlaylistTrackResponse]