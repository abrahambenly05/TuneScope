import { Link } from 'react-router-dom'
import FavoriteButton from './FavoriteButton'
import type { Album } from '../types/music'

export default function AlbumCard({ album }: { album: Album }) {
    return (
        <li className="relative">
            <FavoriteButton
              itemType="album"
              externalId={album.id}
              title={album.title}
              subtitle={album.artist?.name}
              imageUrl={album.cover_medium}
              className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1"
            />
            <Link to={`/albums/${album.id}`}>
                <img
                    src={album.cover_medium}
                    alt={album.title}
                    className="aspect-square w-full rounded-2xl object-cover" 
                />
                <p className="mt-2 truncate font-semibold hover:text-brand">{album.title}</p>
            </Link>
            {album.artist && (
                <Link
                  to={`/artists/${album.artist.id}`}
                  className="truncate text-sm text-slate-500 hover:text-brand"
                >
                  {album.artist.name}
                </Link>
            )}
        </li>
    )
}