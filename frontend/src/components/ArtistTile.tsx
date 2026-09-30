import { Link } from 'react-router-dom'
import type { Artist } from '../types/music'

export default function ArtisTile({ artist }: { artist: Artist }) {
    return (
        <li className="w-28 shrink-0 text-center">
            <Link to={`/artists/${artist.id}`}>
            <img
             src={artist.picture_medium}
             alt={artist.name}
             className="mx-auto aspect-square w-28 rounded-full object-cover"
            />
            <p className="mt-2 truncate text-sm font-semibold hover:text-brand">{artist.name}</p>
            </Link>
        </li>
    )
}