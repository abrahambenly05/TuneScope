import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'
import { ThemeProvider } from '../theme/ThemeProvider'
import type { Activity } from '../lib/activities'

const fakeUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }

function reviewActivity(): Activity {
    return {
        id: 1,
        user_id: fakeUser.id,
        owner_name: 'Test User',
        activity_type: 'review',
        reference_id: 10,
        item_type: 'track',
        external_id: 1,
        rating: 4,
        title: 'Fake Song',
        subtitle: 'Fake Artist',
        image_url: 'https://example.com/cover.jpg',
        created_at: new Date().toISOString(),
    }
}

function playlistActivity(): Activity {
    return {
        id: 2,
        user_id: fakeUser.id,
        owner_name: 'Test User',
        activity_type: 'playlist',
        reference_id: 7,
        item_type: null,
        external_id: null,
        rating: null,
        title: 'Chill Mix',
        subtitle: '3 tracks',
        image_url: null,
        created_at: new Date().toISOString(),
    }
}

function stubFetch(activities: Activity[], status = 200 ) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
            const { pathname } = new URL(url)

            if (pathname === '/api/auth/me') {
                return { ok: true, status: 200, json: async () => fakeUser }
            }
            if (pathname === '/api/activities') {
                return { 
                    ok: status < 300, 
                    status, 
                    json: async () => (status < 300 ? activities : {}),
                }
            }
            return { ok: false, status: 404, json: async () => ({}) }
        }),
    )
}

function renderApp(path = '/feed') {
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

describe('activity feed', () => {
    it('shows an empty state when there is no activity', async () => {
        stubFetch([])
        renderApp()

        expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument()
    })

    it('renders a review activity with its rating', async () => {
        stubFetch([reviewActivity()])
        renderApp()

        expect(await screen.findByText(/reviewed a track/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Fake Song' })).toHaveAttribute(
            'href',
            '/tracks/1',
        )
        expect(screen.getByText('Fake Artist')).toBeInTheDocument()
        expect(screen.getByLabelText('4 out of 5')).toBeInTheDocument()
    })

    it('renders a playlist activity linking to the public playlist', async () => {
        stubFetch([playlistActivity()])
        renderApp()

        expect(await screen.findByText(/shared a playlist/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Chill Mix' })).toHaveAttribute(
            'href',
            '/discover/playlists/7',
        )
        expect(screen.getByText('3 tracks')).toBeInTheDocument()
    })

    it('shows an error message when the request fails', async () => {
        stubFetch([], 500)
        renderApp()

        expect(await screen.findByText(/failed to load activity/i)).toBeInTheDocument()
    })
})