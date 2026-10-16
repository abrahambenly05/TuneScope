import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import TrackRow from '../components/TrackRow'
import { useMoodTracks, useMoods } from '../hooks/useDiscovery'
import { fetchPublicPlaylists } from '../lib/playlists'

function moodLabel(mood: string) {
    return mood.charAt(0).toUpperCase() + mood.slice(1)
}

function MoodPicker() {
    const [mood, setMood] = useState<string | null>(null)
    const moods = useMoods()
    const tracks = useMoodTracks(mood)

    return (
        <section className="mb-10">
            <h2 className="mb-1 text-2xl font-semibold">Find music by mood</h2>
            <p className="mb-4 text-sm text-slate-500">
                Picked from listener tags, then matched to songs you can play.
            </p>

            <div className="flex flex-wrap gap-2">
                {moods.data?.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMood(mood === item ? null : item)}
                      className={`rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold ${
                        mood === item ? 'bg-brand text-white' : 'bg-surface text-slate-600 hover:text-ink'
                      }`}
                    >
                        {moodLabel(item)}
                    </button>
                ))}
            </div>

            {mood && tracks.isLoading && (
                <p className="mt-4 text-slate-500">Finding {mood} tracks...</p>
            )}
            {mood && tracks.isError && (
                <p className="mt-4 text-red-600">Failed to load tracks</p>
            )}
            {mood && tracks.data && tracks.data.length === 0 && (
                <p className="mt-4 text-slate-500">
                    Nothing found for this mood right now.
                </p>
            )}

            {tracks.data && tracks.data.length > 0 && (
                <ul className="mt-4 rounded-3xl border border-slate-200 bg-surface p-2">
                    {tracks.data.map((track, index) => (
                        <TrackRow key={track.id} track={track} rank={index + 1} />
                    ))}
                </ul>
            )}
        </section>
    )
}

export default function PublicPlaylistPage() {
    const { data: playlists, isLoading, isError } = useQuery({
        queryKey: ['public-playlists'],
        queryFn: fetchPublicPlaylists,
    })

    return (
        <div className="mx-auto max-w-3xl p-6">
            <MoodPicker />

            <h1 className="mb-1 text-2xl font-semibold">Discover Playlist</h1>
            <p className="mb-6 text-sm text-slate-500">
                Public playlists shared by other listeners.
            </p>

            {isLoading && <p className="text-slate-500">Loading playlists...</p>}
            {isError && <p className="text-red-600">Failed to load public playlists.</p>}
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