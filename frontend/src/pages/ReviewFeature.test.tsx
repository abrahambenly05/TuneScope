import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { Review, ReviewInput } from '../lib/reviews'

const fakeUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }
const fakeTrack = {
    id: 1,
    title: 'Fake Song',
    duration: 200,
    preview: '',
    artist: { id: 2, name: 'Fake Artist' },
    album: { id: 3, title: 'Fake Album', cover_medium: 'https://example.com/cover.jpg' },
}

function createReviewsServer(initial: Review[] = []) {
    let reviews = [...initial]
    let nextId = reviews.length ? Math.max(...reviews.map((r) => r.id)) + 1 : 1

    return (path: string, method: string, body?: unknown) => {
        if (path === '/api/reviews/summary' && method === 'GET') {
            const count = reviews.length
            const average = count
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / count
                : 0
            return {
                status: 200,
                body: {
                    item_type: 'track',
                    external_id: 1,
                    average_rating: Number(average.toFixed(2)),
                    review_count: count,
                },
            }
        }
        if (path === '/api/reviews' && method === 'GET') {
            return { status: 200, body: reviews }
        }
        if (path === '/api/reviews' && method === 'POST') {
            const payload = body as ReviewInput
            const existing = reviews.find(
                (review) =>
                    review.item_type === payload.item_type &&
                    review.external_id === payload.external_id,
            )

            if (existing) {
                const updated: Review = {
                    ...existing,
                    rating: payload.rating,
                    comment: payload.comment ?? null,
                    updated_at: new Date().toISOString(),
                }
                reviews = reviews.map((review) => (review.id === existing.id ? updated : review))
                return { status: 201, body: updated }
            }

            const review: Review = {
                id: nextId++,
                user_id: fakeUser.id,
                item_type: payload.item_type,
                external_id: payload.external_id,
                rating: payload.rating,
                comment: payload.comment ?? null,
                title: payload.title,
                subtitle: payload.subtitle ?? null,
                image_url: payload.image_url ?? null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            reviews = [...reviews, review]
            return { status: 201, body: review }
        }

        const deleteMatch = path.match(/^\/api\/reviews\/(\d+)$/)
        if (deleteMatch && method === 'DELETE') {
            reviews = reviews.filter((review) => review.id !== Number(deleteMatch[1]))
            return { status: 204 }
        }

        return { status: 404 }
    }
}

function stubFetch(reviewsHandler: ReturnType<typeof createReviewsServer>) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
            const { pathname } = new URL(url)
            const method = init?.method ?? 'GET'
            const body = init?.body ? JSON.parse(init.body as string) : undefined

            if (pathname === '/api/auth/me') {
                return { ok: true, status: 200, json: async () => fakeUser }
            }
            if (pathname === '/api/favorites') {
                return { ok: true, status: 200, json: async () => [] }
            }
            if (pathname.startsWith('/api/reviews')) {
                const result = reviewsHandler(pathname, method, body)
                return {
                    ok: result.status < 300,
                    status: result.status,
                    json: async () => result.body,
                }
            }
            if (pathname === '/api/tracks/1') {
                return { ok: true, status: 200, json: async () => fakeTrack }
            }
            return { ok: false, status: 404, json: async () => ({}) }
        }),
    )
}

function renderApp(path = '/') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[path]}>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </MemoryRouter>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

function existingReview(): Review {
    return {
        id: 1,
        user_id: fakeUser.id,
        item_type: 'track',
        external_id: 1,
        rating: 4,
        comment: 'Nice song',
        title: 'Fake Song',
        subtitle: 'Fake Artist',
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('review feature', () => {
    it('shows an empty state when a track has no reviews', async () => {
        stubFetch(createReviewsServer([]))
        renderApp('/tracks/1')

        expect(await screen.findByText(/no reviews yet/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /post review/i })).toBeDisabled()
    })

    it('posts a new review after picking a rating', async () => {
        const user = userEvent.setup()
        stubFetch(createReviewsServer([]))
        renderApp('/tracks/1')

        await user.click(await screen.findByRole('button', { name: 'Rate 5 stars' }))
        await user.click(screen.getByRole('button', { name: /post review/i }))

        expect(await screen.findByRole('button', { name: /update review/i })).toBeInTheDocument()
        expect(await screen.findByText(/5\.0 · 1 review/)).toBeInTheDocument()
    })

    it('deletes an existing review', async () => {
        const user = userEvent.setup()
        stubFetch(createReviewsServer([existingReview()]))
        renderApp('/tracks/1')

        expect(await screen.findByRole('button', { name: /update review/i })).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /delete/i }))

        expect(await screen.findByText(/no reviews yet/i)).toBeInTheDocument()
    })
})