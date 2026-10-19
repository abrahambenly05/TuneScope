import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Album } from '../types/music'

export default function AlbumTile({ album }: { album: Album }) {
    const [imageFailed, setImageFailed] = useState(false)

    return (
        <li className="w-40 shrink-0">
            <Link to={`/albums/${album.id}`}>
                {album.cover_medium && !imageFailed ? (
                    <img
                     src={album.cover_medium}
                     alt={album.title}
                     onError={() => setImageFailed(true)}
                     className="aspect-square w-40 rounded-2xl object-cover"
                    />
                ) : (
                    <div
                     aria-hidden="true"
                     className="flex aspect-square w-40 items-center justify-center rounded-2xl bg-slate-200 text-3xl text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                    >
                        ♪
                    </div>
                )}
                <p className="mt-2 truncate text-sm font-semibold hover:text-brand">{album.title}</p>
            </Link>
            {album.artist && <p className="truncate text-xs text-slate-500">{album.artist.name}</p>}
        </li>
    )
}