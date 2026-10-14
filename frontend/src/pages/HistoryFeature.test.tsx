import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { HistoryEntry, TopTrack } from '../lib/history' 

const fakeUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }

function entry(id: number, externalId: number, title: string): HistoryEntry {
    return {
        id,
        user_id: fakeUser.id,
        external_id: externalId,
        title,
        subtitle: 'Fake Artist',
        image_url: null,
        played_at: new Date().toISOString(),
    }
}

function ok(body: unknown) {
    return { ok: true, status: 200, json: async () => body }
}

function stubFetch(initial: HistoryEntry[]) {
    let entries = [...initial]

    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
            const { pathname } = new URL(url)
            const method = init?.method ?? 'GET'

            if (pathname === '/api/auth/me') return ok(fakeUser)
            if (pathname === '/api/favorites') return ok([])

            if (pathname === '/api/history/me' && method === 'DELETE') {
                entries = []
                return { ok: true, status: 204, json: async () => ({}) }
            }
            if (pathname === '/api/history/me') return ok(entries)
            
            if (pathname === '/api/history/top-tracks') {
                const counts = new Map<number, TopTrack>()
                for (const item of entries) {
                    const existing = counts.get(item.external_id)
                    if (existing) {
                        existing.play_count += 1
                    } else {
                        counts.set(item.external_id, {
                            external_id: item.external_id,
                            title: item.title,
                            subtitle: item.subtitle,
                            image_url: item.image_url,
                            play_count: 1,
                        })
                    }
                }
                return ok(
                    [...counts.values()].sort((a, b) => b.play_count - a.play_count),
                )
            }

            return { ok: false, status: 404, json: async () => ({}) }
        }),
    )
}

function renderApp(path = '/library') {
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

describe('listening history', () => {
    it('shows an empty state when there is no activity', async () => {
        const user = userEvent.setup()
        stubFetch([])
        renderApp()

        await user.click(await screen.findByRole('tab', { name: 'History' }))

        expect(await screen.findByText(/nothing played yet/i)).toBeInTheDocument()
    })

    it('lists played tracks in the history tab', async () => {
        const user = userEvent.setup()
        stubFetch([entry(1, 100, 'Played Song')])
        renderApp()

        await user.click(await screen.findByRole('tab', { name: 'History' }))
        
        expect(await screen.findByText('Played Song')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /clear history/i })).toBeInTheDocument()
    })

    it('counts plays in the top tracks tab', async () => {
        const user = userEvent.setup()
        stubFetch([
            entry(1, 100, 'Played Twice'),
            entry(2, 100, 'Played Twice'),
            entry(3, 200, 'Played Once'),
        ])
        renderApp()

        await user.click(await screen.findByRole('tab', { name: 'Top Tracks' }))

        expect(await screen.findByText('2 plays')).toBeInTheDocument()
        expect(screen.getByText('1 play')).toBeInTheDocument()
    })

    it('clears the history', async () => {
        const user = userEvent.setup()
        stubFetch([entry(1, 100, 'Played Song')])
        renderApp()

        await user.click(await screen.findByRole('tab', { name: 'History'}))
        await user.click(await screen.findByRole('button', { name: /clear history/i }))

        expect(await screen.findByText(/nothing played yet/i)).toBeInTheDocument()
    })
})