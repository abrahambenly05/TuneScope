import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { fetchActivities, type Activity } from '../lib/activities'

function timeAgo(iso: string): string {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (seconds < 60) return 'just now'

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    return new Date(iso).toLocaleDateString()
}

function activityLink(activity: Activity): string {
    if (activity.activity_type === 'playlist') {
        return `/discover/playlists/${activity.reference_id}`
    }
    return `/${activity.item_type}s/${activity.external_id}`
}

function ActivityCard({ activity }: { activity: Activity }) {
    const isReview = activity.activity_type === 'review'

    return (
        <li className="rounded-2xl border border-slate-200 bg-surface p-4">
            <div className="flex items-start gap-4">
                {activity.image_url ? (
                    <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover" 
                    />
                ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                        ♫
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold text-ink">{activity.owner_name}</span>{' '}
                        {isReview ? `reviewed a ${activity.item_type}` : 'shared a playlist'}
                        {' · '}
                        {timeAgo(activity.created_at)}
                    </p>

                    <Link
                        to={activityLink(activity)}
                        className="mt-1 block truncate font-semibold text-ink hover:text-brand"
                    >
                        {activity.title}
                    </Link>

                    {activity.subtitle && (
                        <p className="truncate text-sm text-slate-500">{activity.subtitle}</p>
                    )}

                    {isReview && activity.rating !== null && (
                        <p className="mt-1 text-sm text-accent" aria-label={`${activity.rating} out of 5`}>
                            {'★'.repeat(activity.rating)}
                            <span className="text-slate-300">{'★'.repeat(5 - activity.rating)}</span>
                        </p>
                    )}
                </div>
            </div>
        </li>
    )
}

export default function FeedPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['activities'],
        queryFn: () => fetchActivities(),
    })

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-ink">Activity Feed</h1>
                <p className="text-sm text-slate-500">
                    See what the community is reviewing and sharing.
                </p>
            </header>

            {isLoading && <p className="text-slate-500">Loading activity...</p>}
            {isError && <p className="text-red-500">Failed to load activity.</p>}

            {data && data.length === 0 && (
                <p className="rounded-2xl border border-slate-200 bg-surface p-6 text-center text-slate-500">
                    No activity yet. Write a review or make a playlist public to get started.
                </p>
            )}

            {data && data.length > 0 && (
                <ul className="space-y-3">
                    {data.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                    ))}
                </ul>
            )}
        </div>
    )
}