import { useParams } from 'react-router-dom'
import AlbumCard from '../components/AlbumCard'
import TrackRow from '../components/TrackRow'
import FavoriteButton from '../components/FavoriteButton'
import ReviewSection from '../components/ReviewSection'
import { useArtist } from '../hooks/useDetail'

export default function ArtistDetailPage() {
    const { id = '' } = useParams()
    const { data: artist, isLoading, isError } = useArtist(id)

    if (isLoading) return <p className="text-slate-500">Loading...</p>
    if (isError || !artist) return <p className="text-red-600">Artist not found.</p>

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-6">
                <img
                    src={artist.picture_big ?? artist.picture_medium}
                    alt={artist.name}
                    className="h-32 w-32 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold">{artist.name}</h1>
                        <FavoriteButton
                          itemType="artist"
                          externalId={artist.id}
                          title={artist.name}
                          imageUrl={artist.picture_medium}
                          className="text-2xl"
                        />
                    </div>
                    {artist.nb_fan !== undefined && (
                        <p className="text-slate-500">{artist.nb_fan.toLocaleString('en-US')} fans</p>
                    )}
                </div>
            </div>

            <section>
                <h2 className="mb-4 text-2xl font-extrabold">Popular songs</h2>
                <ul className="rounded-3xl border border-slate-200 bg-white p-2">
                    {artist.top_tracks.slice(0, 10).map((track, index) => (
                        <TrackRow key={track.id} track={track} rank={index + 1} />
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="mb-4 text-2xl font-extrabold">Albums</h2>
                <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
                    {artist.albums.map((album) => (
                        <AlbumCard key={album.id} album={album} />
                    ))}
                </ul>
            </section>

            <ReviewSection
                itemType="artist"
                externalId={artist.id}
                title={artist.name}
                imageUrl={artist.picture_medium}
            />
        </div>
    )
}