import { Link } from 'react-router-dom'
import type { Album } from '../types/music'

export default function AlbumTile({ album }: { album: Album }) {
    return (
        <li className="w-40 shrink-0">
            <Link to={`/albums/${album.id}`}>
                <img
                 src={album.cover_medium}
                 alt={album.title}
                 className="aspect-square w-40 rounded-2xl object-cover"
                />
                <p className="mt-2 truncate text-sm font-semibold hover:text-brand">{album.title}</p>
            </Link>
            {album.artist && <p className="truncate text-xs text-slate-500">{album.artist.name}</p>}
        </li>
    )
}