import { apiFetch } from '../lib/api'
import type { Track } from '../types/music'

interface TrendingResponse {
    data: Track[]
}

export async function getTrendingTracks(): Promise<Track[]> {
    const result = await apiFetch<TrendingResponse>('/api/charts/trending')
    return result.data  
}