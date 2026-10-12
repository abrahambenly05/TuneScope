import { useState, type FormEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { addTrackToPlaylist, createPlaylist, fetchPlaylists } from '../lib/playlists'

interface AddToPlaylistButtonProps {
    externalId: number
    title: string
    subtitle?: string
    imageUrl?: string
    className?: string
}

export default function AddToPlaylistButton({
    externalId,
    title,
    subtitle,
    imageUrl,
    className = '',
}: AddToPlaylistButtonProps) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [isOpen, setIsOpen] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [addedTo, setAddedTo] = useState<Set<number>>(new Set())

    const { data: playlists } = useQuery({
        queryKey: ['playlists'],
        queryFn: fetchPlaylists,
        enabled: isOpen && Boolean(user),
    })

    const addMutation = useMutation({
        mutationFn: (playlistId: number) =>
            addTrackToPlaylist(playlistId, {
                external_id: externalId,
                title,
                subtitle,
                image_url: imageUrl,
            }),
        onSuccess: (_data, playlistId) => {
            setAddedTo((prev) => new Set(prev).add(playlistId))
            queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] })
        },
    })

    const createMutation = useMutation({
        mutationFn: (name: string) => createPlaylist(name),
        onSuccess: (playlist) => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] })
            setNewPlaylistName('')
            addMutation.mutate(playlist.id)
        },
    })

    function handleToggle(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        event.stopPropagation()

        if (!user) {
            navigate('/login')
            return
        }

        setIsOpen((prev) => !prev)
    }

    function handleAddToExisting(event: MouseEvent<HTMLButtonElement>, playlistId: number) {
        event.preventDefault()
        event.stopPropagation()
        addMutation.mutate(playlistId)
    }

    function handleCreateAndAdd(event: FormEvent) {
        event.preventDefault()
        const trimmed = newPlaylistName.trim()
        if (!trimmed) return
        createMutation.mutate(trimmed)
    }

    function closeDropdown(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault()
        event.stopPropagation()
        setIsOpen(false)
    }

    return (
        <div className={`relative shrink-0 ${className}`}>
            <button
                type="button"
                onClick={handleToggle}
                aria-label="Add to playlist"
                aria-expanded={isOpen}
                className="text-lg leading-none text-slate-300 hover:text-brand"
            >
                +
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={closeDropdown} />
                    <div
                        className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-surface p-2 shadow-lg"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <p className="mb-1 px-2 text-xs font-semibold uppercase text-slate-400">
                            Add to playlist
                        </p>

                        {playlists && playlists.length === 0 && (
                            <p className="px-2 py-1 text-sm text-slate-500">No playlists yet.</p>
                        )}

                        <ul className="max-h-48 overflow-y-auto">
                            {playlists?.map((playlist) => {
                                const added = addedTo.has(playlist.id)
                                return (
                                    <li key={playlist.id}>
                                        <button
                                            type="button"
                                            onClick={(event) => handleAddToExisting(event, playlist.id)}
                                            disabled={added || addMutation.isPending}
                                            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-canvas disabled:opacity-50"
                                        >
                                            <span className="truncate">{playlist.name}</span>
                                            {added && <span className="text-xs text-brand">Added</span>}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>

                        <form
                            onSubmit={handleCreateAndAdd}
                            className="mt-2 flex gap-1 border-t border-gray-100 pt-2"
                        >
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(event) => setNewPlaylistName(event.target.value)}
                                placeholder="New playlist"
                                className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-brand focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="rounded bg-brand px-2 py-1 text-sm font-medium text-white hover:bg-brand-soft disabled:opacity-50"
                            >
                                +
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    )
}