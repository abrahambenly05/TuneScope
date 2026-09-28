import type { Artist } from '../types/music'

export default function ArtistCard({ artist }: { artist: Artist }) {
    return (
        <li className="text-center">
            <img
             src={artist.picture_medium}
             alt={artist.name}
             className="mx-auto aspect-square w-full max-w-36 rounded-full object-cover"
            />
            <p className="mt-2 truncate font-semibold">{artist.name}</p>
            {artist.nb_fan !== undefined && (
                <p className="text-sm text-slate-500">{artist.nb_fan.toLocaleString('en-US')} fans</p>
            )}
        </li>
    )
}