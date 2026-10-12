import { useSearchAlbums, useSearchArtists, useSearchTracks } from '../hooks/useSearch'
import type { SearchKind } from '../types/music'
import AlbumCard from './AlbumCard'
import ArtistCard from './ArtistCard'
import TrackRow from './TrackRow'

interface ResultsProps {
    query: string
}

function TrackResults({ query }: ResultsProps) {
    const { data, isLoading, isError } = useSearchTracks(query)
    if (isLoading) return <p className="text-slate-500">Searching...</p>
    if (isError) return <p className="text-red-600">Search failed. Please try again.</p>
    if (!data || data.length === 0) {
        return <p className="text-slate-500">No songs found for "{query}".</p>
    }
    return (
        <ul className="rounded-3xl border border-slate-200 bg-surface p-2">
            {data.map((track, index) => (
                <TrackRow key={track.id} track={track} rank={index + 1} />
            ))}
        </ul>
    )
}

function ArtistResults({ query }: ResultsProps) {
    const { data, isLoading, isError } = useSearchArtists(query)
    if (isLoading) return <p className="text-slate-500">Searching...</p>
    if (isError) return <p className="text-red-600">Search failed. Please try again.</p>
    if (!data || data.length === 0) {
        return <p className="text-slate-500">No artists found for "{query}".</p>
    }
    return (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {data.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
            ))}
        </ul>
    )
}

function AlbumResults({ query }: ResultsProps) {
    const { data, isLoading, isError } = useSearchAlbums(query)
    if (isLoading) return <p className="text-slate-500">Searching...</p>
    if (isError) return <p className="text-red-600">Search failed. Please try again.</p>
    if (!data || data.length === 0) {
        return <p className="text-slate-500">No albums found for "{query}".</p>
    }
    return (
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
            {data.map((album) => (
                <AlbumCard key={album.id} album={album} />
            ))}
        </ul>
    )
}

export default function SearchResults({ kind, query }: { kind: SearchKind; query: string }) {
    if (kind === 'artists') return <ArtistResults query={query} />
    if (kind === 'albums') return <AlbumResults query={query} />
    return <TrackResults query={query} />
}