import React, { useState } from "react";
import friendsApi from "../api/friends.api";
import usersApi from "../api/users.api";
import { useDebounce } from "../hooks/useDebounce";

/**
 * SendFriendRequestModal - Search for users and send friend requests
 */
export default function SendFriendRequestModal({
  visible,
  onClose,
  onSuccess,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  React.useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchUsers(debouncedSearch);
  }, [debouncedSearch]);

  async function searchUsers(query) {
    try {
      setSearching(true);
      const response = await usersApi.searchUsers(query);
      setSearchResults(response.users || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest(userId) {
    try {
      setSending(true);
      await friendsApi.sendFriendRequest(userId);
      alert("Friend request sent!");
      setSearchQuery("");
      setSearchResults([]);
      onSuccess?.();
    } catch (err) {
      console.error("Send request error:", err);
      alert(err.response?.data?.message || "Failed to send friend request");
    } finally {
      setSending(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Friend</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-96 px-4 pb-4">
          {searching && (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          )}

          {!searching &&
            searchResults.length === 0 &&
            searchQuery.trim().length >= 2 && (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            )}

          {!searching && searchQuery.trim().length < 2 && (
            <div className="text-center py-8 text-gray-400">
              Type at least 2 characters to search
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.displayName?.charAt(0)?.toUpperCase() || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {user.displayName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user._id)}
                    disabled={sending}
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? "Sending..." : "Add"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
