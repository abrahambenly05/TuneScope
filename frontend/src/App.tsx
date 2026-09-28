import { useTrendingTracks } from './hooks/useTrendingTracks'

export default function App() {
  const { data: tracks, isLoading, isError } = useTrendingTracks()

  return (
    <main className="min-h-screen bg-sky-50 p-6 text-slate-900">
      <h1 className="mb-4 text-3xl font-bold text-blue-600">TuneScope</h1>

      {isLoading && <p>Loading trending tracks...</p>}
      {isError && <p className="text-red-600">Failed to load tracks.</p>}

      <ul className="space-y-2">
        {tracks?.slice(0, 5).map((track) => (
          <li key={track.id} className="flex items-center gap-3">
            <img src={track.album.cover_medium} alt={track.album.title} className="h-12 w-12 rounded" />
            <div>
              <p className="font-semibold">{track.title}</p>
              <p className="text-sm text-slate-500">{track.artist.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
