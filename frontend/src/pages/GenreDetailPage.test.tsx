import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

const fakeGenreDetail = {
    id: 132,
    name: 'Pop',
    picture: 'https://example.com/pop.jpg',
    artists: [{ id: 1, name: 'Fake Artist', picture_medium: 'https://example.com/a.jpg' }]
}

function renderApp(path:string) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        </QueryClientProvider>,
    )
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('GenreDetailPage', () => {
    it('show genre name and its artists', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ok: true, json: async() => fakeGenreDetail })
        )
        renderApp('/genres/132')
        expect(await screen.findByRole('heading', { name: 'Pop' })).toBeInTheDocument()
        expect(screen.getByText('Fake Artist')).toBeInTheDocument()
    })

    it('shows a not-found message for a missing genre', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
        renderApp('/genres/999')
        expect(await screen.findByText(/genre not found/i)).toBeInTheDocument()
    })
})