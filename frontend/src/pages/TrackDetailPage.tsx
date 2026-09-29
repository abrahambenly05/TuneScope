import { Link, useParams } from 'react-router-dom'
import PlayPreviewButton from '../components/PlayPreviewButton'
import { useTrack } from '../hooks/useDetail'

function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60)
    const rest = String(seconds % 60).padStart(2, '0')
    return `${minutes}:${rest}`
}

export default function TrackDetailPage() {
    const { id = '' } = useParams()
    const { data: track, isLoading, isError } = useTrack(id)

    if (isLoading) return <p className="text-slate-500">Loading...</p>
    if (isError ||  !track) return <p className="text-red-600">Song not found.</p>

    return (
        <div className="flex flex-col gap-8 sm:flex-row">
            <img
                src={track.album.cover_big ?? track.album.cover_medium}
                alt={track.album.title}
                className="h-56 w-56 shrink-0 rounded-3xl object-cover"
            />
            <div className="space-y-3">
                <h1 className="text-3xl font-extrabold">{track.title}</h1>
                <Link to={`/artists/${track.artist.id}`} className="text-lg text-slate-600 hover:text-brand">
                    {track.artist.name}
                </Link>
                <p className="text-slate-500">
                    <Link to={`/albums/${track.album.id}`} className="hover:text-brand">
                        {track.album.title}
                    </Link>
                    {' · '}
                    {formatDuration(track.duration)}
                    {track.release_date && ` · ${track.release_date}`}
                </p>
                {track.preview && <PlayPreviewButton src={track.preview} />}
            </div>
        </div>
    )
}