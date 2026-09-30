import { apiFetch } from '../lib/api'
import type { Genre, GenreDetail } from '../types/music'

interface ListResponse<T> {
    data: T[]
}

export async function getGenres(): Promise<Genre[]> {
    const result = await apiFetch<ListResponse<Genre>>('/api/genres')
    return result.data   
}

export const getGenre = (id: string) => apiFetch<GenreDetail>(`/api/genres/${id}`)