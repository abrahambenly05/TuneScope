import { apiFetch } from '../lib/api'
import type { Track } from '../types/music' 

export function getMoods(): Promise<string[]> {
    return apiFetch<string[]>('/api/discovery/moods')
}

export function getMoodTracks(mood: string): Promise<Track[]> {
    return apiFetch<Track[]>(`/api/discovery/tracks?mood=${mood}`)
}