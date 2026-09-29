import { apiFetch } from '../lib/api'
import type { AlbumDetail, ArtistDetail, Track } from '../types/music'

export const getTrack = (id: string) => apiFetch<Track>(`/api/tracks/${id}`)
export const getArtist = (id: string) => apiFetch<ArtistDetail>(`/api/artists/${id}`)
export const getAlbum = (id: string) => apiFetch<AlbumDetail>(`/api/albums/${id}`)