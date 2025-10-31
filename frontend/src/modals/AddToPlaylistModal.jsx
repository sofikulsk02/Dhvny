// src/modals/AddToPlaylistModal.jsx
import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, Music } from "lucide-react";
import * as playlistsApi from "../api/playlists.api";

export default function AddToPlaylistModal({ song, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null); // playlist id being added to
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function loadPlaylists() {
    setLoading(true);
    setError(null);
    try {
      const response = await playlistsApi.getMyPlaylists();
      setPlaylists(response.playlists || response || []);
    } catch (err) {
      console.error("Failed to load playlists:", err);
      setError("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToPlaylist(playlistId) {
    setAdding(playlistId);
    setError(null);
    setSuccess(null);
    try {
      await playlistsApi.addSongToPlaylist(playlistId, song.songId || song.id);
      setSuccess(`Added to playlist!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Failed to add song to playlist:", err);
      setError(err.message || "Failed to add song to playlist");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add to Playlist</h2>
            <p className="text-sm text-gray-600 mt-1">
              {song.title} - {song.artist}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
              <p className="text-gray-600">Loading playlists...</p>
            </div>
          )}

          {/* Playlists List */}
          {!loading && playlists.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">No playlists yet</p>
              <p className="text-gray-600 text-sm mb-4">
                Create your first playlist to add songs
              </p>
              <button
                onClick={() => {
                  onClose();
                  // You can trigger create playlist modal here
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Playlist
              </button>
            </div>
          )}

          {!loading && playlists.length > 0 && (
            <div className="space-y-2">
              {playlists.map((playlist) => {
                const isAdding = adding === (playlist._id || playlist.id);
                const alreadyAdded = playlist.songs?.some(
                  (s) =>
                    (typeof s === "string" ? s : s._id || s.id) ===
                    (song.songId || song._id || song.id)
                );

                return (
                  <button
                    key={playlist._id || playlist.id}
                    onClick={() =>
                      !alreadyAdded &&
                      !isAdding &&
                      handleAddToPlaylist(playlist._id || playlist.id)
                    }
                    disabled={isAdding || alreadyAdded}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      alreadyAdded
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {playlist.name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {playlist.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {playlist.songs?.length || 0} songs
                      </p>
                    </div>
                    {isAdding && (
                      <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
                    )}
                    {alreadyAdded && (
                      <span className="text-sm text-green-600 font-medium flex-shrink-0">
                        ✓ Added
                      </span>
                    )}
                    {!alreadyAdded && !isAdding && (
                      <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
