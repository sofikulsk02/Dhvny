import React, { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useAuth } from "../hooks/useAuth";

export default function NotificationTest() {
  const { socket, isConnected } = useSocket();
  const { notifications, unreadCount, loading, fetchNotifications } =
    useNotifications();
  const { user } = useAuth();
  const [testResult, setTestResult] = useState([]);

  const addLog = (message, type = "info") => {
    setTestResult((prev) => [
      ...prev,
      { message, type, time: new Date().toLocaleTimeString() },
    ]);
  };

  useEffect(() => {
    if (user) {
      addLog(`✅ User logged in: ${user.displayName} (${user._id})`, "success");
    } else {
      addLog("❌ No user logged in", "error");
    }
  }, [user]);

  useEffect(() => {
    if (isConnected) {
      addLog("✅ Socket.IO connected", "success");
    } else {
      addLog("❌ Socket.IO not connected", "error");
    }
  }, [isConnected]);

  const handleTestFetch = async () => {
    addLog("🔄 Testing fetchNotifications...");
    try {
      await fetchNotifications();
      addLog(
        `✅ Fetch successful! Got ${notifications.length} notifications`,
        "success"
      );
    } catch (error) {
      addLog(`❌ Fetch failed: ${error.message}`, "error");
    }
  };

  const handleTestSocket = () => {
    if (!socket) {
      addLog("❌ Socket not available", "error");
      return;
    }

    addLog("🔄 Testing socket emit...");
    socket.emit("test", { message: "Hello from client" });
    addLog("✅ Socket emit sent", "success");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔔 Notification System Test</h1>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              User Status
            </h3>
            <p
              className={`text-2xl font-bold ${
                user ? "text-green-600" : "text-red-600"
              }`}
            >
              {user ? "✅ Logged In" : "❌ Not Logged In"}
            </p>
            {user && (
              <p className="text-xs text-gray-500 mt-1">{user.displayName}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Socket Status
            </h3>
            <p
              className={`text-2xl font-bold ${
                isConnected ? "text-green-600" : "text-red-600"
              }`}
            >
              {isConnected ? "✅ Connected" : "❌ Disconnected"}
            </p>
            {socket && (
              <p className="text-xs text-gray-500 mt-1">
                Socket ID: {socket.id}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Notifications
            </h3>
            <p className="text-2xl font-bold text-indigo-600">
              {loading ? "⏳ Loading..." : `${notifications.length} Total`}
            </p>
            <p className="text-xs text-gray-500 mt-1">{unreadCount} unread</p>
          </div>
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={handleTestFetch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Test Fetch Notifications
            </button>
            <button
              onClick={handleTestSocket}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={!socket}
            >
              Test Socket Emit
            </button>
          </div>
        </div>

        {/* Test Log */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResult.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded ${
                  log.type === "success"
                    ? "bg-green-50 text-green-800"
                    : log.type === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-blue-50 text-blue-800"
                }`}
              >
                <span className="text-xs text-gray-500">[{log.time}]</span>{" "}
                {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Current Notifications ({notifications.length})
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications found</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div key={notification._id} className="p-3 border rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{notification.type}</p>
                      <p className="text-sm text-gray-600">
                        {notification.content}
                      </p>
                      {notification.sender && (
                        <p className="text-xs text-gray-500 mt-1">
                          From: {notification.sender.displayName}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        notification.isRead ? "bg-gray-200" : "bg-purple-200"
                      }`}
                    >
                      {notification.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
