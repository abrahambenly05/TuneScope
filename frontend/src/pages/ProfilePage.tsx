import { useAuth } from '../auth/AuthContext'

export default function ProfilePage() {
    const { user, logout } = useAuth()

    if (!user) return null

    return (
        <div className="max-w-sm space-y-6">
            <h1 className="text-3xl font-extrabold">{user.display_name}</h1>
            <p className="text-slate-500">{user.email}</p>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 font-semibold text-slate-700"
            >
                Log out
            </button>
        </div>
    )
}