// src/pages/SongDetailPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "../hooks/usePlayer";
import songsApi from "../api/songs.api";
import FullPlayer from "../components/player/FullPlayer";

export default function SongDetailPage() {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { setQueue, currentSong, setCurrentIndex } = usePlayer();
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

      // Play the song if it's not already playing
      if (currentSong?.songId !== song._id && currentSong?._id !== song._id) {
        // Set the queue with just this song and play it
        setQueue([
          {
            songId: song._id,
            _id: song._id,
            title: song.title,
            artist: song.artist,
            coverUrl: song.coverUrl,
            audioUrl: song.audioUrl,
            duration: song.duration,
          },
        ]);
        setCurrentIndex(0);
      }

      setLoading(false);
    } catch (err) {
      console.error("Failed to load song:", err);
      setError(err.message || "Failed to load song");
      setLoading(false);
    }
  }, [songId, navigate, setQueue, setCurrentIndex, currentSong]);

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
