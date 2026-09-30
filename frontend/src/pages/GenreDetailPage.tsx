import { useParams } from 'react-router-dom'
import ArtistCard from '../components/ArtistCard'
import { useGenre } from '../hooks/useGenres'

export default function GenreDetailPage() {
    const { id = '' } = useParams()
    const { data: genre, isLoading, isError } = useGenre(id)

    if (isLoading) return <p className="text-slate-500">Loading...</p>
    if (isError || !genre) return <p className="text-red-600">Genre not found.</p>

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold">{genre.name}</h1>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
                {genre.artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                ))}
            </ul>
        </div>
    )
}