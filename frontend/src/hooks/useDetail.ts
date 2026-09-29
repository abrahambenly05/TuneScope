import { useQuery } from '@tanstack/react-query'
import { getAlbum, getArtist, getTrack } from '../api/detail'

export function useTrack(id: string) {
    return useQuery({ queryKey: ['track', id], queryFn: () => getTrack(id) })
}

export function useArtist(id: string) {
    return useQuery({ queryKey: ['artist', id], queryFn: () => getArtist(id) })
}

export function useAlbum(id: string) {
    return useQuery({ queryKey: ['album', id], queryFn: () => getAlbum(id) })
}