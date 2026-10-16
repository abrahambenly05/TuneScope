import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeProvider'

const fakeTrack = { 
    id: 1, 
    title: 'Mice on Venus', 
    duration: 281,
    preview:'',
    artist: { id: 2, name: 'C418' },
    album: { id: 3, title: 'Minecraft',cover_medium: 'https://example.com/cover.jpg' },
}

function stubFetch(tracks: unknown[]) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            const { pathname } = new URL(url)

            if (pathname === '/api/auth/me') {
                return { ok: false, status: 401, json: async () => ({}) }
            }
            if (pathname === '/api/discovery/moods') {
                return { ok: true, status: 200, json: async () => ['chill', 'focus'] }
            }
            if (pathname === '/api/discovery/tracks') {
                return { ok: true, status: 200, json: async () => tracks }
            }
            return { ok: true, status: 200, json: async () => [] }
        }),
    )
}

function renderApp(path = '/discover') {
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

describe('mood discovery', () => {
    it('shows a chip for each mood', async () => {
        stubFetch([fakeTrack])
        renderApp()

        expect(await screen.findByRole('button', { name: 'Chill' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Focus' })).toBeInTheDocument() 
    })

    it('loads tracks after picking a mood', async () => {
        const user = userEvent.setup()
        stubFetch([fakeTrack])
        renderApp()

        await user.click(await screen.findByRole('button', { name: 'Chill' }))
        
        expect(await screen.findByText('Mice on Venus')).toBeInTheDocument()
    })
        
    it('clears the tracks when the same mood is picked again', async () => {
        const user = userEvent.setup()
        stubFetch([fakeTrack])
        renderApp()

        const chip = await screen.findByRole('button', { name: 'Chill' })
        await user.click(chip)
        expect(await screen.findByText('Mice on Venus')).toBeInTheDocument()

        await user.click(chip)
        expect(screen.queryByText('Mice on Venus')).not.toBeInTheDocument()
    })

    it('shows a message when a mood has no tracks', async () => {
        const user = userEvent.setup()
        stubFetch([])
        renderApp()

        await user.click(await screen.findByRole('button', { name: 'Focus'}))
        expect(await screen.findByText(/nothing found for this mood/i)).toBeInTheDocument()
    })
})