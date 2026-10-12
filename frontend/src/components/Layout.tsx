import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../theme/theme'

const links = [
    { to: '/', label: 'Home', end: true, mobile: true},
    { to: '/search', label: 'Search', end: false, mobile: true },
    { to: '/discover', label: 'Discover', end: false, mobile: false },
    { to: '/library', label: 'Library', end: false, mobile: true },
    { to: '/playlists', label: 'Playlists', end: false, mobile: false },
    { to: '/profile', label: 'Profile', end: false, mobile: true },
]

const mobileLinks = links.filter((link) => link.mobile)

function linkClass({ isActive }: { isActive: boolean }) {
    return isActive ? 'font-semibold text-brand' : 'text-slate-500 hover:text-ink'
}

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="ml-auto rounded-full border border-slate-200 px-3 py-1.5 text-lg leading-none hover:border-brand"
        >
            {theme === 'dark' ? '☀' : '☾'}
        </button>
    )
}

export default function Layout() {
    return (
        <div className="min-h-screen bg-canvas text-ink">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-canvas/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-5xl items-center gap-8 px-5">
                    <NavLink to="/" className="text-xl font-extrabold text-brand">
                        TuneScope
                    </NavLink>
                    <nav aria-label="Main" className="hidden gap-6 md:flex">
                        {links.map((link) => (
                            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <ThemeToggle />
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-5 pb-28 pt-8 md:pb-12">
                <Outlet />
            </main>

            <nav
                aria-label="Mobile"
                className="fixed inset-x-0 bottom-0 flex justify-around border-t border-slate-200 bg-surface py-3 text-sm md:hidden"
            >
                {mobileLinks.map((link) => (
                    <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}