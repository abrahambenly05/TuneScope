import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useAddFavorite, useFavorites, useRemoveFavorite } from '../hooks/useFavorites'
import type { FavoriteItemType } from '../types/favorite'

interface FavoriteButtonProps {
    itemType: FavoriteItemType
    externalId: number
    title: string
    subtitle?: string
    imageUrl?: string
    className?: string
}

export default function FavoriteButton({
    itemType,
    externalId,
    title,
    subtitle,
    imageUrl,
    className = '',
}: FavoriteButtonProps) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { data: favorites } = useFavorites()
    const addFavorite = useAddFavorite()
    const removeFavorite = useRemoveFavorite()

    const existing = favorites?.find(
        (favorite) => favorite.item_type === itemType && favorite.external_id === externalId,
    )

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()

        if (!user) {
            navigate('/login')
            return
        }

        if (existing) {
            removeFavorite.mutate(existing.id)
        } else {
            addFavorite.mutate({
                item_type: itemType,
                external_id: externalId,
                title,
                subtitle,
                image_url: imageUrl,
            })
        }
    }

    return (
        <button
          type="button"
          onClick={handleClick}
          aria-label={existing ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={Boolean(existing)}
          className={`shrink-0 text-lg leading-none ${
            existing ? 'text-red-500' : 'text-slate-300 hover:text-red-400'
          } ${className}`}
        >
          {existing ? '♥' : '♡' }
        </button>
    )
}