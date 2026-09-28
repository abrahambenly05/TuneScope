import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const fakeTracks = [
    {
        id: 1,
        title: 'Fake Song',
        duration: 200,
        preview: '',
        artist: { id: 1, name: 'Fake Artist' },
        album: { id: 1, title: 'Fake Album', cover_medium: 'https://example.com/cover.jpg' },
    },
]

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

    it('renders trending tracks from the API', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: fakeTracks }) }),
        )
        renderApp()
        expect(await screen.findByText('Fake Song')).toBeInTheDocument()
        expect(screen.getByText('Fake Artist')).toBeInTheDocument()
    })

    it('shows an error message when the API fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
        renderApp()
        expect(await screen.findByText(/failed to load tracks/i)).toBeInTheDocument()
    })

    it('renders the placeholder page for /library', () => {
        renderApp('/library')
        expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument()
    })
})