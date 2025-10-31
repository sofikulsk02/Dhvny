// src/components/collections/PlaylistEditor.jsx
import React, { useState } from "react";
import sampleSongs from "../../data/sampleSongs";
import playlistService from "../../services/playlist.service";

/**
 * PlaylistEditor - modal UI to create / edit playlist
 */
export default function PlaylistEditor({
  initial = null,
  onClose = () => {},
  onSave = () => {},
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [items, setItems] = useState(initial?.songs?.slice() || []);
  const [search, setSearch] = useState("");

  const suggestions = sampleSongs.SAMPLE_LIST.filter((s) =>
    (s.title + " " + (s.artist || ""))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function addSong(s) {
    if (items.find((it) => it.songId === s.songId)) return;
    setItems((prev) => [...prev, s]);
  }
  function removeAt(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function move(idx, dir) {
    const to = idx + dir;
    if (to < 0 || to >= items.length) return;
    const copy = items.slice();
    const [item] = copy.splice(idx, 1);
    copy.splice(to, 0, item);
    setItems(copy);
  }

  async function save() {
    const payload = { title, songs: items };
    try {
      const res = (await playlistService.save?.(payload)) ?? {
        id: Date.now(),
        ...payload,
      };
      onSave(res);
      onClose();
    } catch (err) {
      console.error("save playlist", err);
      alert("Could not save playlist.");
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-md w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          {initial ? "Edit Playlist" : "Create Playlist"}
        </h3>
        <button onClick={onClose} className="text-gray-500">
          Close
        </button>
      </div>

      <div className="mb-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Playlist title"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search songs to add"
          className="w-full px-3 py-2 border rounded"
        />
        <div className="mt-2 max-h-36 overflow-auto space-y-2">
          {suggestions.map((s) => (
            <div
              key={s.songId}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
            >
              <div className="min-w-0">
                <div className="text-sm truncate">{s.title}</div>
                <div className="text-xs text-gray-500 truncate">{s.artist}</div>
              </div>
              <button
                onClick={() => addSong(s)}
                className="ml-3 text-indigo-600"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium mb-2">
          Playlist songs ({items.length})
        </div>
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div
              key={it.songId}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="min-w-0">
                <div className="text-sm truncate">{it.title}</div>
                <div className="text-xs text-gray-500 truncate">
                  {it.artist}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="text-xs px-2"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="text-xs px-2"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeAt(idx)}
                  className="text-xs px-2 text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="px-3 py-2 border rounded">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!title || items.length === 0}
          className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </div>
  );
}
