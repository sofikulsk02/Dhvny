// src/components/chat/ChatWindow.jsx
import React, { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import sampleSongs from "../../data/sampleSongs";

/**
 * ChatWindow
 *
 * Props:
 *  - conversationId: id of conversation (string) — when null, show placeholder
 *  - onBack: mobile-only back button callback
 */

const MOCK_MESSAGES = {
  c_1: [
    {
      id: 1,
      from: "Aisha",
      text: "Hey, check this out!",
      ts: Date.now() - 1000 * 60 * 60,
    },
    { id: 2, from: "You", text: "Which one?", ts: Date.now() - 1000 * 60 * 59 },
  ],
  c_2: [
    {
      id: 3,
      from: "Ravi",
      text: "Let's jam tonight",
      ts: Date.now() - 1000 * 60 * 90,
    },
  ],
  c_3: [
    {
      id: 4,
      from: "Priya",
      text: "I recorded something",
      ts: Date.now() - 1000 * 60 * 3,
    },
  ],
};

export default function ChatWindow({
  conversationId = null,
  onBack = () => {},
  onClose = () => {},
}) {
  const [messages, setMessages] = useState([]);
  const [convName, setConvName] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setConvName(null);
      return;
    }
    // load mock messages
    setMessages(MOCK_MESSAGES[conversationId] || []);
    // name mapping
    const nameMap = { c_1: "Aisha", c_2: "Ravi", c_3: "Priya" };
    setConvName(nameMap[conversationId] || "Friend");
  }, [conversationId]);

  useEffect(() => {
    // autoscroll to bottom when messages change
    const el = listRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 60);
    }
  }, [messages]);

  function sendTextMessage(text) {
    if (!conversationId || !text.trim()) return;
    const m = {
      id: Date.now(),
      from: "You",
      text: text.trim(),
      ts: Date.now(),
    };
    setMessages((s) => [...s, m]);
  }

  function sendSongByName(songName) {
    if (!conversationId || !songName) return;
    // find best match in local SAMPLE_LIST
    const found = sampleSongs.SAMPLE_LIST.find((s) =>
      s.title.toLowerCase().includes(songName.toLowerCase())
    );
    const payload = found
      ? `🎵 ${found.title} — ${found.artist}`
      : `🎵 ${songName} (not in collection)`;
    const m = {
      id: Date.now(),
      from: "You",
      text: payload,
      ts: Date.now(),
      meta: { type: "song", song: found || { title: songName } },
    };
    setMessages((s) => [...s, m]);
  }

  function sendVoiceMessage(blobUrl) {
    if (!conversationId || !blobUrl) return;
    const m = {
      id: Date.now(),
      from: "You",
      text: "🎤 Voice message",
      ts: Date.now(),
      meta: { type: "voice", url: blobUrl },
    };
    setMessages((s) => [...s, m]);
  }

  if (!conversationId) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          Select a conversation to start chatting
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="md:hidden px-2 py-1 border rounded"
          >
            Back
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            {convName?.[0]}
          </div>
          <div>
            <div className="font-medium">{convName}</div>
            <div className="text-xs text-gray-500">Online</div>
          </div>
        </div>
        <div>
          <button onClick={onClose} className="text-xs text-gray-500">
            Close
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-auto p-3 space-y-3 bg-[linear-gradient(#fff,#f8fafc)]"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] ${
              m.from === "You" ? "ml-auto text-right" : ""
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                m.from === "You"
                  ? "bg-indigo-600 text-white"
                  : "bg-white shadow-sm"
              }`}
            >
              <div className="text-sm">{m.text}</div>
              {m.meta?.type === "voice" && (
                <div className="mt-2">
                  <audio src={m.meta.url} controls />
                </div>
              )}
              {m.meta?.type === "song" && m.meta.song && (
                <div className="mt-2 text-xs text-gray-100">
                  {m.meta.song.title} — {m.meta.song.artist}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {new Date(m.ts).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-white">
        <ChatInput
          onSendText={sendTextMessage}
          onSendSongName={sendSongByName}
          onSendVoice={sendVoiceMessage}
        />
      </div>
    </div>
  );
}
