import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'
import type { SearchKind } from '../types/music'

const tabs: { key: SearchKind; label: string }[] = [
    {key: 'tracks', label: 'Songs'},
    {key: 'artists', label: 'Artists'},
    {key: 'albums', label: 'Albums'},
]

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const query = searchParams.get('q')?.trim() ?? ''
    const [kind, setKind] = useState<SearchKind>('tracks')

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-extrabold">Search</h1>
            <SearchBar initialValue={query} onSubmit={(value) => setSearchParams({ q: value })} />
            
            {query ? (
                <>
                    <div role="tablist" aria-label="Result type" className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                             key={tab.key}
                             type="button"
                             role="tab"
                             aria-selected={kind === tab.key}
                             onClick={() => setKind(tab.key)}
                             className={`rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold ${
                                kind === tab.key ? 'bg-brand text-white' : 'bg-white text-slate-600 hover:text-ink'
                             }`}
                            >
                             {tab.label}
                            </button>
                        ))}
                    </div>
                    <SearchResults kind={kind} query={query} />
                </>
            ) : (
                <p className="text-slate-500">Type something to search.</p>
            )}
        </div>
    )
}