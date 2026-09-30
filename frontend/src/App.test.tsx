import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const fakeTrack = {
    id: 1,
    title: 'Fake Song',
    duration: 200,        
    preview: '',
    artist: { id: 1, name: 'Fake Artist' },
    album: { id: 1, title: 'Fake Album', cover_medium: 'https://example.com/cover.jpg' },
}
const fakeArtist = { id: 1, name: 'Fake Artist', picture_medium: 'https://example.com/a.jpg' }
const fakeAlbum = { id: 1, title: 'Fake Album', cover_medium: 'https://example.com/cover.jpg' }
const fakeGenre = { id: 132, name: 'Fake Genre', picture: 'https://example.com/g.jpg' }

function byChart(url: string) {
    if (url.includes('/api/charts/artists')) return [fakeArtist]
    if (url.includes('/api/charts/albums') || url.includes('/api/charts/new-releases')) {
        return [fakeAlbum]
    }
    if (url.includes('/api/genres')) return [fakeGenre]
    return [fakeTrack]
}

function stubChartsFetch() {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => ({ ok: true, json: async() => ({ data: byChart(url) }) })),
    )
}

function renderApp(path = '/') {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        </QueryClientProvider>
    )
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('App', () => {
    it('shows the hero heading on the home page', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
        renderApp()
        expect(screen.getByRole('heading', {name: /find the music/i })).toBeInTheDocument()
    })

    it('renders trending tracks and other home sections', async () => {
        stubChartsFetch()
        renderApp()
        expect(await screen.findByText('Fake Song')).toBeInTheDocument()
        expect(screen.getAllByText('Fake Artist').length).toBeGreaterThan(0)
        expect(screen.getAllByAltText('Fake Album').length).toBeGreaterThan(0)
        expect(await screen.findByText('Fake Genre')).toBeInTheDocument()
    })

    it('shows an error message when trending fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
        renderApp()
        expect(await screen.findByText(/failed to load tracks/i)).toBeInTheDocument()
    })

    it('renders the placeholder page for /library', () => {
        renderApp('/library')
        expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument()
    })
})