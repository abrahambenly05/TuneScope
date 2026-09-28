import { useQuery } from '@tanstack/react-query'
import { searchAlbums, searchArtists, searchTracks } from '../api/search'

export function useSearchTracks(query: string) {
    return useQuery({
        queryKey: ['search', 'tracks', query],
        queryFn: () => searchTracks(query),
        enabled: query.length > 0,
    })
}

export function useSearchArtists(query: string) {
    return useQuery({
        queryKey: ['search', 'artists', query],
        queryFn: () => searchArtists(query),
        enabled: query.length > 0,
    })
}

export function useSearchAlbums(query: string) {
    return useQuery({
        queryKey: ['search', 'albums', query],
        queryFn: () => searchAlbums(query),
        enabled: query.length > 0,
    })
}