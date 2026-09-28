import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

const fakeTrack = {
        id: 1,
        title: 'Fake Song',
        duration: 200,
        preview: '',
        artist: { id: 1, name: 'Fake Artist' },
        album: { id: 1, title: 'Fake Album', cover_medium: 'https://example.com/cover.jpg' },
}
const fakeArtist = {
    id: 1,
    name: 'Fake Artist',
    picture_medium: 'https://example.com/artist.jpg',
    nb_fan: 1200,
}
const fakeAlbum = {
    id: 1,
    title: 'Fake Album',
    cover_medium: 'https://example.com/cover.jpg',
    artist: { id: 1, name: 'Fake Artist' },
}

function byKind(url: string) {
    if (url.includes('/api/search/artists')) return [fakeArtist]
    if (url.includes('/api/search/albums')) return [fakeAlbum]
    return [fakeTrack]
}

function stubFetch(responder: (url: string) => unknown[]) {
    const fetchMock = vi.fn(async (url: string) => ({
        ok: true,
        json: async () => ({ data: responder(url) }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
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
        </QueryClientProvider>
    )
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('SearchPage', () => {
    it('asks for a query when none is given', () => {
        renderApp('/search')
        expect(screen.getByText(/type something to search/i)).toBeInTheDocument()
    })

    it('lists songs for the query in the URL', async () => {
        const fetchMock = stubFetch(byKind)
        renderApp('/search?q=weeknd')
        expect(await screen.findByText('Fake Song')).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/search/tracks?q=weeknd'),
        )
    })

    it('shows artists after switching to the Artists tab', async () => {
        const user = userEvent.setup()
        stubFetch(byKind)
        renderApp('/search?q=weeknd')
        await user.click(screen.getByRole('tab', { name: 'Artists' }))
        expect(await screen.findByText('1,200 fans')).toBeInTheDocument()
    })

    it('shows albums after switching to the Albums tab', async () => {
        const user = userEvent.setup()
        stubFetch(byKind)
        renderApp('/search?q=weeknd')
        await user.click(screen.getByRole('tab', { name: 'Albums' }))
        expect(await screen.findByText('Fake Album')).toBeInTheDocument()
    })

    it('shows a message when nothing is found', async () => {
        stubFetch(() => [])
        renderApp('/search?q=zzzz')
        expect(await screen.findByText(/no songs found/i)).toBeInTheDocument()
    })

    it('shows an error message when the API fails', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
        renderApp('/search?q=weeknd')
        expect(await screen.findByText(/search failed/i)).toBeInTheDocument()
    })

    it('searches with the text typed in the search bar', async() => {
        const user = userEvent.setup()
        const fetchMock = stubFetch(byKind)
        renderApp('/search')
        await user.type(screen.getByRole('textbox', { name: 'Search' }), 'blinding lights')
        await user.click(screen.getByRole('button', { name: 'Search' }))
        expect(await screen.findByText('Fake Song')).toBeInTheDocument()
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('q=blinding%20lights'),
        )
    })
})