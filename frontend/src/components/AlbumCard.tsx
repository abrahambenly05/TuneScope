import type { Album } from '../types/music'

export default function AlbumCard({ album }: { album: Album }) {
    return (
        <li>
            <img
                src={album.cover_medium}
                alt={album.title}
                className="aspect-square w-full rounded-2xl object-cover" 
            />
            <p className="mt-2 truncate font-semibold">{album.title}</p>
            {album.artist && <p className="truncate text-sm text-slate-500">{album.artist.name}</p>}
        </li>
    )
}