// src/components/profile/ProfileSidebar.jsx
import React from "react";
import { useAuth } from "../../hooks/useAuth";

/**
 * ProfileSidebar - slide-in sidebar to replace previous lightweight placeholder
 */
export default function ProfileSidebar({
  onClose = () => {},
  onOpenSettings = () => {},
  onOpenFriends = () => {},
}) {
  const { user } = useAuth();

  return (
    <div className="fixed inset-y-0 left-0 z-60 w-4/5 max-w-xs bg-white shadow-lg p-4 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            {(user?.displayName || "U").charAt(0)}
          </div>
          <div>
            <div className="font-medium">
              {user?.displayName || user?.username || "You"}
            </div>
            <div className="text-xs text-gray-500">
              {(user?.friendsCount || 0) + " friends"}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500">
          Close
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {}}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
        >
          Activity
        </button>
        <button
          onClick={onOpenFriends}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
        >
          Friends
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
        >
          Settings
        </button>
        <button
          onClick={() => {}}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
        >
          Uploads
        </button>
      </div>

      <div className="mt-4 border-t pt-3">
        <div className="text-xs text-gray-500 mb-2">Privacy</div>
        <div className="flex items-center justify-between">
          <div className="text-sm">Private account</div>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  );
}
