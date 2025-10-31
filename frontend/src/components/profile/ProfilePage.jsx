// src/components/profile/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as usersApi from "../../api/users.api";
import * as friendsApi from "../../api/friends.api";
import SongCard from "../song/SongCard";
import {
  User,
  Music,
  Heart,
  ListMusic,
  Users,
  Settings,
  Edit3,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Share2,
  UserPlus,
  UserMinus,
  Crown,
  Loader2,
  UserCheck,
  MessageCircle,
  Activity,
} from "lucide-react";

/**
 * ProfilePage - Complete user profile with all features working
 */

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uploads");
  const [tabLoading, setTabLoading] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [stats, setStats] = useState({
    uploads: 0,
    likes: 0,
    playlists: 0,
    followers: 0,
    following: 0,
  });

  // Content for active tab
  const [uploads, setUploads] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const isOwnProfile = currentUser?.username === username || !username;

  // Load profile data
  const loadProfile = async () => {
    setLoading(true);
    try {
      const usernameToFetch = username || currentUser?.username;

      if (!usernameToFetch) {
        setLoading(false);
        return;
      }

      const response = await usersApi.getProfileByUsername(usernameToFetch);
      const userData = response.user;

      setProfileUser(userData);

      // Fetch liked songs count
      let likedSongsCount = 0;
      try {
        console.log("🔍 Fetching liked songs for userId:", userData._id);
        const likesResponse = await usersApi.getUserLikes(userData._id);
        console.log("📦 Likes API response:", likesResponse);
        console.log("💖 Songs array:", likesResponse.songs);
        likedSongsCount = likesResponse.songs?.length || 0;
        console.log("✅ Liked songs count:", likedSongsCount);
      } catch (error) {
        console.error("❌ Error loading liked songs count:", error);
        console.error("Error details:", error.response?.data || error.message);
      }

      setStats({
        uploads: userData.stats?.uploads || 0,
        likes: likedSongsCount,
        playlists: userData.stats?.playlists || 0,
        followers: userData.followersCount || 0,
        following: userData.followingCount || 0,
      }); // Load friendship status if viewing another user's profile
      if (!isOwnProfile && userData._id) {
        try {
          const statusResponse = await friendsApi.getFriendshipStatus(
            userData._id
          );
          setFriendshipStatus(statusResponse.status);
        } catch (error) {
          console.error("Error loading friendship status:", error);
          setFriendshipStatus(null);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Load tab content
  const loadTabContent = async (tab) => {
    if (!profileUser) return;

    setTabLoading(true);
    try {
      switch (tab) {
        case "uploads": {
          const uploadsResponse = await usersApi.getUserUploads(
            profileUser._id
          );
          setUploads(uploadsResponse.songs || []);
          break;
        }
        case "likes": {
          const likesResponse = await usersApi.getUserLikes(profileUser._id);
          setLikedSongs(likesResponse.songs || []);
          break;
        }
        case "playlists": {
          const playlistsResponse = await usersApi.getUserPlaylists(
            profileUser._id
          );
          setPlaylists(playlistsResponse.playlists || []);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tab}:`, error);
    } finally {
      setTabLoading(false);
    }
  };

  // Load content when tab changes
  useEffect(() => {
    if (profileUser) {
      loadTabContent(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, profileUser]);

  // Handle sending friend request
  const handleSendFriendRequest = async () => {
    if (!profileUser) return;

    try {
      await friendsApi.sendFriendRequest(profileUser._id);
      setFriendshipStatus("pending");
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("Failed to send friend request");
    }
  };

  // Handle share profile
  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileUser.username}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profileUser.displayName}'s Profile`,
          text: `Check out ${profileUser.displayName} on Dhvny`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        alert("Profile link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Profile not found</div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24 overflow-x-hidden">
      {/* Header with cover/banner area */}
      <div className="relative h-48 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto px-4 -mt-20">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0 mx-auto md:mx-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-3xl md:text-4xl font-bold text-purple-700 shadow-lg border-4 border-white">
                {profileUser.avatarUrl ? (
                  <img
                    src={profileUser.avatarUrl}
                    alt={profileUser.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profileUser.displayName?.charAt(0).toUpperCase()
                )}
              </div>
              {profileUser.isLegend && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full shadow-lg">
                  <Crown className="w-5 h-5 text-yellow-800" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4">
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
                    {profileUser.displayName}
                    {profileUser.isLegend && (
                      <span className="ml-2 text-yellow-500">⭐</span>
                    )}
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base break-all">
                    @{profileUser.username}
                  </p>
                  {profileUser.bio && (
                    <p className="mt-2 text-sm md:text-base text-gray-700 break-words">
                      {profileUser.bio}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="mt-3 flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                    {profileUser.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">{profileUser.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span>
                        Joined{" "}
                        {profileUser.createdAt
                          ? new Date(profileUser.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Recently"}
                      </span>
                    </div>
                    {profileUser.website && (
                      <a
                        href={profileUser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-purple-600 hover:text-purple-700 truncate"
                      >
                        <LinkIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="truncate">Website</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => navigate("/settings")}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                      <button
                        onClick={() => navigate("/settings")}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-gray-600" />
                      </button>
                    </>
                  ) : (
                    <>
                      {friendshipStatus === "friends" ? (
                        <button
                          onClick={() =>
                            navigate(`/messages/${profileUser._id}`)
                          }
                          className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                      ) : friendshipStatus === "pending" ? (
                        <button
                          disabled
                          className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Request Sent</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleSendFriendRequest}
                          className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </button>
                      )}
                      <button
                        onClick={handleShare}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors text-center">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.uploads}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Uploads
                  </div>
                </div>
                <div className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors text-center">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.likes}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">Likes</div>
                </div>
                <div className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors text-center">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.playlists}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Playlists
                  </div>
                </div>
                <div className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors text-center">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.followers}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Followers
                  </div>
                </div>
                <div className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors text-center col-span-2 sm:col-span-1">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">
                    {stats.following}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Following
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-t border-gray-200">
            <div className="flex gap-1 mt-4">
              {[
                { id: "uploads", label: "Uploads", icon: Music },
                { id: "likes", label: "Likes", icon: Heart },
                { id: "playlists", label: "Playlists", icon: ListMusic },
                { id: "activity", label: "Activity", icon: User },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      loadTabContent(tab.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          {activeTab === "uploads" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Uploaded Songs
              </h2>
              {tabLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : uploads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No uploads yet</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {uploads.map((song) => (
                    <SongCard key={song._id} song={song} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "likes" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Liked Songs
              </h2>
              {tabLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : likedSongs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No liked songs yet</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {likedSongs.map((song) => (
                    <SongCard key={song._id} song={song} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "playlists" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Playlists
              </h2>
              {tabLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : playlists.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ListMusic className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No playlists yet</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist._id}
                      onClick={() => navigate(`/playlist/${playlist._id}`)}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ListMusic className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {playlist.name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {playlist.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {playlist.songs?.length || 0} songs
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Activity timeline coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
