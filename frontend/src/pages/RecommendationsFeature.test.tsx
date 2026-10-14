import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeProvider'

const fakeUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }

const fakeTrack = {
    id: 1,
    title: 'Recommended Song',
    duration: 200,
    preview: '',
    artist: { id: 2, name: 'New Artist' },
    album: { id: 3, title: 'New Album', cover_medium: 'https://example.com/cover.jpg' },
}

function stubFetch(recommendations: unknown[], status = 200) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            const { pathname } = new URL(url)

            if (pathname === '/api/auth/me') {
                return { ok: true, status: 200, json: async () => fakeUser }
            }
            if (pathname === '/api/favorites') {
                return { ok: true, status: 200, json: async () => [] }
            }
            if (pathname === '/api/recommendations/tracks') {
                return {
                    ok: status < 300,
                    status,
                    json: async () => (status < 300 ? recommendations : {}),
                }
            }
            return { ok: true, status: 200, json: async () => ({ data: [] }) }
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

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('recommendations', () => {
    it('shows recommended tracks on the home page', async () => {
        stubFetch([fakeTrack])
        renderApp()

        expect(await screen.findByText(/recommended for you/i)).toBeInTheDocument()
        expect(await screen.findByText('Recommended Song')).toBeInTheDocument()
    })

    it('hides the section when there is nothing to recommend', async () => {
        stubFetch([])
        renderApp()

        expect(await screen.findByText(/trending songs/i)).toBeInTheDocument()
        expect(screen.queryByText(/recommended for you/i)).not.toBeInTheDocument()
    })

    it('hides the section for a signed-out visitor', async () => {
        stubFetch([], 401)
        renderApp()

        expect(await screen.findByText(/trending songs/i)).toBeInTheDocument()
        expect(screen.queryByText(/recommended for you/i)).not.toBeInTheDocument()
    })
})