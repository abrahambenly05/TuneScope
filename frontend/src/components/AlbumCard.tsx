import { Link } from 'react-router-dom'
import type { Album } from '../types/music'

export default function AlbumCard({ album }: { album: Album }) {
    return (
        <li>
            <Link to={`/albums/${album.id}`}>
                <img
                    src={album.cover_medium}
                    alt={album.title}
                    className="aspect-square w-full rounded-2xl object-cover" 
                />
                <p className="mt-2 truncate font-semibold">{album.title}</p>
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