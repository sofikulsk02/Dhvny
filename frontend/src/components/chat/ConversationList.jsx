// src/components/chat/ConversationsList.jsx
import React from "react";

/**
 * ConversationsList - mock list of friends/conversations
 * Props:
 *  - onOpenConversation(id)
 *  - activeConvId
 */

const MOCK_CONVS = [
  {
    id: "c_1",
    name: "Aisha",
    last: "Loved that chorus!",
    ts: Date.now() - 1000 * 60 * 40,
    unread: 0,
  },
  {
    id: "c_2",
    name: "Ravi",
    last: "Join my jam?",
    ts: Date.now() - 1000 * 60 * 120,
    unread: 2,
  },
  {
    id: "c_3",
    name: "Priya",
    last: "Sent a voice note",
    ts: Date.now() - 1000 * 60 * 5,
    unread: 1,
  },
];

export default function ConversationsList({
  onOpenConversation = () => {},
  activeConvId = null,
}) {
  return (
    <div className="p-3">
      <div className="text-sm text-gray-500 mb-2">Chats</div>
      <div className="space-y-2">
        {MOCK_CONVS.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpenConversation(c.id)}
            className={`w-full text-left p-3 rounded hover:bg-gray-50 flex items-center justify-between ${
              activeConvId === c.id
                ? "bg-indigo-50 border border-indigo-100"
                : "bg-white"
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                {c.name[0]}
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-gray-500 truncate">{c.last}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {c.unread > 0 ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                  {c.unread}
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
