export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export class ApiError extends Error {
    status: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

export async function apiFetch<T>(path:string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
        ...init
    })
    if (!response.ok) {
        throw new ApiError(response.status, `Request to ${path} failed with ${response.status}`)
    }
    if (response.status === 204) {
        return undefined as T
    }
    return response.json() as Promise<T>
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: body !== undefined ? JSON.stringify(body) : undefined,
    })
}

export async function apiDelete(path: string): Promise<void> {
    await apiFetch<void>(path, { method: 'DELETE' })
}