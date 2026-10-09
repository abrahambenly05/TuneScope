import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import StarRating from './StarRating'
import {
    deleteReview,
    fetchReviewSummary,
    fetchReviews,
    saveReview,
    type Review,
    type ReviewItemType
} from '../lib/reviews'

interface ReviewSectionProps {
    itemType: ReviewItemType
    externalId: number
    title: string
    subtitle?: string
    imageUrl?: string
}

function formatDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default function ReviewSection({
    itemType,
    externalId,
    title,
    subtitle,
    imageUrl,
}: ReviewSectionProps) {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const [ rating, setRating ] = useState(0)
    const [ comment, setComment ] = useState('')

    const { data: summary } = useQuery({
        queryKey: ['review-summary', itemType, externalId],
        queryFn: () => fetchReviewSummary(itemType, externalId),
    })

    const { data: reviews } = useQuery({
        queryKey: ['reviews', itemType, externalId],
        queryFn: () => fetchReviews(itemType, externalId),
    })

    const myReview = reviews?.find((review) => review.user_id === user?.id)
    const otherReviews = reviews?.filter((review) => review.user_id !== user?.id) ?? []

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRating(myReview?.rating ?? 0)
        setComment(myReview?.comment ?? '')
    }, [myReview?.id, myReview?.rating, myReview?.comment])

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', itemType, externalId] })
        queryClient.invalidateQueries({ queryKey: ['review-summary', itemType, externalId] })
    }

    const saveMutation = useMutation({
        mutationFn: () =>
            saveReview({
                item_type: itemType,
                external_id: externalId,
                rating,
                comment: comment.trim() || null,
                title,
                subtitle,
                image_url: imageUrl,
            }),
        onSuccess: invalidate,
    })

    const deleteMutation = useMutation({
        mutationFn: (reviewId: number) => deleteReview(reviewId),
        onSuccess: () => {
            invalidate()
            setRating(0)
            setComment('')
        },
    })

    function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (rating < 1) return
        saveMutation.mutate()
    }

    return (
        <section className="mt-10 space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">Reviews</h2>
                {summary && summary.review_count > 0 ? (
                    <div className="flex items-center gap-2">
                        <StarRating value={summary.average_rating} size="sm" />
                        <span className="text-sm text-slate-500">
                            {summary.average_rating.toFixed(1)} · {summary.review_count}{' '}
                            {summary.review_count === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>
                ) : (
                    <span className="text-sm text-slate-500">No reviews yet</span>
                )}
            </div>

            {user ? (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-3 rounded-2xl border border-slate-200 p-4"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                            {myReview ? 'Your review' : 'Write a review'}
                        </span>
                        <StarRating value={rating} onChange={setRating} />
                    </div>

                    <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Share your thoughts (optional)"
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={rating < 1 || saveMutation.isPending}
                            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-soft disabled:opacity-50"
                        >
                            {myReview ? 'Update review' : 'Post review'}
                        </button>

                        {myReview && (
                            <button
                                type="button"
                                onClick={() => deleteMutation.mutate(myReview.id)}
                                disabled={deleteMutation.isPending}
                                className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                Delete
                            </button>
                        )}

                        {rating < 1 && (
                            <span className="text-xs text-slate-400">Pick a rating first</span>
                        )}
                    </div>
                </form>
            ) : (
                <p className="text-sm text-slate-500">
                    <Link to="/login" className="text-brand hover:underline">
                        Log in
                    </Link>{' '}
                    to write a review.
                </p>
            )}

            {otherReviews.length > 0 && (
                <ul className="space-y-4">
                    {otherReviews.map((review: Review) => (
                        <li key={review.id} className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-center gap-2">
                                <StarRating value={review.rating} size="sm" />
                                <span className="text-xs text-slate-400">
                                    {formatDate(review.created_at)}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}