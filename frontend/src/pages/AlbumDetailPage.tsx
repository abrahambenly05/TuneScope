import { Link, useParams } from 'react-router-dom'
import TrackRow from '../components/TrackRow'
import FavoriteButton from '../components/FavoriteButton'
import ReviewSection from '../components/ReviewSection'
import { useAlbum } from '../hooks/useDetail'

export default function AlbumDetailPage() {
    const { id = '' } = useParams()
    const { data: album, isLoading, isError } = useAlbum(id)

    if (isLoading) return <p className="text-slate-500">Loading...</p>
    if (isError || !album) return <p className="text-red-600">Album not found.</p>

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <img
                 src={album.cover_big ?? album.cover_medium}
                 alt={album.title}
                 className="h-48 w-48 shrink-0 rounded-3xl object-cover"
                />
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold">{album.title}</h1>
                        <FavoriteButton
                          itemType="album"
                          externalId={album.id}
                          title={album.title}
                          subtitle={album.artist?.name}
                          imageUrl={album.cover_medium}
                          className="text-2xl"
                        />
                    </div>
                    {album.artist && (
                        <Link 
                            to={`/artists/${album.artist.id}`} 
                            className="text-lg text-slate-600 hover:text-brand"
                        >
                            {album.artist.name}
                        </Link>
                    )}
                    <p className="text-slate-500">
                        {album.nb_tracks} songs
                        {album.release_date && ` · ${album.release_date}`}
                        {album.genres?.data[0] && ` · ${album.genres.data[0].name}`}
                    </p>
                </div>
            </div>

            <ul className="rounded-3xl border border-slate-200 bg-surface p-2">
                {album.tracks.data.map((track, index) => (
                    <TrackRow key={track.id} track={track} rank={index + 1} />
                ))}
            </ul>

            <ReviewSection
                itemType="album"
                externalId={album.id}
                title={album.title}
                subtitle={album.artist?.name}
                imageUrl={album.cover_medium}
            />
        </div>
    )
}