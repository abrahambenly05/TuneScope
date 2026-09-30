import type { ReactNode } from 'react'

interface HorizontalSectionProps {
    title: string
    isLoading: boolean
    isError: boolean
    children: ReactNode
}

export default function HorizontalSection({
    title,
    isLoading,
    isError,
    children
}: HorizontalSectionProps) {
    return (
        <section>
            <h2 className="mb-4 text-2xl font-extrabold">{title}</h2>
            {isLoading && <p className="text-slate-500">Loading...</p>}
            {isError && <p className="text-red-600">Failed to load.</p>}
            {!isLoading && !isError && (
                <ul className="flex gap-5 overflow-x-auto pb-2">{children}</ul>
            )}
        </section>
    )
} 