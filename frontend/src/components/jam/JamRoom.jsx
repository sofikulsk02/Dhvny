// src/components/jam/JamRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "../../hooks/usePlayer";

/**
 * JamRoom - UI to visualize a live session
 * - host toggles playback; sends 'sync' messages (simulated)
 */
export default function JamRoom({
  roomId = "demo",
  host = "You",
  participantsInit = [],
  onClose = () => {},
}) {
  const {
    playNext,
    playPrevious,
    togglePlaying,
    currentSong,
    isPlaying,
    seek,
  } = usePlayer();
  const [participants, setParticipants] = useState(
    participantsInit.length
      ? participantsInit
      : [
          { id: "u1", name: "Aisha", joinedAt: Date.now() },
          { id: "u2", name: "Ravi", joinedAt: Date.now() },
        ]
  );
  const [hostState, setHostState] = useState({
    playing: isPlaying,
    ts: Date.now(),
  });

  // simulated sync: when host toggles, we update participants' tv
  useEffect(() => {
    setHostState({ playing: isPlaying, ts: Date.now() });
  }, [isPlaying]);

  function join(name) {
    setParticipants((prev) => [
      ...prev,
      { id: `u${Date.now()}`, name, joinedAt: Date.now() },
    ]);
  }

  function leave(id) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="fixed inset-0 z-60 p-4 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-semibold">Jam Room — {roomId}</div>
            <div className="text-xs text-gray-500">Host: {host}</div>
          </div>
          <div>
            <button onClick={onClose} className="text-gray-500">
              Close
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm font-medium mb-2">Now (host):</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {currentSong?.title || "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentSong?.artist}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => playPrevious()}
                    className="px-2 py-1 border rounded"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => togglePlaying()}
                    className="px-3 py-1 rounded bg-indigo-600 text-white"
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={() => playNext()}
                    className="px-2 py-1 border rounded"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Simulated sync: when host plays/pauses the clients should align
                to host timestamp (requires sockets).
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-sm font-medium mb-2">
                Participants ({participants.length})
              </div>
              <ul className="space-y-2">
                {participants.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {p.name.charAt(0)}
                      </div>
                      <div className="text-sm">{p.name}</div>
                    </div>
                    <button
                      onClick={() => leave(p.id)}
                      className="text-xs text-red-600"
                    >
                      Kick
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-3">
                <input
                  placeholder="Invite name"
                  className="w-full px-3 py-2 border rounded"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      join(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <div className="text-xs text-gray-400 mt-1">
                  Press Enter to invite (simulated)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
