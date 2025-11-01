// src/pages/SongDetailPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../hooks/usePlayer";
import songsApi from "../api/songs.api";
import FullPlayer from "../components/player/FullPlayer";

export default function SongDetailPage() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const {
    setQueue,
    currentSong,
    setCurrentIndex,
    setCurrentBySongId,
    queue,
    addToQueue,
  } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAndPlaySong = useCallback(async () => {
    if (!songId) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🎵 Loading song:", songId);

      // Fetch the song details
      const response = await songsApi.getSong(songId);
      console.log("🎵 Song API response:", response);
      const song = response.song;

      if (!song) {
        console.error("❌ Song not found in response");
        setError("Song not found");
        setLoading(false);
        return;
      }

      console.log("✅ Song loaded:", song.title);

      // Transform song to match queue format
      const songForQueue = {
        songId: song._id,
        _id: song._id,
        id: song._id,
        title: song.title,
        artist: song.artist,
        coverUrl: song.coverUrl,
        audioUrl: song.audioUrl,
        duration: song.duration,
      };

      // Check if song is already in queue
      const songInQueue = queue.find(
        (s) => (s.songId || s.id || s._id) === song._id
      );

      console.log("🔍 Song in queue?", !!songInQueue);

      if (songInQueue) {
        // Song already in queue - just switch to it and play
        console.log("✅ Switching to song in queue");
        setCurrentBySongId(song._id, true); // Pass true to auto-play
      } else {
        // Song not in queue - add it and play
        console.log("➕ Adding song to queue and playing");
        addToQueue(songForQueue);
        // Wait for queue to update, then switch to this song
        setTimeout(() => {
          setCurrentBySongId(song._id, true); // Pass true to auto-play
        }, 100);
      }

      setLoading(false);
    } catch (err) {
      console.error("Failed to load song:", err);
      setError(err.message || "Failed to load song");
      setLoading(false);
    }
  }, [songId, navigate, setCurrentBySongId, queue, addToQueue]);

  useEffect(() => {
    loadAndPlaySong();
  }, [loadAndPlaySong]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-500">Loading song...</div>
          <div className="mt-2 text-sm text-gray-400">
            Please wait while we fetch the details
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-500">{error}</div>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <FullPlayer />;
}
