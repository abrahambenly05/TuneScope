from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_db
from app.models.playlist import Playlist, PlaylistTrack
from app.models.user import User
from app.schemas.playlist import (
    PlaylistCreate,
    PlaylistDetailResponse,
    PlaylistRename,
    PlaylistResponse,
    PlaylistTrackResponse,
    PlaylistVisibility,
    PublicPlaylistDetailResponse,
    PublicPlaylistResponse,
    TrackAdd,
    TrackReorder,
)
from app.services.activity import record_activity, remove_activity

router = APIRouter(prefix="/api/playlists", tags=["playlists"])

def get_owned_playlist(playlist_id: int, user: User, db: Session) -> Playlist:
    playlist = (
        db.query(Playlist)
        .filter(Playlist.id == playlist_id, Playlist.user_id == user.id)
        .first()
    )
    if playlist is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Playlist not found")
    return playlist

def sync_playlist_activity(db: Session, playlist: Playlist) -> None:
    if not playlist.is_public:
        remove_activity(db, activity_type="playlist", reference_id=playlist.id)
        return
    
    track_count = len(playlist.tracks)
    record_activity(
        db,
        user_id=playlist.user_id,
        activity_type="playlist",
        reference_id=playlist.id,
        title=playlist.name,
        subtitle=f"{track_count} track{'s' if track_count != 1 else ''}",
    )

@router.get("", response_model=list[PlaylistResponse])
def list_playlists(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(Playlist)
        .filter(Playlist.user_id == current_user.id)
        .order_by(Playlist.created_at.desc())
        .all()
    )
    
@router.post("", response_model=PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    payload: PlaylistCreate,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    playlist = Playlist(user_id=current_user.id, **payload.model_dump())
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    sync_playlist_activity(db, playlist)
    return playlist

@router.get("/public", response_model=list[PublicPlaylistResponse])
def list_public_playlists(db: Session = Depends(get_db)):
    rows = (
        db.query(Playlist, User.display_name)
        .join(User, Playlist.user_id == User.id)
        .filter(Playlist.is_public.is_(True))
        .order_by(Playlist.created_at.desc())
        .all()
    )
    return [
        PublicPlaylistResponse(
            id=playlist.id,
            name=playlist.name,
            is_public=playlist.is_public,
            created_at=playlist.created_at,
            owner_name=owner_name,
            track_count=len(playlist.tracks),
        )
        for playlist, owner_name in rows
    ]
    
@router.get("/public/{playlist_id}", response_model=PublicPlaylistDetailResponse)
def get_public_playlist(playlist_id: int, db: Session = Depends(get_db)):
    row = (
        db.query(Playlist, User.display_name)
        .join(User, Playlist.user_id == User.id)
        .filter(Playlist.id == playlist_id, Playlist.is_public.is_(True))
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    playlist, owner_name = row
    return PublicPlaylistDetailResponse(
            id=playlist.id,
            name=playlist.name,
            is_public=playlist.is_public,
            created_at=playlist.created_at,
            owner_name=owner_name,
            track_count=len(playlist.tracks),
            tracks=[PlaylistTrackResponse.model_validate(track) for track in playlist.tracks],
        )

@router.get("/{playlist_id}", response_model=PlaylistDetailResponse)
def get_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    return get_owned_playlist(playlist_id, current_user, db)

@router.patch("/{playlist_id}", response_model=PlaylistResponse)
def rename_playlist(
    playlist_id: int,
    payload: PlaylistRename,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    playlist = get_owned_playlist(playlist_id, current_user, db)
    playlist.name = payload.name
    db.commit()
    db.refresh(playlist)
    sync_playlist_activity(db, playlist)
    return playlist

@router.patch("/{playlist_id}/visibility", response_model=PlaylistResponse)
def set_playlist_visibility(
    playlist_id: int,
    payload: PlaylistVisibility,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    playlist = get_owned_playlist(playlist_id, current_user, db)
    playlist.is_public = payload.is_public
    db.commit()
    db.refresh(playlist)
    sync_playlist_activity(db, playlist)
    return playlist

@router.delete("/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    playlist = get_owned_playlist(playlist_id, current_user, db)
    playlist_id_value = playlist.id
    db.delete(playlist)
    db.commit()
    remove_activity(db, activity_type="playlist", reference_id=playlist_id_value)
    
@router.post(
    "/{playlist_id}/tracks",
    response_model=PlaylistDetailResponse, 
    status_code=status.HTTP_201_CREATED,
)
def add_track(
    playlist_id: int,
    payload: TrackAdd,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    playlist = get_owned_playlist(playlist_id, current_user, db)
    
    existing = next(
        (t for t in playlist.tracks if t.external_id == payload.external_id), None 
    )
    if not existing:
        next_position = len(playlist.tracks)
        track = PlaylistTrack(
            playlist_id=playlist.id, position=next_position, **payload.model_dump()
        )
        db.add(track)
        db.commit()
        db.refresh(playlist)
        sync_playlist_activity(db, playlist)
        
    return playlist

@router.delete("/{playlist_id}/tracks/{track_id}", response_model=PlaylistDetailResponse) 
def remove_track(
    playlist_id: int,
    track_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    playlist = get_owned_playlist(playlist_id, current_user, db)
    track = next((t for t in playlist.tracks if t.id == track_id), None)
    if track is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Track not found in playlist")
    
    db.delete(track)
    db.commit()
    
    remaining = sorted(
        (t for t in playlist.tracks if t.id != track_id), key=lambda t: t.position
    )
    for index, t in enumerate(remaining):
        t.position = index
    db.commit()
    db.refresh(playlist)
    sync_playlist_activity(db, playlist)
    return playlist

@router.patch("/{playlist_id}/tracks/reorder", response_model=PlaylistDetailResponse) 
def reorder_tracks(
    playlist_id: int,
    payload: list[TrackReorder],
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
):
    playlist = get_owned_playlist(playlist_id, current_user, db)
    positions = {item.track_id: item.position for item in payload}
    
    for track in playlist.tracks:
        if track.id in positions:
            track.position = positions[track.id]
            
    db.commit()
    db.refresh(playlist)
    return playlist