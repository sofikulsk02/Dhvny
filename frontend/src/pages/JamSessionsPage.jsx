import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJam } from "../contexts/JamContext";
import { useAuth } from "../hooks/useAuth";

export default function JamSessionsPage() {
  const { user } = useAuth();
  const {
    jamSessions,
    currentJamSession,
    fetchSessions,
    createSession,
    joinSession,
    loading,
  } = useJam();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    const session = await createSession(newSessionName.trim(), isPublic);
    if (session) {
      setShowCreateModal(false);
      setNewSessionName("");
      navigate(`/jam/${session._id}`);
    }
  };

  const handleJoinSession = async (sessionId) => {
    const session = await joinSession(sessionId);
    if (session) {
      navigate(`/jam/${session._id}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please log in to use Jam Sessions</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Jam Sessions 🎵
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Listen to music together in real-time with friends
        </p>
      </div>

      {/* Current Session Banner */}
      {currentJamSession && (
        <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Currently in:</p>
              <p className="font-semibold text-lg">{currentJamSession.name}</p>
              <p className="text-sm opacity-75">
                {currentJamSession.participants?.length || 0} participants
              </p>
            </div>
            <button
              onClick={() => navigate(`/jam/${currentJamSession._id}`)}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
            >
              Open Room
            </button>
          </div>
        </div>
      )}

      {/* Create Session Button */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
        >
          + Create Jam Session
        </button>
      </div>

      {/* Active Sessions List */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">Active Sessions</h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-500 mt-2">Loading sessions...</p>
          </div>
        ) : jamSessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700/80 rounded-xl shadow-sm dark:shadow-gray-900/30 ring-1 ring-black/10 dark:ring-white/5">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-500 mb-2">No active jam sessions</p>
            <p className="text-sm text-gray-400">Be the first to create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jamSessions.map((session) => {
              const isHost = session.host?._id === user._id;
              const isParticipant = session.participants?.some(
                (p) => p.user._id === user._id
              );
              const participantCount = session.participants?.length || 0;
              const isFull = participantCount >= session.maxParticipants;

              return (
                <div
                  key={session._id}
                  className="bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700/80 rounded-xl shadow-md dark:shadow-gray-900/40 p-4 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all border border-transparent dark:border-gray-600 ring-1 ring-black/10 dark:ring-white/5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {session.name}
                        </h3>
                        {isHost && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                            Host
                          </span>
                        )}
                        {session.isPublic && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Host: {session.host?.displayName || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Current Song */}
                  {session.currentSong && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Now Playing:
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.currentSong.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session.currentSong.artist}
                      </p>
                    </div>
                  )}

                  {/* Participants */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {session.participants?.slice(0, 5).map((p, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                          title={p.user?.displayName}
                        >
                          {p.user?.displayName?.[0]?.toUpperCase() || "?"}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {participantCount} / {session.maxParticipants} people
                    </p>
                  </div>

                  {/* Join Button */}
                  <button
                    onClick={() => handleJoinSession(session._id)}
                    disabled={isFull && !isParticipant}
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      isParticipant
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : isFull
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    {isParticipant
                      ? "Rejoin Session"
                      : isFull
                      ? "Session Full"
                      : "Join Session"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create Jam Session</h2>
            <form onSubmit={handleCreateSession}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="My Awesome Jam"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Make session public
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Public sessions can be joined by anyone
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSessionName("");
                  }}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSessionName.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
