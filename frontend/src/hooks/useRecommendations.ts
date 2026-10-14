import { useQuery } from '@tanstack/react-query'
import { getRecommendedTracks } from '../api/recommendations'

export function useRecommendations() {
    return useQuery({
        queryKey: ['recommendations'],
        queryFn: getRecommendedTracks,
        retry: false,
    })
}