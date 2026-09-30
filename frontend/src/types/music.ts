export interface Artist {
    id: number
    name: string
    picture_medium?: string
    picture_big?: string
    nb_fan?: number
    nb_album?: number
}

export interface Album {
    id: number
    title: string
    cover_medium?: string
    cover_big?: string
    artist?: Artist
    release_date?: string
    nb_tracks?: number
    genres?: { data: { id: number; name: string }[] }
}

export interface Track {
    id: number
    title: string
    duration: number
    preview: string
    artist: Artist
    album: Album
    release_date?: string
}

export interface ArtistDetail extends Artist {
    top_tracks: Track[]
    albums: Album[]
}

export interface AlbumDetail extends Album {
    tracks: { data: Track[] }
}

export type SearchKind = 'tracks' | 'artists' | 'albums'

export interface Genre {
    id: number
    name: string
    picture: string
}

export interface GenreDetail extends Genre {
    artists: Artist[]
}