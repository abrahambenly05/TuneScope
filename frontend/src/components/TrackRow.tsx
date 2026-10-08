import { Link } from 'react-router-dom'
import FavoriteButton from './FavoriteButton'
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
            <Link to={`/tracks/${track.id}`}>
                <img
                    src={track.album.cover_medium}
                    alt={track.album.title}
                    className="h-12 w-12 rounded-lg object-cover"
                />
            </Link>
            <div className="min-w-0">
                <Link to={`/tracks/${track.id}`} className="block truncate font-semibold hover:text-brand">
                    {track.title}
                </Link>
                <Link
                    to={`/artists/${track.artist.id}`}
                    className="block truncate text-sm text-slate-500 hover:text-brand"
                >
                    {track.artist.name}
                </Link>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">{formatDuration(track.duration)}</span>
                <FavoriteButton
                  itemType="track"
                  externalId={track.id}
                  title={track.title}
                  subtitle={track.artist.name}
                  imageUrl={track.album.cover_medium}
                />
            </div>
        </li>
    )
}