// src/components/player/SingAlongRecorder.jsx
import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "../../hooks/usePlayer";

/**
 * SingAlongRecorder
 * - record voice while the song plays
 * - preview combined audio locally
 *
 * Note: This is frontend-only. For permanent storage / mixing server-side, upload the recording.
 */
export default function SingAlongRecorder({ onClose = () => {} }) {
  const { currentSong } = usePlayer();
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [recAvailable, setRecAvailable] = useState(false);
  const mediaRef = useRef(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      const mr = new MediaRecorder(stream);
      recRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setRecAvailable(true);
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error("mic error", err);
      alert("Microphone access is required for sing-along.");
    }
  }

  function stopRecording() {
    recRef.current?.stop();
    mediaRef.current?.getTracks?.().forEach((t) => t.stop());
    mediaRef.current = null;
    setRecording(false);
  }

  function downloadRecording() {
    if (!chunksRef.current.length) return;
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(currentSong?.title || "singalong").replace(
      /\s+/g,
      "_"
    )}_sing.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold">Sing-along Recorder</h3>
      <div className="mt-3">
        <div className="text-sm text-gray-600">
          Recording while the song plays allows you to preview how your voice
          fits the track.
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop
          </button>
        )}

        <button
          onClick={() => {
            if (blobUrl) {
              const win = window.open(blobUrl, "_blank");
            }
          }}
          disabled={!recAvailable}
          className="px-3 py-2 border rounded disabled:opacity-60"
        >
          Open Recording
        </button>

        <button
          onClick={downloadRecording}
          disabled={!recAvailable}
          className="px-3 py-2 border rounded disabled:opacity-60"
        >
          Download
        </button>
      </div>

      <div className="mt-3">
        <div className="text-xs text-gray-500">
          Note: to mix and store permanently you must upload the recording to
          your backend and do proper audio mixing (server or offline DAW).
        </div>
      </div>
    </div>
  );
}
