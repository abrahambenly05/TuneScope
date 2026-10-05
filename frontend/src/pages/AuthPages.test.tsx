import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { AuthProvider } from '../auth/AuthContext'

const fakeUser = { id: 1, email: 'test@example.com', display_name: 'Test User' }

function stubFetch(handlers: Record<string, () => { status: number; body?: unknown }>) {
    vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init?: RequestInit) => {
            const path = new URL(url).pathname + (init?.method === 'POST' ? `:${init.method}` : '')
            const handler = handlers[path]
            const result = handler ? handler() : { status: 404 }
            return {
                ok: result.status < 300,
                status: result.status,
                json: async () => result.body,
            } 
        }),
    )
}

function renderApp(path: string) {
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
        </QueryClientProvider>
    )
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('auth pages', () => {
    it('redirects to login when visiting a protected route while logged out', async () => {
        stubFetch({ '/api/auth/me': () => ({ status: 401 }) })
        renderApp('/profile')
        expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    })

    it('logs in and shows the profile page', async () => {
        const user = userEvent.setup()
        stubFetch({
            '/api/auth/me': () => ({ status: 401 }),
            '/api/auth/login:POST': () => ({ status: 200, body: fakeUser }),
        })
        renderApp('/login')

        await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
        await user.type(screen.getByPlaceholderText('Password'), 'supersecret123')
        await user.click(screen.getByRole('button', { name: 'Log in' }))

        expect(await screen.findByRole('heading', { name: 'Test User' })).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('shows an error message for invalid login credentials', async () => {
        const user = userEvent.setup()
        stubFetch({
            '/api/auth/me': () => ({ status: 401 }),
            '/api/auth/login:POST': () => ({ status: 401 }),
        })
        renderApp('/login')

        await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
        await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword')
        await user.click(screen.getByRole('button', { name: 'Log in' }))

        expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
    })

    it('registers, log in automatically, and shows the profile page', async () => {
        const user = userEvent.setup()
        stubFetch({
            '/api/auth/me': () => ({ status: 401 }),
            '/api/auth/register:POST': () => ({ status: 201, body: fakeUser }),
            '/api/auth/login:POST': () => ({ status: 200, body: fakeUser }),
        })
        renderApp('/register')

        await user.type(screen.getByPlaceholderText('Display name'), 'Test User')
        await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
        await user.type(screen.getByPlaceholderText('Password (min. 8 characters)'), 'supersecret123')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        expect(await screen.findByRole('heading', { name: 'Test User' })).toBeInTheDocument()
    })

    it('shows an error when registering with an existing email', async () => {
        const user = userEvent.setup()
        stubFetch({
            '/api/auth/me': () => ({ status: 401 }),
            '/api/auth/register:POST': () => ({ status: 409 }),
        })
        renderApp('/register')

        await user.type(screen.getByPlaceholderText('Display name'), 'Test User')
        await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
        await user.type(screen.getByPlaceholderText('Password (min. 8 characters)'), 'supersecret123')
        await user.click(screen.getByRole('button', { name: 'Create account' }))

        expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
    })

    it('logs out and redirects away from the protected profile page', async () => {
        const user = userEvent.setup()
        stubFetch({
            '/api/auth/me': () => ({ status: 200, body: fakeUser }),
            '/api/auth/logout:POST': () => ({ status: 204 }),
        })
        renderApp('/profile')

        expect(await screen.findByRole('heading', { name: 'Test User' })).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Log out' }))

        expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    })
})