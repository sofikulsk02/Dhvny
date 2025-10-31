// src/pages/TestSongsAdvancedPage.jsx
import React, { useEffect, useState } from "react";
import sampleSongs from "../data/sampleSongs";
import { usePlayer } from "../hooks/usePlayer";
import SongCard from "../components/song/SongCard";

/**
 * TestSongsAdvancedPage - developer helper
 * - Add single song to queue, add all, start/pause, toggle shuffle/repeat via playerService
 */

export default function TestSongsAdvancedPage() {
  const {
    queue,
    currentIndex,
    currentSong,
    isPlaying,
    addToQueue,
    addToQueueNext,
    clearQueue,
    setQueue,
    setPlaying,
    playNext,
    playPrevious,
    togglePlaying,
  } = usePlayer();

  const [list] = useState(sampleSongs.SAMPLE_LIST);

  useEffect(() => {
    // nothing auto
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-3">Advanced Test Songs</h1>

      <div className="mb-4 space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setQueue(list, 0, true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded"
          >
            Load & Play All
          </button>
          <button
            onClick={() => setQueue(list, 0, false)}
            className="px-3 py-2 border rounded"
          >
            Load (paused)
          </button>
          <button
            onClick={() => clearQueue()}
            className="px-3 py-2 text-red-600"
          >
            Clear queue
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => playPrevious()}
            className="px-3 py-2 border rounded"
          >
            Prev
          </button>
          <button
            onClick={() => togglePlaying()}
            className="px-3 py-2 bg-indigo-600 text-white rounded"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => playNext()}
            className="px-3 py-2 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {list.map((s) => (
          <div key={s.songId} className="bg-white rounded shadow">
            <SongCard song={s} />
            <div className="p-2 flex space-x-2">
              <button
                onClick={() => addToQueue(s)}
                className="px-2 py-1 border rounded text-xs"
              >
                Add to queue
              </button>
              <button
                onClick={() => addToQueueNext(s)}
                className="px-2 py-1 text-xs"
              >
                Play next
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h2 className="font-medium">Queue ({queue.length})</h2>
        <ul className="space-y-2 mt-2">
          {queue.map((q, idx) => (
            <li
              key={q.songId || q.id || idx}
              className={`p-2 rounded ${
                idx === currentIndex ? "bg-indigo-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-xs text-gray-500">{q.artist}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {idx === currentIndex
                    ? isPlaying
                      ? "Playing"
                      : "Paused"
                    : ""}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
