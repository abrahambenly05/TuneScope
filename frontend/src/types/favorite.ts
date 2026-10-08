export type FavoriteItemType = 'track' | 'artist' | 'album'

export interface Favorite {
    id: number
    item_type: FavoriteItemType
    external_id: number
    title: string
    subtitle: string | null
    image_url: string | null
    created_at: string
}

export interface FavoriteCreatePayload {
    item_type: FavoriteItemType
    external_id: number
    title: string
    subtitle?: string
    image_url?: string
}