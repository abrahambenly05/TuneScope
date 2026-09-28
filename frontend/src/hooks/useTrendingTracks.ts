import { useQuery } from '@tanstack/react-query'
import { getTrendingTracks } from '../api/charts'

export function useTrendingTracks() {
    return useQuery({
        queryKey: ['trending-tracks'],
        queryFn: getTrendingTracks,
    })
}