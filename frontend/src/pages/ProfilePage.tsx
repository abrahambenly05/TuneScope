import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { fetchHistoryStats, type DailyPlays } from '../lib/history'

function StatCard({ label, value }: { label: string, value: number }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-surface p-4">
            <p className="text-3xl font-extrabold text-brand">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    )
}

function PlaysChart({ days }: { days: DailyPlays[] }) {
    const busiest = Math.max(...days.map((day) => day.plays), 1)

    return (
        <div>
            <div className="flex h-32 items-end gap-1">
                {days.map((day) => (
                    <div
                        key={day.date}
                        title={`${day.date}: ${day.plays} play${day.plays !== 1 ? 's' : ''}`}
                        className={`flex-1 rounded-t ${day.plays > 0 ? 'bg-brand' : 'bg-slate-200'}`}
                        style={{
                            height: day.plays > 0 ? `${(day.plays / busiest) * 100}%` : '4px',
                        }}
                    />
                ))}
            </div>
            <div className="mt-2 flex gap-1 text-center text-[10px] text-slate-400">
                {days.map((day) => (
                    <span key={day.date} className="flex-1">
                        {day.date.slice(8)}
                    </span>
                ))}
            </div>
        </div>
    )
}

function ListeningStats() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['history-stats'],
        queryFn: fetchHistoryStats,
    })

    if (isLoading) return <p className="text-slate-500">Loading stats...</p>
    if (isError) return <p className="text-red-600">Failed to load stats.</p>
    if (!data) return null

    if (data.total_plays === 0) {
        return (
            <p className="rounded-2xl border border-slate-200 bg-surface p-6 text-slate-500">
                Play a few songs to see your listening stats here.
            </p>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
                <StatCard label="Plays" value={data.total_plays} />
                <StatCard label="Songs" value={data.unique_tracks} />
                <StatCard label="Artists" value={data.unique_artists} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                <h3 className="mb-3 font-semibold">Last 14 days</h3>
                <PlaysChart days={data.plays_per_day} />
            </div>

            {data.top_artists.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-surface p-4">
                    <h3 className="mb-3 font-semibold">Top artists</h3>
                    <ol className="space-y-2">
                        {data.top_artists.map((artist, index) => (
                            <li key={artist.name} className="flex items-center gap-3 text-sm">
                                <span className="w-4 shrink-0 font-bold text-slate-400">
                                    {index + 1}
                                </span>
                                <span className="min-w-0 flex-1 truncate">{artist.name}</span>
                                <span className="shrink-0 text-slate-500">
                                    {artist.play_count} play{artist.play_count !== 1 ? 's' : ''}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    )
}

export default function ProfilePage() {
    const { user, logout } = useAuth()

    if (!user) return null

    return (
        <div className="max-w-2xl space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-extrabold">{user.display_name}</h1>
                <p className="text-slate-500">{user.email}</p>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-full border border-slate-200 bg-surface px-5 py-2 font-semibold text-slate-700"
                >
                    Log out
                </button>
            </div>
            
            <section className="space-y-4">
                <h2 className="text-2xl font-extrabold">Listening stats</h2>
                <ListeningStats />
            </section>
        </div>
    )
}