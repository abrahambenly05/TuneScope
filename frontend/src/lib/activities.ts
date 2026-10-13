import { apiFetch } from './api'

export type Activity = {
    id: number
    user_id: number
    owner_name: string
    activity_type: string
    reference_id: number
    item_type: string | null
    external_id: number | null
    rating: number | null
    title: string
    subtitle: string | null
    image_url: string | null
    created_at: string
}

export function fetchActivities(limit = 20): Promise<Activity[]> {
    return apiFetch<Activity[]>(`/api/activities?limit=${limit}`)
}

export function fetchMyActivities(): Promise<Activity[]> {
    return apiFetch<Activity[]>('/api/activities/me')
}