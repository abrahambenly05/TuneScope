import { useQuery } from '@tanstack/react-query'
import { getMoodTracks, getMoods } from '../api/discovery'

export function useMoods() {
    return useQuery({
        queryKey: ['moods'],
        queryFn: getMoods,
    })
}

export function useMoodTracks(mood: string | null) {
    return useQuery({
        queryKey: ['mood-tracks', mood],
        queryFn: () => getMoodTracks(mood as string),
        enabled: mood !== null,
    })
}