import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFavorite, listFavorites, removeFavorite } from '../api/favorites'
import type { FavoriteCreatePayload, FavoriteItemType } from '../types/favorite'

export function useFavorites(itemType?: FavoriteItemType) {
    return useQuery({
        queryKey: ['favorites', itemType ?? 'all'],
        queryFn: () => listFavorites(itemType),
    })
}

export function useAddFavorite() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: FavoriteCreatePayload) => addFavorite(payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    })
}

export function useRemoveFavorite() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => removeFavorite(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    })
}