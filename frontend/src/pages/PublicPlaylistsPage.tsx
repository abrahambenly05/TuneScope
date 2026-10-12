import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchPublicPlaylists } from '../lib/playlists'

export default function PublicPlaylistPage() {
    const { data: playlists, isLoading, isError } = useQuery({
        queryKey: ['public-playlists'],
        queryFn: fetchPublicPlaylists,
    })

    if (isLoading) {
        return <p className="p-6 text-slate-500">Loading playlists...</p>
    }

    if (isError) {
        return <p className="p-6 text-red-600">Failed to load public playlists.</p>
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-1 text-2xl font-semibold">Discover Playlists</h1>
            <p className="mb-6 text-sm text-slate-500">
                Public playlists shared by other listeners.
            </p>

            {playlists && playlists.length === 0 && (
                <p className="text-slate-500">No public playlists yet.</p>
            )}

            <ul className="space-y-2">
                {playlists?.map((playlist) => (
                    <li key={playlist.id}>
                        <Link
                            to={`/discover/playlists/${playlist.id}`}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:border-brand hover:bg-canvas"
                        >
                            <div>
                                <p className="font-medium">{playlist.name}</p>
                                <p className="text-sm text-slate-500">by {playlist.owner_name}</p>
                            </div>
                            <span className="text-sm text-slate-500">
                                {playlist.track_count}{' '}
                                {playlist.track_count === 1 ? 'track' : 'tracks'}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}