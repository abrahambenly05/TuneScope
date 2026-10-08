import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    deletePlaylist,
    fetchPlaylistDetail,
    removeTrackFromPlaylist,
    renamePlaylist,
    reorderPlaylistTracks,
    setPlaylistVisibility,
    type PlaylistTrack,
} from '../lib/playlists';

export default function PlaylistDetailPage() {
    const { id } = useParams<{ id: string }>();
    const playlistId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState('');
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const { data: playlist, isLoading, isError } = useQuery({
        queryKey: ['playlist', playlistId],
        queryFn: () => fetchPlaylistDetail(playlistId),
        enabled: !Number.isNaN(playlistId),
    });
    
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
        queryClient.invalidateQueries({ queryKey: ['playlists'] });
    };

    const renameMutation = useMutation({
        mutationFn: (name: string) => renamePlaylist(playlistId, name),
        onSuccess: () => {
            invalidate();
            setIsEditingName(false);
        },
    });

    const visibilityMutation = useMutation({
        mutationFn: (isPublic: boolean) => setPlaylistVisibility(playlistId, isPublic),
        onSuccess: invalidate,
    });

    const removeTrackMutation = useMutation({
        mutationFn: (trackId: number) => removeTrackFromPlaylist(playlistId, trackId),
        onSuccess: invalidate,
    });

    const reorderMutation = useMutation({
        mutationFn: (order: { track_id: number; position: number }[]) =>
            reorderPlaylistTracks(playlistId, order),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: () => deletePlaylist(playlistId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
            navigate('/playlists');
        },
    });

    function startEditingName() {
        if (!playlist) return;
        setNameDraft(playlist.name);
        setIsEditingName(true);
    }

    function handleRenameSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = nameDraft.trim();
        if (!trimmed) return;
        renameMutation.mutate(trimmed);
    }

    function handleDeletePlaylist() {
        if (window.confirm('Delete this playlist? This action cannot be undone.')) {
            deleteMutation.mutate();
        }
    }

    function handleDragStart(index: number) {
        setDragIndex(index);
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    function handleDrop(targetIndex: number) {
        if (dragIndex === null || !playlist || dragIndex === targetIndex) {
            setDragIndex(null);
            return
        }

        const reordered = [...playlist.tracks];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        const order = reordered.map((track, index) => ({
            track_id: track.id,
            position: index,
        }));

        setDragIndex(null);
        reorderMutation.mutate(order);
    }

    if (isLoading) {
        return <p className="p-6 text-[var(--color-ink)]">Loading Playlist...</p>;
    }

    if (isError || !playlist) {
        return <p className="p-6 text-red-600">Playlist not found.</p>;
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    {isEditingName ? (
                        <form onSubmit={handleRenameSubmit} className="flex gap-2">
                            <input
                              type="text"
                              value={nameDraft}
                              onChange={(e) => setNameDraft(e.target.value)}
                              autoFocus
                              className="rounded-lg border border-gray-300 px-3 py-1 text-xl font-semibold focus:border-[var(--color-brand)] focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={renameMutation.isPending}
                              className="rounded-lg bg-[var(--color-brand)] px-3 py-1 text-sm font-medium text-white hover:bg-[var(--color-brand-soft)]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingName(false)}
                              className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600"
                            >
                              Cancel
                            </button>
                        </form>
                    ) : (
                        <h1
                            onClick={startEditingName}
                            className="cursor-pointer text-2xl font-semibold text-[var(--color-ink)] hover:underline"
                            title="Click to rename"
                        >
                            {playlist.name}
                        </h1>
                    )}

                    <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={playlist.is_public}
                        onChange={(e) => visibilityMutation.mutate(e.target.checked)}
                        className="h-4 w-4 accent-[var(--color-brand)]"
                      />
                      Public playlist
                    </label>
                </div>

                <button
                  onClick={handleDeletePlaylist}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete Playlist
                </button>
            </div>

            {playlist.tracks.length === 0 ? (
                <p className="text-gray-500">
                    No tracks in this playlist yet. Add some from the search page or a track's detail page.
                </p>
            ) : (
              <ul className="space-y-2">
                {playlist.tracks.map((track: PlaylistTrack, index: number) => (
                    <li
                      key={track.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className={`flex cursor-move items-center gap-3 rounded-lg border-gray-200 px-3 py-2 ${
                        dragIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                        <span className="text-gray-400">⠿</span>
                        {track.image_url && (
                            <img
                              src={track.image_url}
                              alt={track.title}
                              className="h-12 w-12 rounded object-cover"
                            />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-[var(--color-ink)]">{track.title}</p>
                            {track.subtitle && (
                                <p className="truncate text-sm text-gray-500">{track.subtitle}</p>
                            )}
                        </div>
                        <button
                          onClick={() => removeTrackMutation.mutate(track.id)}
                          disabled={removeTrackMutation.isPending}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                    </li>
                ))}
              </ul>
            )}
        </div>
    );
}