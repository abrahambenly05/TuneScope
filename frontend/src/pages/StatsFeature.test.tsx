import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { HistoryStats } from '../lib/history'

const fakeUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }

function emptyDays() {
    return Array.from({ length: 14 }, (_, index) => ({
        date: `2026-10-${String(index + 2).padStart(2, '0')}`,
        plays: 0,
    }))
}

function statsWithPlays(): HistoryStats {
    const days = emptyDays()
    days[13].plays = 5
    
    return {
        total_plays: 5,
        unique_tracks: 3,
        unique_artists: 2,
        top_artists: [
            { name: 'Artist One', play_count: 3 },
            { name: 'Artist Two', play_count: 2 },
        ],
        plays_per_day: days,
    }
}

function emptyStats(): HistoryStats {
    return {
        total_plays: 0,
        unique_tracks: 0,
        unique_artists: 0,
        top_artists: [],
        plays_per_day: emptyDays(),
    }
}

function stubFetch(stats: HistoryStats) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            const { pathname } = new URL(url)

            if (pathname === '/api/auth/me') {
                return { ok: true, status: 200, json: async () => fakeUser }
            }
            if (pathname === '/api/history/stats') {
                return { ok: true, status: 200, json: async () => stats }
            }
            return { ok: true, status: 200, json: async () => ({ data: [] }) }
        }),
    )
}

function renderApp(path = '/profile') {
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

describe('listening stats', () => {
    it('shows the summary cards', async () => {
        stubFetch(statsWithPlays())
        renderApp()

        expect(await screen.findByText('Plays')).toBeInTheDocument()
        expect(screen.getByText('Plays').closest('div')).toHaveTextContent('5')
        expect(screen.getByText('Songs').closest('div')).toHaveTextContent('3')
        expect(screen.getByText('Artists').closest('div')).toHaveTextContent('2')
    })

    it('lists the top artists with their play counts', async () => {
        stubFetch(statsWithPlays())
        renderApp()

        expect(await screen.findByText('Artist One')).toBeInTheDocument()
        expect(screen.getByText('3 plays')).toBeInTheDocument()
        expect(screen.getByText('2 plays')).toBeInTheDocument()
    })
        
    it('draws one bar for each of the last 14 days', async () => {
        stubFetch(statsWithPlays())
        renderApp()

        expect(await screen.findByText('Last 14 days')).toBeInTheDocument()
        expect(screen.getAllByTitle(/plays?$/)).toHaveLength(14)
    })

    it('shows an empty state when nothing has been played', async () => {
        stubFetch(emptyStats())
        renderApp()

        expect(await screen.findByText(/play a few songs/i)).toBeInTheDocument()
        expect(screen.queryByText('Last 14 days')).not.toBeInTheDocument()
    })
})