import { apiFetch } from '../lib/api'
import type { Album, Artist, Track } from '../types/music'

interface ListResponse<T> {
    data: T[]
}

async function search<T>(kind: string, query: string): Promise<T[]> {
    const result = await apiFetch<ListResponse<T>>(
        `/api/search/${kind}?q=${encodeURIComponent(query)}`,
    )
    return result.data
}

export const searchTracks = (query: string) => search<Track>('tracks', query)
export const searchArtists = (query: string) => search<Artist>('artists', query)
export const searchAlbums = (query: string) => search<Album>('albums', query)