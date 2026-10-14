import { apiFetch } from '../lib/api'
import type { Track } from '../types/music'

export function getRecommendedTracks(): Promise<Track[]> {
    return apiFetch<Track[]>('/api/recommendations/tracks')
}