import { useQuery } from '@tanstack/react-query'
import { getGenre, getGenres } from '../api/genres'

export function useGenres() {
    return useQuery({ queryKey: ['genres'], queryFn: getGenres })
}

export function useGenre(id: string) {
    return useQuery({ queryKey: ['genre', id], queryFn: () => getGenre(id) })
}