// src/pages/MySongsPage.jsx
import React, { useState, useEffect } from "react";
import SongCard from "../components/song/SongCard";
import QueueViewer from "../components/player/QueueViewer";
import { usePlayer } from "../hooks/usePlayer";
import songsApi from "../api/songs.api";
import CommentsOverlay from "../components/comments/CommentsOverlay";

/**
 * MySongsPage - Main songs collection page
 * Your personal music library with all features enabled
 */
export default function MySongsPage() {
  const { queue, addToQueue, setCurrentIndex, setPlaying, isPlaying } =
    usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSong, setSelectedSong] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Fetch uploaded songs from backend
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await songsApi.listSongs({ perPage: 100 });

        // Helper to get full URL
        const getFullUrl = (url) => {
          if (!url) return "";
          if (url.startsWith("http")) return url; // Already full URL (Cloudinary)
          // Relative path - prepend backend URL
          const baseUrl =
            import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
            "http://localhost:4000";
          return `${baseUrl}${url}`;
        };

        // Transform backend response to match expected format
        const fetchedSongs = (response.songs || response.items || []).map(
          (song) => ({
            songId: song._id || song.id,
            title: song.title,
            artist: song.artist || "Unknown Artist",
            coverUrl: getFullUrl(song.coverUrl || song.cover),
            audioUrl: getFullUrl(song.audioUrl || song.audio),
            duration: song.duration,
            tags: song.tags || [],
            isLegend: song.isLegend || false,
            liked: song.liked || false,
          })
        );

        setSongs(fetchedSongs);
        console.log("📀 Fetched songs:", fetchedSongs.length);
        console.log("📀 First song:", fetchedSongs[0]);
      } catch (err) {
        console.error("Failed to fetch songs:", err);
        setError("Failed to load songs. Please refresh the page.");
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Auto-load songs to queue on first load
  useEffect(() => {
    if (queue.length === 0 && songs.length > 0) {
      songs.forEach((song) => addToQueue(song));
      if (typeof setCurrentIndex === "function") {
        setCurrentIndex(0);
      }
      if (typeof setPlaying === "function") {
        setPlaying(false);
      }
    }
  }, [queue.length, songs, addToQueue, setCurrentIndex, setPlaying]);

  const handleOpenComments = (song) => {
    console.log("🗨️ Opening comments for song:", song?.title);
    setSelectedSong(song);
    setShowComments(true);
  };

  const handleCloseComments = () => {
    console.log("🗨️ Closing comments");
    setShowComments(false);
    setSelectedSong(null);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      songs.forEach((song, index) => {
        if (index === 0) {
          addToQueue(song);
          setCurrentIndex(0);
          setPlaying(true);
        } else {
          addToQueue(song);
        }
      });
    }
  };

  const handleShuffle = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    shuffled.forEach((song, index) => {
      if (index === 0) {
        addToQueue(song);
        setCurrentIndex(0);
        setPlaying(true);
      } else {
        addToQueue(song);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col space-y-4">
            <div>
              <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                🎵 My Music Library
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
                Your Collection
              </h1>
              <p className="text-purple-100 text-base sm:text-lg mb-6">
                {songs.length} songs • Ready to play
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlayAll}
                  className="group flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 font-semibold rounded-full hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  <span className="text-sm sm:text-base">Play All</span>
                </button>

                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/30 transition-all"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                  <span className="text-sm sm:text-base">Shuffle</span>
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "grid"
                        ? "bg-white/30"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                    title="Grid view"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === "list"
                        ? "bg-white/30"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                    title="List view"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Songs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading your songs...</p>
          </div>
        )}

        {/* Songs List */}
        {!loading && (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">All Songs</h2>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
                  {songs.map((song) => (
                    <SongCard
                      key={song.songId}
                      song={song}
                      showControls={true}
                      layout="grid"
                      onOpenComments={handleOpenComments}
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 p-4">
                  {songs.map((song) => (
                    <SongCard
                      key={song.songId}
                      song={song}
                      showControls={true}
                      layout="list"
                      onOpenComments={handleOpenComments}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Queue Viewer */}
            <div className="mt-8">
              <QueueViewer />
            </div>
          </>
        )}
      </div>

      {/* Comments Overlay */}
      {showComments && selectedSong && (
        <CommentsOverlay
          visible={showComments}
          song={selectedSong}
          onClose={handleCloseComments}
        />
      )}
    </div>
  );
}
