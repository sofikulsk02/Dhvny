// src/components/layout/ProfileSidebar.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * ProfileSidebar - simple user drawer
 * Props:
 *  - onClose() optional
 */

export default function ProfileSidebar({ onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    onClose();
    navigate("/auth/login");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Profile</div>
          <div className="text-lg font-semibold">
            {user?.displayName ?? user?.username ?? "Guest"}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500">
          Close
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
          {user?.displayName?.[0] ?? "U"}
        </div>
        <div>
          <div className="font-medium">{user?.displayName ?? "User"}</div>
          <div className="text-xs text-gray-500">
            @{user?.username ?? "guest"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => navigate("/profile")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
        >
          View profile
        </button>
        <button
          onClick={() => navigate("/collections")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
        >
          Your collections
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50"
        >
          Settings
        </button>
      </div>

      <div>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 bg-red-500 text-white rounded"
        >
          Sign out
        </button>
      </div>

      <div className="text-xs text-gray-400">Dhvny • v1 (dev)</div>
    </div>
  );
}
