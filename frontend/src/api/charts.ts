import { apiFetch } from '../lib/api'
import type { Album, Artist, Track } from '../types/music'

interface ListResponse<T> {
    data: T[]
}

export async function getTrendingTracks(): Promise<Track[]> {
    const result = await apiFetch<ListResponse<Track>>('/api/charts/trending')
    return result.data  
}

export async function getPopularAlbums(): Promise<Album[]> {
    const result = await apiFetch<ListResponse<Album>>('/api/charts/albums')
    return result.data  
}

export async function getPopularArtists(): Promise<Artist[]> {
    const result = await apiFetch<ListResponse<Artist>>('/api/charts/artists')
    return result.data  
}

export async function getNewReleases(): Promise<Album[]> {
    const result = await apiFetch<ListResponse<Album>>('/api/charts/new-releases')
    return result.data  
}