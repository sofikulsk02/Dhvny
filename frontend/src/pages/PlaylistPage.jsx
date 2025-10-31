// src/pages/PlaylistPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import sampleSongs from "../data/sampleSongs";
import { usePlayer } from "../hooks/usePlayer";

/**
 * PlaylistPage - simple playlist detail view (demo)
 * - Accepts :id param and shows placeholder playlist
 */

export default function PlaylistPage() {
  const { id } = useParams();
  const { setQueue, setPlaying } = usePlayer();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    // for demo, create a fake playlist using sample list
    const items = sampleSongs.SAMPLE_LIST || [];
    setPlaylist({
      id: id || "demo",
      name: id ? `Playlist ${id}` : "Demo playlist",
      description: "A sample playlist created for demo/testing",
      songs: items,
    });
  }, [id]);

  if (!playlist) return null;

  function playAll() {
    setQueue(playlist.songs, 0, true);
    setPlaying(true);
  }

  function addToQueue(song) {
    // call playerService through usePlayer hook in other components
    // fallback: setQueue with appended items
    setQueue((prev) => (Array.isArray(prev) ? [...prev, song] : [song]));
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">{playlist.name}</h1>
      <p className="text-sm text-gray-500">{playlist.description}</p>

      <div className="mt-4">
        <button
          onClick={playAll}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          Play all
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {playlist.songs.map((s) => (
          <div
            key={s.songId || s.id}
            className="p-3 bg-white rounded shadow flex items-center justify-between"
          >
            <div>
              <div className="font-medium truncate">{s.title}</div>
              <div className="text-xs text-gray-500">{s.artist}</div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setQueue([s], 0, true)}
                className="px-2 py-1 border rounded text-xs"
              >
                Play
              </button>
              <button
                onClick={() => addToQueue(s)}
                className="px-2 py-1 text-xs"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
