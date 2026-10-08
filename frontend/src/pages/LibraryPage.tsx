import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites'
import type { FavoriteItemType } from '../types/favorite'

const tabs: { key: FavoriteItemType; label: string; path: string }[] = [
    { key: 'track', label: 'Songs', path: 'tracks' },
    { key: 'artist', label: 'Artists', path: 'artists' },
    { key: 'album', label: 'Albums', path: 'albums' },
]

export default function LibraryPage() {
    const [tab, setTab] = useState<FavoriteItemType>('track')
    const { data: favorites, isLoading, isError} = useFavorites(tab)
    const removeFavorite = useRemoveFavorite()
    const activePath = tabs.find((t) => t.key === tab)!.path

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold">Library</h1>

            <div role="tablist" aria-label="Favorite type" className="flex gap-2">
                {tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.key}
                      onClick={() => setTab(t.key)}
                      className={`rounded-full border-slate-200 px-4 py-1.5 text-sm font-semibold ${
                        tab === t.key ? 'bg-brand text-white' : 'bg-white text-slate-600 hover:text-ink'
                      }`}
                    >
                      {t.label}
                    </button>
                ))}
            </div>

            {isLoading && <p className="text-slate-500">Loading...</p>}
            {isError && <p className="text-red-600">Failed to load favorites.</p>}
            {favorites && favorites.length === 0 && <p className="text-slate-500">No favorites yet.</p>}

            <ul className="space-y-2">
                {favorites?.map((favorite) => (
                    <li
                      key={favorite.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2"
                    >
                        <Link
                          to={`/${activePath}/${favorite.external_id}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                            {favorite.image_url && (
                                <img
                                  src={favorite.image_url}
                                  alt={favorite.title}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                            )}
                            <div className="min-w-0">
                                <p className="truncate font-semibold">{favorite.title}</p>
                                {favorite.subtitle && (
                                    <p className="truncate text-sm text-slate-500">{favorite.subtitle}</p>
                                )}
                            </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFavorite.mutate(favorite.id)}
                          aria-label="Remove from favorites"
                          className="shrink-0 text-lg text-red-500"
                        >
                          ♥
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}