import { useNavigate } from 'react-router-dom'
import AlbumTile from '../components/AlbumTile'
import ArtistTile from '../components/ArtistTile'
import HorizontalSection from '../components/HorizontalSection'
import SearchBar from '../components/SearchBar'
import TrackRow from '../components/TrackRow'
import { useNewReleases, usePopularAlbums, usePopularArtists } from '../hooks/useHomeSections'
import { useTrendingTracks } from '../hooks/useTrendingTracks'

export default function HomePage() {
    const navigate = useNavigate()
    const trending = useTrendingTracks()
    const popularArtists = usePopularArtists()
    const popularAlbums = usePopularAlbums()
    const newReleases = useNewReleases()

    return (
        <div className="space-y-12">
            <section className="space-y-5">
                <h1 className="max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
                    Find the music you didn't know you wanted.
                </h1>
                <p className="max-w-lg text-slate-500">
                    Search any song, artist, or album, preview it for 30 seconds, then save it to a playlist.
                </p>
                <SearchBar onSubmit={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)} />
            </section>

            <section>
                <h2 className="mb-4 text-2xl font-extrabold">Trending songs</h2>
                {trending.isLoading && <p className="text-slate-500">Loading trending tracks...</p>}
                {trending.isError && <p className="text-red-600">Failed to load tracks.</p>}
                <ul className="rounded-3xl border border-slate-200 bg-white p-2 empty:hidden">
                    {trending.data?.slice(0, 10).map((track, index) => (
                        <TrackRow key={track.id} track={track} rank={index + 1} />
                    ))}
                </ul>
            </section>

            <HorizontalSection
             title="Popular artists"
             isLoading={popularArtists.isLoading}
             isError={popularArtists.isError}
            >
                {popularArtists.data?.map((artist) => (
                    <ArtistTile key={artist.id} artist={artist} />
                ))}
            </HorizontalSection>

            <HorizontalSection
             title="Popular albums"
             isLoading={popularAlbums.isLoading}
             isError={popularAlbums.isError}
            >
                {popularAlbums.data?.map((album) => (
                    <AlbumTile key={album.id} album={album} />
                ))}
            </HorizontalSection>

            <HorizontalSection
             title="New releases"
             isLoading={newReleases.isLoading}
             isError={newReleases.isError}
            >
                {newReleases.data?.map((album) => (
                    <AlbumTile key={album.id} album={album} />
                ))}
            </HorizontalSection>
        </div>
    )
}