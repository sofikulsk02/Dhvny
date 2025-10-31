import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import songsApi from "../api/songs.api";
import { usePlayer } from "../hooks/usePlayer";

export default function HomePage() {
  const { user } = useAuth();
  const {
    queue,
    addToQueue,
    setCurrentBySongId,
    setPlaying,
    currentSong,
    isPlaying,
    togglePlaying,
  } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch uploaded songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);

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

        const response = await songsApi.listSongs({ perPage: 6 });
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
      } catch (err) {
        console.error("Failed to fetch songs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Auto-load songs to queue when they're fetched
  useEffect(() => {
    if (songs.length > 0) {
      // Check if songs are already in queue
      songs.forEach((song) => {
        const songInQueue = queue.find(
          (s) => (s.songId || s.id) === (song.songId || song.id)
        );
        if (!songInQueue) {
          addToQueue(song);
        }
      });
    }
  }, [songs, queue, addToQueue]);

  const handlePlaySong = (song) => {
    console.log("🎵 HomePage handlePlaySong clicked:", song.title);
    console.log("   Current song:", currentSong?.title);
    console.log("   Song ID to play:", song.songId || song.id);
    console.log("   Current song ID:", currentSong?.songId || currentSong?.id);

    // Check if this is the currently playing song
    const isCurrent =
      currentSong &&
      (currentSong.songId || currentSong.id) === (song.songId || song.id);

    console.log("   Is current song?", isCurrent);

    if (isCurrent) {
      // Same song - toggle play/pause
      console.log("   Action: Toggle play/pause");
      togglePlaying();
      return;
    }

    // Different song - switch to it
    console.log("   Action: Switch to different song");
    const songInQueue = queue.find(
      (s) => (s.songId || s.id) === (song.songId || song.id)
    );

    if (songInQueue) {
      // Song is in queue, just switch to it
      console.log("   Song found in queue, switching to it");
      setCurrentBySongId(song.songId || song.id);
      setPlaying(true);
    } else {
      // Song not in queue, add it and play
      console.log("   Song not in queue, adding it");
      addToQueue(song);
      // Set it as current (it will be the last one added)
      setTimeout(() => {
        setCurrentBySongId(song.songId || song.id);
        setPlaying(true);
      }, 50);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ""}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to discover your next favorite song?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/upload"
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100"
          >
            <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Upload Music
            </h3>
            <p className="text-sm text-gray-600">Share your favorite tracks</p>
          </Link>

          <Link
            to="/collections"
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100"
          >
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              My Collections
            </h3>
            <p className="text-sm text-gray-600">Organize your playlists</p>
          </Link>

          <Link
            to="/friends"
            className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-100"
          >
            <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Friends
            </h3>
            <p className="text-sm text-gray-600">Connect and jam together</p>
          </Link>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🔥 Your Music</h2>
            <Link
              to="/my-songs"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading songs...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No songs yet!
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your first song to get started
              </p>
              <Link
                to="/upload"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Upload Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.slice(0, 3).map((song) => {
                const isCurrent =
                  currentSong &&
                  (currentSong.songId === song.songId ||
                    currentSong.id === song.songId ||
                    currentSong.id === song.id);
                const showPause = isCurrent && isPlaying;

                return (
                  <div
                    key={song.songId}
                    onClick={() => handlePlaySong(song)}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                      {song.coverUrl ? (
                        <img
                          src={song.coverUrl}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-16 h-16 text-white/50"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                          {showPause ? (
                            <svg
                              className="w-6 h-6 text-purple-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <rect x="6" y="4" width="3" height="12" />
                              <rect x="11" y="4" width="3" height="12" />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6 text-purple-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {song.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {song.artist || "Unknown Artist"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {song.tags?.[0] && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                          {song.tags[0]}
                        </span>
                      )}
                      {song.duration && (
                        <span className="text-xs text-gray-500">
                          {Math.floor(song.duration / 60)}:
                          {String(Math.floor(song.duration % 60)).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently Played */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🎧 Quick Access
            </h2>
            <Link
              to="/my-songs"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View all songs →
            </Link>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No songs available
              </div>
            ) : (
              <div className="space-y-3">
                {songs.slice(0, 3).map((song) => {
                  const isCurrent =
                    currentSong &&
                    (currentSong.songId === song.songId ||
                      currentSong.id === song.songId ||
                      currentSong.id === song.id);
                  const showPause = isCurrent && isPlaying;

                  return (
                    <div
                      key={song.songId}
                      onClick={() => handlePlaySong(song)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                        {song.coverUrl ? (
                          <img
                            src={song.coverUrl}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-7 h-7 text-white/70"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {song.title}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {song.artist || "Unknown Artist"}
                          {song.tags?.[0] && ` • ${song.tags[0]}`}
                        </p>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {showPause ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <rect x="6" y="4" width="3" height="12" />
                            <rect x="11" y="4" width="3" height="12" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-4 text-center">
              <Link
                to="/my-songs"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Open My Songs Library →
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-2">
            🎵 Start Your Music Journey
          </h2>
          <p className="text-purple-100 mb-6">
            {loading
              ? "Loading your music collection..."
              : songs.length === 0
              ? "Upload your first song to get started!"
              : `Explore your ${songs.length} amazing song${
                  songs.length !== 1 ? "s" : ""
                } and enjoy all the features!`}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/my-songs"
              className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors shadow-lg"
            >
              🎧 My Songs
            </Link>
            <Link
              to="/upload"
              className="px-6 py-3 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
            >
              ➕ Add More Songs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
