export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div>
            <h1 className="text-3xl font-extrabold">{title}</h1>
            <p className="mt-2 text-slate-500">This page is coming soon.</p>
        </div>
    )
}