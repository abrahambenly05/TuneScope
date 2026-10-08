import { apiDelete, apiFetch, apiPost } from '../lib/api'
import type { Favorite, FavoriteCreatePayload, FavoriteItemType } from '../types/favorite'

export function listFavorites(itemType?: FavoriteItemType) {
    const query = itemType ? `?item_type=${itemType}` : ''
    return apiFetch<Favorite[]>(`/api/favorites${query}`)
}

export const addFavorite = (payload: FavoriteCreatePayload) =>
    apiPost<Favorite>('/api/favorites', payload)

export const removeFavorite = (id: number) => apiDelete(`/api/favorites/${id}`)