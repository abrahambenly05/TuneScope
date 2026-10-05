import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth'
import { ApiError } from '../lib/api'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

interface AuthContextValue {
    user: User | null
    isLoading: boolean
    login: (payload: LoginPayload) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getCurrentUser()
            .then(setUser)
            .catch((error) => {
                if (!(error instanceof ApiError && error.status === 401)) {
                    console.error(error)
                }
            })
            .finally(() => setIsLoading(false))
    }, [])

    async function login(payload: LoginPayload) {
        const loggedInUser = await loginUser(payload)
        setUser(loggedInUser)
    }

    async function register(payload: RegisterPayload) {
        await registerUser(payload)
        await login({ email: payload.email, password: payload.password })
    }

    async function logout() {
        await logoutUser()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if(!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}