import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPublicPlaylistDetail, type PlaylistTrack } from '../lib/playlists'

export default function PublicPlaylistDetailPage() {
    const { id = '' } = useParams()
    const playlistId = Number(id)

    const { data: playlist, isLoading, isError } = useQuery({
        queryKey: ['public-playlist', playlistId],
        queryFn: () => fetchPublicPlaylistDetail(playlistId),
        enabled: !Number.isNaN(playlistId),
    })

    if (isLoading) {
        return <p className="p-6 text-slate-500">Loading playlist...</p>
    }

    if (isError || !playlist) {
        return <p className="p-6 text-red-600">Playlist not found.</p>
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <Link to="/discover" className="text-sm text-slate-500 hover:text-brand">
                ← Back to discover
            </Link>

            <h1 className="mt-3 text-2xl font-semibold">{playlist.name}</h1>
            <p className="mb-6 text-sm text-slate-500">
                by {playlist.owner_name} · {playlist.track_count}{' '}
                {playlist.track_count === 1 ? 'track' : 'tracks'}
            </p>

            {playlist.tracks.length === 0 ? (
                <p className="text-slate-500">This playlist has no tracks yet.</p>
            ) : (
                <ul className="space-y-2">
                    {playlist.tracks.map((track: PlaylistTrack) => (
                        <li
                            key={track.id}
                            className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                        >
                            {track.image_url && (
                                <img
                                    src={track.image_url}
                                    alt={track.title}
                                    className="h-12 w-12 rounded object-cover"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <Link
                                    to={`/tracks/${track.external_id}`}
                                    className="block truncate font-medium hover:text-brand"
                                >
                                    {track.title}
                                </Link>
                                {track.subtitle && (
                                    <p className="truncate text-sm text-slate-500">{track.subtitle}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}