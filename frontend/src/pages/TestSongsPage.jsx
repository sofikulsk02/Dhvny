// src/pages/TestSongsPage.jsx
import React, { useEffect } from "react";
import SongCard from "../components/song/SongCard";
import QueueViewer from "../components/player/QueueViewer";
import { usePlayer } from "../hooks/usePlayer";
import sampleSongs from "../data/sampleSong";

/**
 * Dev/Test page for quickly viewing songs, adding to queue, and testing playback.
 * Mount this page at "/test-songs" route in AppRoutes.jsx
 */
export default function TestSongsPage() {
  const { queue, addToQueue, setCurrentIndex, setPlaying } = usePlayer();

  useEffect(() => {
    // auto-add sample songs if queue is empty
    if (queue.length === 0) {
      sampleSongs.SAMPLE_LIST.forEach((song) => addToQueue(song));
      if (typeof setCurrentIndex === "function") {
        setCurrentIndex(0);
      }
      if (typeof setPlaying === "function") {
        setPlaying(false);
      }
    }
  }, [queue, addToQueue, setCurrentIndex, setPlaying]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">🎵 Test Songs Page</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sampleSongs.SAMPLE_LIST.map((song) => (
          <SongCard key={song.songId} song={song} />
        ))}
      </div>

      <div className="mt-6">
        <QueueViewer />
      </div>
    </div>
  );
}
