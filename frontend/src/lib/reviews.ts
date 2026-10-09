import { apiFetch, apiPost, apiDelete } from './api'

export type ReviewItemType = 'track' | 'artist' | 'album'

export interface Review {
    id: number;
    user_id: number;
    item_type: ReviewItemType;
    external_id: number;
    rating: number;
    comment: string | null;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface ReviewSummary {
    item_type: ReviewItemType;
    external_id: number;
    average_rating: number;
    review_count: number;
}

export interface ReviewInput {
    item_type: ReviewItemType;
    external_id: number;
    rating: number;
    comment?: string | null;
    title: string;
    subtitle?: string | null
    image_url?: string | null
}

export function fetchReviews(
    itemType: ReviewItemType,
    externalId: number,
): Promise<Review[]> {
    return apiFetch(`/api/reviews?item_type=${itemType}&external_id=${externalId}`)
}

export function fetchReviewSummary(
    itemType: ReviewItemType,
    externalId: number,
): Promise<ReviewSummary> {
    return apiFetch(`/api/reviews/summary?item_type=${itemType}&external_id=${externalId}`)
}

export function fetchMyReviews(): Promise<Review[]> {
    return apiFetch('/api/reviews/me')
}

export function saveReview(review: ReviewInput): Promise<Review> {
    return apiPost('/api/reviews', review)
}

export function updateReview(
    reviewId: number,
    rating: number,
    comment: string | null,
): Promise<Review> {
    return apiFetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
    })
}

export function deleteReview(reviewId: number): Promise<void> {
    return apiDelete(`/api/reviews/${reviewId}`)
}