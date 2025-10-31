// // src/components/player/PlayerControls.jsx
// import React from "react";
// import { usePlayer } from "../../hooks/usePlayer";

// export default function PlayerControls() {
//   const { currentSong, isPlaying, togglePlay, playNext, playPrevious, queue } =
//     usePlayer();

//   if (!currentSong || !queue.length) return null;

//   return (
//     <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow flex items-center justify-between p-2 z-50">
//       <div>
//         <p className="font-semibold">{currentSong.title}</p>
//         <p className="text-sm text-gray-500">{currentSong.artist}</p>
//       </div>

//       <div className="flex items-center space-x-2">
//         <button onClick={playPrevious} title="Previous">
//           ⏮️
//         </button>
//         <button onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
//           {isPlaying ? "⏸️" : "▶️"}
//         </button>
//         <button onClick={playNext} title="Next">
//           ⏭️
//         </button>
//       </div>
//     </div>
//   );
// }

// src/components/player/PlayerControls.jsx
import React from "react";
import { usePlayer } from "../../hooks/usePlayer";

function IconPlay({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
    </svg>
  );
}
function IconPause({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="4" height="16" fill="currentColor" />
      <rect x="14" y="4" width="4" height="16" fill="currentColor" />
    </svg>
  );
}
function IconPrev({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M11 19V5l-7 7 7 7zm1 0V5l7 7-7 7z" fill="currentColor" />
    </svg>
  );
}
function IconNext({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13 5v14l7-7-7-7zm-1 0v14l-7-7 7-7z" fill="currentColor" />
    </svg>
  );
}

export default function PlayerControls() {
  const { currentSong, isPlaying, playNext, playPrevious, togglePlaying } =
    usePlayer();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex items-center justify-between px-4 py-2 z-50">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
          {currentSong.coverUrl ? (
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          ) : (
            "♪"
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium">{currentSong.title}</div>
          <div className="truncate text-sm text-gray-500">
            {currentSong.artist}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={playPrevious}
          className="p-2 hover:bg-gray-100 rounded"
          title="Previous"
        >
          <IconPrev />
        </button>
        <button
          onClick={togglePlaying}
          className="p-2 hover:bg-gray-100 rounded"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>
        <button
          onClick={playNext}
          className="p-2 hover:bg-gray-100 rounded"
          title="Next"
        >
          <IconNext />
        </button>
      </div>
    </div>
  );
}
