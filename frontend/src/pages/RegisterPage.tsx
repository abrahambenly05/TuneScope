import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            await register({ display_name: displayName, email, password })
            navigate('/profile')
        } catch (err) {
            setError(
                err instanceof ApiError && err.status === 409
                  ? 'An account with this email already exists.'
                  : 'Something went wrong. Please try again.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-sm space-y-6">
            <h1 className="text-3xl font-extrabold">Create an account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  required
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:border-brand"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:border-brand"
                />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password (min. 8 characters)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 outline-none focus:border-brand"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-brand px-5 py-2 font-semibold text-white disabled:opacity-60"
                >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
            </form>
            <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand">
                    Log in
                </Link>
            </p>
        </div>
    )
}