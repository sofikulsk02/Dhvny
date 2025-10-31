// src/components/test/TestSongList.jsx
import React from "react";
import SongCard from "../song/SongCard";
import sampleSongs from "../../data/sampleSongs";

export default function TestSongList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {sampleSongs.SAMPLE_LIST.map((song) => (
        <SongCard key={song.songId} song={song} />
      ))}
    </div>
  );
}
