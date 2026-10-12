import { apiFetch, apiPost, apiDelete } from './api'

export interface PlaylistTrack {
    id: number;
    external_id: number;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    position: number;
}

export interface Playlist {
    id: number;
    name: string;
    is_public: boolean;
    created_at: string;
}

export interface PlaylistDetail extends Playlist {
    tracks: PlaylistTrack[];
}

export interface TrackInput {
    external_id: number;
    title: string;
    subtitle?: string | null;
    image_url?: string | null;
}

export function fetchPlaylists(): Promise<Playlist[]> {
    return apiFetch('/api/playlists');
}

export function fetchPlaylistDetail(id: number): Promise<PlaylistDetail> {
    return apiFetch(`/api/playlists/${id}`);
}

export function createPlaylist(name: string): Promise<Playlist> {
    return apiPost('/api/playlists', { name });
}

export function renamePlaylist(id: number, name: string): Promise<Playlist> {
    return apiFetch(`/api/playlists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
}

export function setPlaylistVisibility(id: number, is_public: boolean): Promise<Playlist> {
    return apiFetch(`/api/playlists/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public }),
    });
}

export function deletePlaylist(id: number): Promise<void> {
    return apiDelete(`/api/playlists/${id}`);
}

export function addTrackToPlaylist(playlistId: number, track: TrackInput): Promise<PlaylistDetail> {
    return apiPost(`/api/playlists/${playlistId}/tracks`, track);
}

export function removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<PlaylistDetail> {
    return apiFetch(`/api/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
    });
}

export function reorderPlaylistTracks(
    playlistId: number,
    order: { track_id: number; position: number  } []
): Promise<PlaylistDetail> {
    return apiFetch(`/api/playlists/${playlistId}/tracks/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
    });
}

export interface PublicPlaylist extends Playlist {
    owner_name: string;
    track_count: number;
}

export interface PublicPlaylistDetail extends PublicPlaylist {
    tracks: PlaylistTrack[];
}

export function fetchPublicPlaylists(): Promise<PublicPlaylist[]> {
    return apiFetch('/api/playlists/public')
}

export function fetchPublicPlaylistDetail(id: number): Promise<PublicPlaylistDetail> {
    return apiFetch(`/api/playlists/public/${id}`)
}