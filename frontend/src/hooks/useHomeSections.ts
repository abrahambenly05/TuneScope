import { useQuery } from '@tanstack/react-query'
import { getNewReleases, getPopularAlbums, getPopularArtists } from '../api/charts'

export function usePopularAlbums() {
    return useQuery({ queryKey: ['popular-albums'], queryFn: getPopularAlbums })
}

export function usePopularArtists() {
    return useQuery({ queryKey: ['popular-artists'], queryFn: getPopularArtists })
}

export function useNewReleases() {
    return useQuery({ queryKey: ['new-releases'], queryFn: getNewReleases })
}