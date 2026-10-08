import { Link } from 'react-router-dom'
import FavoriteButton from './FavoriteButton'
import type { Artist } from '../types/music'

export default function ArtistCard({ artist }: { artist: Artist }) {
    return (
        <li className="relative text-center">
            <FavoriteButton
              itemType="artist"
              externalId={artist.id}
              title={artist.name}
              imageUrl={artist.picture_medium}
              className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1"
            />
            <Link to={`/artists/${artist.id}`}>
                <img
                  src={artist.picture_medium}
                  alt={artist.name}
                  className="mx-auto aspect-square w-full max-w-36 rounded-full object-cover"
                />
                <p className="mt-2 truncate font-semibold hover:text-brand">{artist.name}</p>
            </Link>
            {artist.nb_fan !== undefined && (
                <p className="text-sm text-slate-500">{artist.nb_fan.toLocaleString('en-US')} fans</p>
            )}
        </li>
    )
}