import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import TrackRow from '../components/TrackRow'
import { useTrendingTracks } from '../hooks/useTrendingTracks'

export default function HomePage() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const { data: tracks, isLoading, isError } = useTrendingTracks()

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const trimmed = query.trim()
        if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    }

    return (
        <div className="space-y-12">
            <section className="space-y-5">
                <h1 className="max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
                    Find the music you didn't know you wanted.
                </h1>
                <p className="max-w-lg text-slate-500">
                    Search any song, artist, or album, preview it for 30 seconds, then save it to a playlist.
                </p>
                <form
                 onSubmit={handleSubmit}
                 role="search"
                 className="flex max-w-lg items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 pl-5 focus-within:border-brand"
                >
                    <input
                     value={query}
                     onChange={(event) => setQuery(event.target.value)}
                     placeholder="Search song, artists, albums"
                     aria-label="Search"
                     className="min-w-0 flex-1 bg-transparent py-2 outline-none"
                    />
                    <button type="submit" className="rounded-full bg-brand px-5 py-2 font-semibold text-white">
                        Search
                    </button>
                </form>
            </section>

            <section>
                <h2 className="mb-4 text-2xl font-extrabold">Trending songs</h2>
                {isLoading && <p className="text-slate-500">Loading trending tracks...</p>}
                {isError && <p className="text-red-600">Failed to load tracks.</p>}
                <ul className="rounded-3xl border border-slate-200 bg-white p-2 empty:hidden">
                    {tracks?.slice(0, 10).map((track, index) => (
                        <TrackRow key={track.id} track={track} rank={index + 1} />
                    ))}
                </ul>
            </section>
        </div>
    )
}