import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'

const fakeGenreDetail = {
    id: 132,
    name: 'Pop',
    picture: 'https://example.com/pop.jpg',
    artists: [{ id: 1, name: 'Fake Artist', picture_medium: 'https://example.com/a.jpg' }]
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

function renderApp(path:string) {
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
        </QueryClientProvider>,
    )
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('GenreDetailPage', () => {
    it('show genre name and its artists', async () => {
        stubFetch(fakeGenreDetail)
        renderApp('/genres/132')
        expect(await screen.findByRole('heading', { name: 'Pop' })).toBeInTheDocument()
        expect(screen.getByText('Fake Artist')).toBeInTheDocument()
    })

    it('shows a not-found message for a missing genre', async () => {
        vi.stubGlobal(
            'fetch', 
            vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) }),
        )
        renderApp('/genres/999')
        expect(await screen.findByText(/genre not found/i)).toBeInTheDocument()
    })
})