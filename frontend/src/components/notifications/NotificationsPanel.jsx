// src/components/notifications/NotificationsPanel.jsx
import React, { useState } from "react";

/**
 * NotificationsPanel - can be used as page or small dropdown panel
 */
export default function NotificationsPanel({ initial = [] }) {
  const [items, setItems] = useState(
    initial.length
      ? initial
      : [
          {
            id: "n1",
            type: "friend_request",
            text: "Aisha sent a friend request",
            read: false,
          },
          {
            id: "n2",
            type: "jam",
            text: "Ravi invited you to jam",
            read: false,
          },
        ]
  );

  function accept(id) {
    console.log("accept", id);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
  }
  function reject(id) {
    console.log("reject", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function markRead(id) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
  }
  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  return (
    <div className="p-3 bg-white rounded shadow max-w-md">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Notifications</div>
        <button onClick={markAllRead} className="text-xs text-gray-500">
          Mark all
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((i) => (
          <li
            key={i.id}
            className={`p-2 rounded ${i.read ? "bg-white" : "bg-indigo-50"}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-800">{i.text}</div>
                <div className="text-xs text-gray-400 mt-1">{i.type}</div>
              </div>
              <div className="flex items-center space-x-2">
                {!i.read && (
                  <button
                    onClick={() => accept(i.id)}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                  >
                    Accept
                  </button>
                )}
                {!i.read && (
                  <button
                    onClick={() => reject(i.id)}
                    className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => markRead(i.id)}
                  className="text-xs text-gray-500"
                >
                  Mark read
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
