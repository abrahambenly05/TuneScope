import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
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

function renderApp() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    )
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('App', () => {
    it('shows the app name', () => {
        vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
        renderApp()
        expect(screen.getByRole('heading', {name: /tunescope/i })).toBeInTheDocument()
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
})