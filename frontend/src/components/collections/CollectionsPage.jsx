import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Music, Lock, Globe, Trash2, Edit } from "lucide-react";
import playlistsApi from "../../api/playlists.api";
import CreatePlaylistModal from "./CreatePlaylistModal";

const CollectionsPage = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [globalPlaylist, setGlobalPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadPlaylists();
    loadGlobalPlaylist();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await playlistsApi.getMyPlaylists();
      setPlaylists(data.playlists || []);
    } catch (error) {
      console.error("Error loading playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalPlaylist = async () => {
    try {
      const data = await playlistsApi.getGlobalPlaylist();
      setGlobalPlaylist(data.playlist);
    } catch (error) {
      console.error("Global playlist not found:", error);
      // It's okay if it doesn't exist yet
    }
  };

  const handleCreatePlaylist = async (playlistData) => {
    try {
      const data = await playlistsApi.createPlaylist(playlistData);
      setPlaylists([data.playlist, ...playlists]);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert(error.message || "Failed to create playlist");
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      await playlistsApi.deletePlaylist(playlistId);
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert(error.message || "Failed to delete playlist");
    }
  };

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlists/${playlistId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          My Collections
        </h1>
        <p className="text-gray-600">Organize your favorite songs</p>
      </div>

      {/* Create Playlist Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="w-full mb-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center gap-2 font-semibold hover:shadow-lg transition-all active:scale-95"
      >
        <Plus size={24} />
        Create New Playlist
      </button>

      {/* Global Playlist Section */}
      {globalPlaylist && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-purple-600" />
            Global Playlist
          </h2>
          <div
            onClick={() => handlePlaylistClick(globalPlaylist._id)}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all active:scale-95"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                {globalPlaylist.coverUrl ? (
                  <img
                    src={globalPlaylist.coverUrl}
                    alt={globalPlaylist.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Globe size={32} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {globalPlaylist.name}
                  </h3>
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full">
                    GLOBAL
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {globalPlaylist.description ||
                    "Official playlist for everyone"}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Music size={14} />
                    {globalPlaylist.songs?.length || 0} songs
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe size={14} />
                    Public
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Playlists Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Playlists</h2>
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No playlists yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first playlist to organize your music
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                onClick={() => handlePlaylistClick(playlist._id)}
                onDelete={() => handleDeletePlaylist(playlist._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePlaylist}
        />
      )}
    </div>
  );
};

// Playlist Card Component
const PlaylistCard = ({ playlist, onClick, onDelete }) => {
  const songCount = playlist.songs?.length || 0;

  return (
    <div
      className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 relative">
        {playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={48} className="text-white/80" />
          </div>
        )}

        {/* Privacy Badge */}
        <div className="absolute top-2 right-2">
          <div
            className={`p-1.5 rounded-full backdrop-blur-sm ${
              playlist.isPublic
                ? "bg-green-500/30 text-white"
                : "bg-gray-900/30 text-white"
            }`}
          >
            {playlist.isPublic ? <Globe size={14} /> : <Lock size={14} />}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 left-2 p-1.5 bg-red-500/80 backdrop-blur-sm rounded-full text-white hover:bg-red-600 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {playlist.name}
        </h3>
        <p className="text-xs text-gray-600">
          {songCount} {songCount === 1 ? "song" : "songs"}
        </p>
      </div>
    </div>
  );
};

export default CollectionsPage;
