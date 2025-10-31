import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Music,
  Plus,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import playlistsApi from "../../api/playlists.api";
import songsApi from "../../api/songs.api";
import { usePlayerContext } from "../../contexts/PlayerContext";

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { setQueue } = usePlayerContext();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSong, setShowAddSong] = useState(false);

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const data = await playlistsApi.getPlaylistById(playlistId);
      setPlaylist(data.playlist);
    } catch (error) {
      console.error("Error loading playlist:", error);
      alert("Failed to load playlist");
      navigate("/collections");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.songs.length === 0) return;

    // Extract song objects from the nested structure
    const songs = playlist.songs.map((item) => item.song).filter(Boolean);

    if (songs.length > 0) {
      setQueue(songs, 0, true);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await playlistsApi.removeSongFromPlaylist(playlistId, songId);
      await loadPlaylist(); // Reload to get updated playlist
    } catch (error) {
      console.error("Error removing song:", error);
      alert("Failed to remove song");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Playlist not found</p>
      </div>
    );
  }

  const songCount = playlist.songs?.length || 0;

  return (
    <div className="pb-24">
      {/* Header */}
      <button
        onClick={() => navigate("/collections")}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Collections</span>
      </button>

      {/* Playlist Info */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-start gap-4">
          {/* Cover */}
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            {playlist.coverUrl ? (
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <Music size={40} className="text-white/80" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {playlist.isPublic ? (
                <Globe size={16} className="text-white/80" />
              ) : (
                <Lock size={16} className="text-white/80" />
              )}
              <span className="text-sm text-white/80">
                {playlist.isPublic ? "Public" : "Private"}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2 break-words">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-white/90 text-sm mb-2 line-clamp-2">
                {playlist.description}
              </p>
            )}
            <p className="text-white/80 text-sm">
              {songCount} {songCount === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePlayAll}
            disabled={songCount === 0}
            className="flex-1 py-3 bg-white text-purple-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Play size={20} fill="currentColor" />
            Play All
          </button>
          <button
            onClick={() => setShowAddSong(true)}
            className="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-95"
          >
            <Plus size={20} />
            Add Songs
          </button>
        </div>
      </div>

      {/* Songs List */}
      {songCount === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music size={32} className="text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No songs yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your favorite songs to this playlist
          </p>
          <button
            onClick={() => setShowAddSong(true)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95"
          >
            Add Songs
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {playlist.songs.map((item, index) => {
            const song = item.song;
            if (!song) return null;

            return (
              <SongItem
                key={song._id || index}
                song={song}
                index={index}
                onRemove={() => handleRemoveSong(song._id)}
                onPlay={() => {
                  const songs = playlist.songs
                    .map((i) => i.song)
                    .filter(Boolean);
                  setQueue(songs, index, true);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Add Song Modal */}
      {showAddSong && (
        <AddSongModal
          playlistId={playlistId}
          onClose={() => setShowAddSong(false)}
          onSongAdded={loadPlaylist}
        />
      )}
    </div>
  );
};

// Song Item Component
const SongItem = ({ song, index, onRemove, onPlay }) => {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
      {/* Index */}
      <div className="w-8 text-center">
        <button
          onClick={onPlay}
          className="text-gray-600 hover:text-purple-600 font-semibold transition-colors"
        >
          {index + 1}
        </button>
      </div>

      {/* Cover */}
      <div
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0 cursor-pointer"
        onClick={onPlay}
      >
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <Music size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onPlay}>
        <h3 className="font-semibold text-gray-900 truncate">
          {song.title || "Unknown Title"}
        </h3>
        <p className="text-sm text-gray-600 truncate">
          {song.artist || "Unknown Artist"}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

// Add Song Modal Component
const AddSongModal = ({ playlistId, onClose, onSongAdded }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const data = await songsApi.listSongs({ perPage: 100 });
      setSongs(data.items || data.songs || []);
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (songId) => {
    try {
      setAdding(songId);
      await playlistsApi.addSongToPlaylist(playlistId, songId);
      await onSongAdded();
      onClose();
    } catch (error) {
      console.error("Error adding song:", error);
      alert(error.message || "Failed to add song");
      setAdding(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Add Songs
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading songs...
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No songs available
            </div>
          ) : (
            songs.map((song) => (
              <div
                key={song._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {/* Cover */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Music size={16} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-sm">
                    {song.title}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {song.artist}
                  </p>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleAddSong(song._id)}
                  disabled={adding === song._id}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:opacity-50 active:scale-95"
                >
                  {adding === song._id ? "Adding..." : "Add"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
