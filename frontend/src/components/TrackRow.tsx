import type { Track } from '../types/music'

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const rest = String(seconds % 60).padStart(2, '0')
    return `${minutes}:${rest}`
}

interface TrackRowProps {
    track: Track
    rank: number
}

export default function TrackRow({ track, rank }: TrackRowProps) {
    return (
        <li className="grid grid-cols-[1.5rem_3rem_1fr_auto] items-center gap-3 rounded-2xl p-2 hover:bg-canvas">
            <span className="text-center text-sm font-semibold text-slate-400">{rank}</span>
            <img
                src={track.album.cover_medium}
                alt={track.album.title}
                className="h-12 w-12 rounded-lg object-cover"
            />
            <div className="min-w-0">
                <p className="truncate font-semibold">{track.title}</p>
                <p className="truncate text-sm text-slate-500">{track.artist.name}</p>
            </div>
            <span className="text-sm text-slate-500">{formatDuration(track.duration)}</span>
        </li>
    )
}