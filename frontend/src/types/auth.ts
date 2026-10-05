export interface User {
    id: number
    email: string
    display_name: string
}

export interface RegisterPayload {
    email: string
    password: string
    display_name: string
}

export interface LoginPayload {
    email: string
    password: string
}