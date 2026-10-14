import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites'
import { clearHistory, fetchMyHistory, fetchTopTracks } from '../lib/history'
import type { FavoriteItemType } from '../types/favorite'

type TabKey = FavoriteItemType | 'history' | 'top'

const tabs: { key: TabKey; label: string }[] = [
    { key: 'track', label: 'Songs' },
    { key: 'artist', label: 'Artists' },
    { key: 'album', label: 'Albums' },
    { key: 'history', label: 'History' },
    { key: 'top', label: 'Top Tracks' },
]

const favoritePaths: Record<FavoriteItemType, string> = {
    track: 'tracks',
    artist: 'artists',
    album: 'albums',
}

function FavoritesList({ type }: { type: FavoriteItemType }) {
    const { data: favorites, isLoading, isError} = useFavorites(type)
    const removeFavorite = useRemoveFavorite()
    const activePath = favoritePaths[type]

    return (
        <>
            {isLoading && <p className="text-slate-500">Loading...</p>}
            {isError && <p className="text-red-600">Failed to load favorites.</p>}
            {favorites && favorites.length === 0 && (
                <p className="text-slate-500">No favorites yet.</p>
            )}

            <ul className="space-y-2">
                {favorites?.map((favorite) => (
                    <li
                      key={favorite.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-2"
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
        </>
    )
}

function HistoryList() {
    const queryClient = useQueryClient()
    const { data, isLoading, isError } = useQuery({
        queryKey: ['history'],
        queryFn: () => fetchMyHistory(),
    })
    const clear = useMutation({
        mutationFn: clearHistory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] })
            queryClient.invalidateQueries({ queryKey: ['top-tracks'] })
        },
    })

    return (
        <>
            {isLoading && <p className="text-slate-500">Loading...</p>}
            {isError && <p className="text-red-600">Failed to load history.</p>}
            {data && data.length === 0 && (
                <p className="text-slate-500">Nothing played yet.</p>
            )}

            { data && data.length > 0 && (
                <>
                    <button
                      type="button"
                      onClick={() => clear.mutate()}
                      disabled={clear.isPending}
                      className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 hover:text-red-500 disabled:opacity-50"
                    >
                      Clear history
                    </button>

                    <ul className="space-y-2">
                        {data.map((entry) => (
                            <li
                              key={entry.id}
                              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-2"
                            >
                                <Link
                                  to={`/tracks/${entry.external_id}`}
                                  className="flex min-w-0 flex-1 items-center gap-3"
                                >
                                    {entry.image_url && (
                                        <img
                                          src={entry.image_url}
                                          alt={entry.title}
                                          className="h-12 w-12 rounded-lg object-cover" 
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{entry.title}</p>
                                        <p className="truncate text-sm text-slate-500">
                                            {entry.subtitle}
                                            {entry.subtitle && ' · '}
                                            {new Date(entry.played_at).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </>
    )
}

function TopTracksList() {
    const {data, isLoading, isError} = useQuery({
        queryKey: ['top-tracks'],
        queryFn: () => fetchTopTracks(),
    })

    return (
        <>
            {isLoading && <p className="text-slate-500">Loading...</p>}
            {isError && <p className="text-red-600">Failed to load top tracks.</p>}
            {data && data.length === 0 && (
                <p className="text-slate-500">Play a few songs to see your top tracks</p>
            )}

            <ol className="space-y-2">
                {data?.map((track, index) => (
                    <li
                      key={track.external_id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-2"
                    >
                        <span className="w-6 shrink-0 text-center font-bold text-slate-400">
                            {index + 1}
                        </span>
                        <Link
                          to={`/tracks/${track.external_id}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                            {track.image_url && (
                                <img
                                  src={track.image_url}
                                  alt={track.title}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                            )}
                            <div className="min-w-0">
                                <p className="truncate font-semibold">{track.title}</p>
                                {track.subtitle && (
                                    <p className="truncate text-sm text-slate-500">{track.subtitle}</p>
                                )}
                            </div>
                        </Link>
                        <span className="shrink-0 text-sm text-slate-500">
                            {track.play_count} play{track.play_count !== 1 ? 's' : ''}
                        </span>
                    </li>
                ))}
            </ol>
        </>
    )
}

export default function LibraryPage() {
    const [tab, setTab] = useState<TabKey>('track')

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold">Library</h1>

            <div role="tablist" aria-label="Library section" className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === t.key}
                      onClick={() => setTab(t.key)}
                      className={`rounded-full border-slate-200 px-4 py-1.5 text-sm font-semibold ${
                        tab === t.key ? 'bg-brand text-white' : 'bg-surface text-slate-600 hover:text-ink'
                      }`}
                    >
                      {t.label}
                    </button>
                ))}
            </div>

            {tab === 'history' && <HistoryList />}
            {tab === 'top' && <TopTracksList />}
            {tab !== 'history' && tab !== 'top' && <FavoritesList type={tab} />}
        </div>
    )
}