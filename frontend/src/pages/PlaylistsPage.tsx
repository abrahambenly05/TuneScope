import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPlaylist, fetchPlaylists } from '../lib/playlists';

export default function PlaylistPage() {
    const queryClient = useQueryClient();
    const [newName, setNewName] = useState('');

    const { data: playlists, isLoading, isError } = useQuery({
        queryKey: ['playlists'],
        queryFn: fetchPlaylists,
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => createPlaylist(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
            setNewName('');
        },
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) return;
        createMutation.mutate(trimmed);
    }

    if (isLoading) {
        return <p className="p-6 text-[var(--color-ink)]">Loading Playlist...</p>;
    }

    if (isError) {
        return <p className="p-6 text-red-600">Failed to load the playlist.</p>;
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-semibold text-[var(--color-ink)]">My Playlist</h1>

            <form onSubmit={handleCreate} className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New playlist name"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-[var(--color-brand)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-[var(--color-brand)] px-4 py-2 font-medium text-white hover:bg-[var(--color-brand-soft)] disabled:opacity-50"
                >
                  Create
                </button>
            </form>

            {playlists && playlists.length === 0 && (
                <p className="text-gray-500">No playlists yet. Create your first one above.</p>
            )}

            <ul className="space-y-2">
                {playlists?.map((playlist) => (
                    <li key={playlist.id}>
                        <Link
                          to={`/playlists/${playlist.id}`}
                          className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:border-[var(--color-brand)] hover:bg-[var(--color-canvas)]"
                        >
                            <span className="font-medium text-[var(--color-ink)]">{playlist.name}</span>
                            <span className="text-sm text-gray-500">
                              {playlist.is_public ? 'Public' : 'Private'}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}