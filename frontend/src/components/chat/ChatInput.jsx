// src/components/chat/ChatInput.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * ChatInput
 * - onSendText(text)
 * - onSendSongName(songName)
 * - onSendVoice(blobUrl)
 *
 * Voice recording uses MediaRecorder. If not available, voice button hides.
 */

export default function ChatInput({
  onSendText = () => {},
  onSendSongName = () => {},
  onSendVoice = () => {},
}) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recAvailable, setRecAvailable] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setRecAvailable(true);
    } else {
      setRecAvailable(false);
    }
  }, []);

  async function startRecording() {
    if (!recAvailable) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = { mr, stream };
      chunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size) chunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onSendVoice(url);
        // stop all tracks
        mediaRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRef.current = null;
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error("record start failed", err);
      alert("Could not start microphone. Check permissions.");
    }
  }

  function stopRecording() {
    if (!mediaRef.current) return;
    try {
      mediaRef.current.mr.stop();
    } catch (e) {}
    setIsRecording(false);
  }

  function handleSubmit(e) {
    e?.preventDefault?.();
    const t = text.trim();
    if (!t) return;
    // If message starts with "/song " treat as share-by-name command
    if (t.startsWith("/song ")) {
      const name = t.slice(6).trim();
      if (name) onSendSongName(name);
    } else {
      onSendText(t);
    }
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Message (type "/song name" to share by name)'
        className="flex-1 border rounded px-3 py-2"
      />
      {recAvailable && (
        <button
          type="button"
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          className={`px-3 py-2 rounded ${
            isRecording ? "bg-red-500 text-white" : "bg-gray-100"
          }`}
          title={isRecording ? "Stop recording" : "Record voice message"}
        >
          {isRecording ? "Stop" : "Rec"}
        </button>
      )}
      <button
        type="submit"
        className="px-3 py-2 bg-indigo-600 text-white rounded"
      >
        Send
      </button>
    </form>
  );
}
