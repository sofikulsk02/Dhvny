// src/hooks/usePlayer.js
// Lightweight wrapper that re-exports the player hook from the context
// and keeps a few backward-compatible aliases.
// import defaultUsePlayer from "../contexts/PlayerContext";

// // re-export the default (hook) and the named hook from the context file
// export { default } from "../contexts/PlayerContext";
// export { usePlayer } from "../contexts/PlayerContext";

// export function usePlayerHook() {
//   return defaultUsePlayer();
// }

// // keep named aliases for backward compatibility
// export const usePlayerContext = defaultUsePlayer;
// export const usePlayerDefault = defaultUsePlayer;
// src/hooks/usePlayer.js
// Lightweight wrapper that re-exports the player hook from the context
// and keeps a few backward-compatible aliases.

// Re-export default hook and named `usePlayer` from the context module
export { default, usePlayer } from "../contexts/PlayerContext";

// Provide backward-compatible named aliases that some files may import
export { default as usePlayerDefault } from "../contexts/PlayerContext";
export { default as usePlayerContext } from "../contexts/PlayerContext";

// Small helper that calls the default hook (keeps older helper API)
import defaultUsePlayer from "../contexts/PlayerContext";
export function usePlayerHook() {
  return defaultUsePlayer();
}
