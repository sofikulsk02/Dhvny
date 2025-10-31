// src/components/test/PlaylistBuilder.jsx
import React, { useState } from "react";
import { usePlayer } from "../../hooks/usePlayer";
import sampleSongs from "../../data/sampleSongs";
import SongCard from "../song/SongCard";

export default function PlaylistBuilder() {
  const { setQueue, setCurrentIndex, setPlaying, queue } = usePlayer();
  const [selectedSongs, setSelectedSongs] = useState([]);

  const toggleSelect = (song) => {
    setSelectedSongs((prev) =>
      prev.some((s) => s.songId === song.songId)
        ? prev.filter((s) => s.songId !== song.songId)
        : [...prev, song]
    );
  };

  const buildQueue = () => {
    setQueue(selectedSongs);
    setCurrentIndex(0);
    setPlaying(true);
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded shadow">
      <h2 className="text-xl font-bold">📝 Playlist Builder</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sampleSongs.SAMPLE_LIST.map((song) => (
          <div
            key={song.songId}
            className={`cursor-pointer p-2 rounded border ${
              selectedSongs.some((s) => s.songId === song.songId)
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200"
            }`}
            onClick={() => toggleSelect(song)}
          >
            <SongCard song={song} compact />
          </div>
        ))}
      </div>

      <button
        onClick={buildQueue}
        disabled={selectedSongs.length === 0}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
      >
        Build & Play Queue ({selectedSongs.length})
      </button>
    </div>
  );
}
