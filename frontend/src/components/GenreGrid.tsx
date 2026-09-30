import { Link } from 'react-router-dom'
import type { Genre } from '../types/music'

const palette = ['#BAE6FD', '#C4B5FD', '#FED7AA', '#A7F3D0', '#FBCFE8', '#FDE68A', '#BFDBFE']

export default function GenreGrid({ genres }: { genres: Genre[] }) {
    return (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {genres.map((genre, index) => (
                <li key={genre.id}>
                    <Link
                      to={`/genres/${genre.id}`}
                      className="flex h-24 items-end rounded-2xl p-4 font-extrabold text-slate-900"
                      style={{ backgroundColor: palette[index % palette.length] }}
                    >
                        {genre.name}
                    </Link>
                </li>
            ))}
        </ul>
    )
}