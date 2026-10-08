import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'

const fakeTrack = {
    id: 1,
    title: 'Fake Song',
    duration: 200, 
    preview: 'https://example.com/preview.mp3',
    artist: { id: 2, name: 'Fake Artist' },
    album: { id: 3, title: 'Fake Album', cover_medium: 'https://example.com/cover.jpg' },
}

const fakeArtist = {
    id: 2, 
    name: 'Fake Artist',
    picture_medium: 'https://example.com/artist.jpg',
    nb_fan: 500,
    top_tracks: [fakeTrack],
    albums: [{ id: 3, title: 'Fake Album', cover_medium: 'https://example.com/cover.jpg' }],
}

const fakeAlbum = {
    id: 3,
    title: 'Fake Album',
    cover_medium: 'https://example.com/cover.jpg',
    artist: { id: 2, name: 'Fake Artist' },
    nb_tracks: 1,
    tracks: { data: [fakeTrack] },
}

function stubFetch(detailResponse: unknown) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            if (url.includes('/api/auth/me')) {
                return { ok: false, status: 401, json: async () => ({}) }
            }
            if (url.includes('/api/favorites')) {
                return { ok: true, status: 200, json: async () => [] }
            }
            return { ok: true, status: 200, json: async () => detailResponse }
        }),
    )
}

function renderApp(path: string) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
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

describe('detail pages', () => {
    it('shows track detail with a play preview button', async () => {
        stubFetch(fakeTrack)
        renderApp('/tracks/1')
        expect(await screen.findByRole('heading', { name: 'Fake Song' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /play preview/i })).toBeInTheDocument()
    })

    it('shows artist detail with top tracks and albums', async () => {
        stubFetch(fakeArtist)
        renderApp('/artists/2')
        expect(await screen.findByRole('heading', { name: 'Fake Artist' })).toBeInTheDocument()
        expect(screen.getByText('Fake Song')).toBeInTheDocument()
        expect(screen.getByText('Fake Album')).toBeInTheDocument()
    })

    it('shows album detail with its track list', async () => {
        stubFetch(fakeAlbum)
        renderApp('/albums/3')
        expect(await screen.findByRole('heading', { name: 'Fake Album' })).toBeInTheDocument()
        expect(screen.getByText('Fake Song')).toBeInTheDocument()
    })

    it('shows a not-found message for a missing track', async() => {
        vi.stubGlobal(
            'fetch', 
            vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }),
        )
        renderApp('/tracks/999')
        expect(await screen.findByText(/song not found/i)).toBeInTheDocument()
    })
})