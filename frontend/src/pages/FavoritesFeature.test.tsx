import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import type { Favorite, FavoriteCreatePayload } from '../types/favorite'

const fakeUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }
const fakeTrack = {
    id: 1,
    title: 'Fake Song',
    duration: 200,
    preview: '',
    artist: { id: 2, name: 'Fake Artist' },
    album: { id: 3, title: 'Fake Album',cover_medium: 'https://example.com/cover.jpg' },
}

function createFavoritesServer(initial: Favorite[] = []) {
    let favorites = [...initial]
    let nextId = favorites.length ? Math.max(...favorites.map((f) => f.id)) + 1 : 1

    return (path: string, method: string, body?: unknown) => {
        if (path === '/api/favorites' && method === 'GET') {
            return { status: 200, body: favorites }
        }
        if (path === '/api/favorites' && method === 'POST') {
            const payload = body as FavoriteCreatePayload
            const favorite: Favorite = {
                id: nextId++,
                item_type: payload.item_type,
                external_id: payload.external_id,
                title: payload.title,
                subtitle: payload.subtitle ?? null,
                image_url: payload.image_url ?? null,
                created_at: new Date().toISOString(),
            }
            favorites = [...favorites, favorite]
            return { status: 201, body: favorite }
        }
        const deleteMatch = path.match(/^\/api\/favorites\/(\d+)$/)
        if (deleteMatch && method === 'DELETE') {
            favorites = favorites.filter((f) => f.id !== Number(deleteMatch[1]))
            return { status: 204 }
        }
        return { status: 404 }
    }
}

function stubFetch(
    favoritesHandler: ReturnType<typeof createFavoritesServer>,
    trackResponse: unknown = fakeTrack,
) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
            const { pathname } = new URL(url)
            const method = init?.method ?? 'GET'
            const body = init?.body ? JSON.parse(init.body as string) : undefined

            if (pathname === '/api/auth/me') {
                return { ok: true, status: 200, json: async () => fakeUser }
            }
            if (pathname.startsWith('/api/favorites')) {
                const result = favoritesHandler(pathname, method, body)
                return { ok: result.status < 300, status: result.status, json: async () => result.body }
            }
            if (pathname === '/api/tracks/1') {
                return { ok: true, status: 200, json: async () => trackResponse}
            }
            return { ok: false, status: 404, json: async () => ({}) }
        }),
    )
}

function renderApp(path: string) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false} },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('favorites feature', () => {
    it('shows an empty library when there are no favorites', async () => {
        stubFetch(createFavoritesServer([]))
        renderApp('/library')
        expect(await screen.findByText(/no favorites yet/i)).toBeInTheDocument()
    })

    it('adds a track to favorites from the track detail page', async () => {
        const user = userEvent.setup()
        stubFetch(createFavoritesServer([]))
        renderApp('/tracks/1')

        const button = await screen.findByRole('button', { name: 'Add to favorites' })
        await user.click(button)

        expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toBeInTheDocument()
    })

    it('removes a favorite from the library list', async() => {
        const user = userEvent.setup()
        const favorite: Favorite = {
            id: 1, 
            item_type: 'track',
            external_id: 1,
            title: 'Fake Song',
            subtitle: 'Fake Artist',
            image_url: null,
            created_at: new Date().toISOString(),
        }
        stubFetch(createFavoritesServer([favorite]))
        renderApp('/library')

        expect(await screen.findByText('Fake Song')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Remove from favorites' }))

        expect(await screen.findByText(/no favorites yet/i)).toBeInTheDocument()
    })
})