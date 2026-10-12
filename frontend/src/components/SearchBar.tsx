import { useState, type FormEvent } from 'react'

interface SearchBarProps {
    initialValue?: string
    onSubmit: (query: string) => void
}

export default function SearchBar({ initialValue = '', onSubmit }: SearchBarProps) {
    const [value, setValue] = useState(initialValue)

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const trimmed = value.trim()
        if (trimmed) onSubmit(trimmed)
    }

    return (
        <form
         onSubmit={handleSubmit}
         role="search"
         className="flex max-w-lg items-center gap-2 rounded-full border border-slate-200 bg-surface p-1.5 pl-5 focus-within:border-brand"
        >
            <input
             value={value}
             onChange={(event) => setValue(event.target.value)}
             placeholder="Search songs, artists, albums"
             aria-label="Search"
             className="min-w-0 flex-1 bg-transparent py-2 outline-none"
            />
            <button type="submit" className="rounded-full bg-brand px-5 py-2 font-semibold text-white">
                Search
            </button>
        </form>
    )
}