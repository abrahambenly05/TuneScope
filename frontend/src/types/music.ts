export interface Artist {
    id: number
    name: string
    picture_medium?: string
    nb_fan?: number
}

export interface Album {
    id: number
    title: string
    cover_medium?: string
    artist?: Artist
}

export interface Track {
    id: number
    title: string
    duration: number
    preview: string
    artist: Artist
    album: Album
}

export type SearchKind = 'tracks' | 'artists' | 'albums'