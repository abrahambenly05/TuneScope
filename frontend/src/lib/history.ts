import { apiFetch } from './api'

export type HistoryEntry = {
    id: number
    user_id: number
    external_id: number
    title: string
    subtitle: string | null
    image_url: string | null
    played_at: string
}

export type TopTrack = {
    external_id: number
    title: string
    subtitle: string | null
    image_url: string | null
    play_count: number
}

export type PlayInput = {
    external_id: number
    title: string
    subtitle?: string | null
    image_url?: string | null
}

export function recordPlay(payload: PlayInput): Promise<HistoryEntry> {
    return apiFetch<HistoryEntry>('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
}

export function fetchMyHistory(limit = 20): Promise<HistoryEntry[]> {
    return apiFetch<HistoryEntry[]>(`/api/history/me?limit=${limit}`)
}

export function fetchTopTracks(limit = 10): Promise<TopTrack[]> {
    return apiFetch<TopTrack[]>(`/api/history/top-tracks?limit=${limit}`)
}

export function clearHistory(): Promise<void> {
    return apiFetch<void>('/api/history/me', { method: 'DELETE' })
}