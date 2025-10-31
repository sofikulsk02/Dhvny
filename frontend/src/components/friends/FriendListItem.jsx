import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * FriendListItem - Single friend card
 */
export default function FriendListItem({ friend, onRemove }) {
  const navigate = useNavigate();

  function handleViewProfile() {
    navigate(`/profile/${friend._id}`);
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Avatar */}
          <button
            onClick={handleViewProfile}
            className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xl font-semibold overflow-hidden hover:ring-2 ring-indigo-300 transition-all"
          >
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={friend.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              friend.displayName?.charAt(0)?.toUpperCase() || "?"
            )}
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <button
              onClick={handleViewProfile}
              className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate block"
            >
              {friend.displayName || "Unknown User"}
            </button>
            <div className="text-sm text-gray-500 truncate">
              @{friend.username || "unknown"}
            </div>
            {friend.bio && (
              <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                {friend.bio}
              </div>
            )}
            {friend.friendsSince && (
              <div className="text-xs text-gray-400 mt-1">
                Friends since{" "}
                {new Date(friend.friendsSince).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
          <button
            onClick={handleViewProfile}
            className="px-3 py-1.5 text-sm border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Profile
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
