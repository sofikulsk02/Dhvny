// src/pages/FriendsPage.jsx
import React, { useState, useEffect } from "react";
import friendsApi from "../api/friends.api";
import FriendsList from "../components/friends/FriendsList";
import FriendRequest from "../components/friends/FriendRequest";
import SendFriendRequestModal from "../modals/SendFriendRequestModal";

/**
 * FriendsPage - Manage friends and friend requests
 * Tabs: Friends | Requests | Find Friends
 */

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends"); // friends | requests | find
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getPendingRequests(),
        friendsApi.getSentRequests(),
      ]);

      setFriends(friendsRes.friends || []);
      setPendingRequests(pendingRes.requests || []);
      setSentRequests(sentRes.requests || []);
    } catch (err) {
      console.error("Failed to load friends data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptRequest(requestId) {
    try {
      await friendsApi.acceptFriendRequest(requestId);
      loadData(); // Refresh all data
    } catch (err) {
      console.error("Failed to accept request:", err);
      alert("Failed to accept friend request");
    }
  }

  async function handleRejectRequest(requestId) {
    try {
      await friendsApi.rejectFriendRequest(requestId);
      loadData(); // Refresh all data
    } catch (err) {
      console.error("Failed to reject request:", err);
      alert("Failed to reject friend request");
    }
  }

  async function handleRemoveFriend(friendId) {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      await friendsApi.removeFriend(friendId);
      loadData(); // Refresh all data
    } catch (err) {
      console.error("Failed to remove friend:", err);
      alert("Failed to remove friend");
    }
  }

  function handleSendRequest() {
    setShowSendModal(true);
  }

  function handleRequestSent() {
    setShowSendModal(false);
    loadData(); // Refresh sent requests
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-gray-500">Loading friends...</div>
      </div>
    );
  }

  const requestCount = pendingRequests.length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Friends</h1>
          <button
            onClick={handleSendRequest}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Friend
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-4 py-2 font-medium ${
              activeTab === "friends"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 font-medium relative ${
              activeTab === "requests"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
          >
            Requests
            {requestCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {requestCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-4 py-2 font-medium ${
              activeTab === "sent"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600"
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "friends" && (
          <FriendsList friends={friends} onRemoveFriend={handleRemoveFriend} />
        )}

        {activeTab === "requests" && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending friend requests
              </div>
            ) : (
              pendingRequests.map((request) => (
                <FriendRequest
                  key={request._id}
                  request={request}
                  onAccept={() => handleAcceptRequest(request._id)}
                  onReject={() => handleRejectRequest(request._id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className="space-y-3">
            {sentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sent friend requests
              </div>
            ) : (
              sentRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {request.recipient?.avatar ? (
                        <img
                          src={request.recipient.avatar}
                          alt={request.recipient.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">
                          {request.recipient?.displayName?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {request.recipient?.displayName || "Unknown User"}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{request.recipient?.username || "unknown"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Sent{" "}
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Send Friend Request Modal */}
      <SendFriendRequestModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSuccess={handleRequestSent}
      />
    </div>
  );
}
