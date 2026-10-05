import { apiFetch, apiPost } from '../lib/api'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

export const registerUser = (payload: RegisterPayload) =>
    apiPost<User>('/api/auth/register', payload)

export const loginUser = (payload: LoginPayload) => apiPost<User>('/api/auth/login', payload)

export const logoutUser = () => apiPost<void>('/api/auth/logout')

export const getCurrentUser = () => apiFetch<User>('/api/auth/me')