import React from "react";

/**
 * FriendRequest - Display a friend request with accept/reject buttons
 */
export default function FriendRequest({ request, onAccept, onReject }) {
  const requester = request.requester;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-linear-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xl font-semibold overflow-hidden shrink-0">
            {requester?.avatar ? (
              <img
                src={requester.avatar}
                alt={requester.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              requester?.displayName?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">
              {requester?.displayName || "Unknown User"}
            </div>
            <div className="text-sm text-gray-500 truncate">
              @{requester?.username || "unknown"}
            </div>
            {requester?.bio && (
              <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                {requester.bio}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {new Date(request.requestedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 shrink-0 ml-3">
          <button
            onClick={onAccept}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
