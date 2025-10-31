// src/components/profile/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import * as usersApi from "../../api/users.api";
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  Music,
  Palette,
  LogOut,
  ChevronRight,
  Camera,
  Save,
  X,
  Loader2,
} from "lucide-react";

/**
 * SettingsPage - Comprehensive user settings with real backend integration
 */

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const {
    theme: currentTheme,
    accentColor: currentAccentColor,
    changeTheme,
    changeAccentColor,
  } = useTheme();

  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  // Privacy settings
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [whoCanSendRequests, setWhoCanSendRequests] = useState("everyone");
  const [showLikedSongs, setShowLikedSongs] = useState(true);
  const [showPlaylists, setShowPlaylists] = useState(true);

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [friendRequestNotifs, setFriendRequestNotifs] = useState(true);
  const [likeNotifs, setLikeNotifs] = useState(true);
  const [commentNotifs, setCommentNotifs] = useState(true);

  // Playback settings
  const [audioQuality, setAudioQuality] = useState("high");
  const [autoplay, setAutoplay] = useState(true);
  const [crossfade, setCrossfade] = useState(false);
  const [crossfadeDuration, setCrossfadeDuration] = useState(5);

  // Appearance - use theme from context
  const [theme, setTheme] = useState(currentTheme);
  const [accentColor, setAccentColor] = useState(currentAccentColor);

  // Load user settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        // Profile data from user object
        setDisplayName(user.displayName || "");
        setBio(user.bio || "");
        setLocation(user.location || "");
        setWebsite(user.website || "");

        // Settings from user.settings object
        if (user.settings) {
          // Privacy
          setIsPrivateAccount(user.isPrivate || false);
          setWhoCanSendRequests(
            user.settings.privacy?.whoCanSendRequests || "everyone"
          );
          setShowLikedSongs(user.settings.privacy?.showLikedSongs !== false);
          setShowPlaylists(user.settings.privacy?.showPlaylists !== false);

          // Notifications
          setPushNotifications(user.settings.notifications?.push !== false);
          setEmailNotifications(user.settings.notifications?.email !== false);
          setFriendRequestNotifs(
            user.settings.notifications?.friendRequests !== false
          );
          setLikeNotifs(user.settings.notifications?.likes !== false);
          setCommentNotifs(user.settings.notifications?.comments !== false);

          // Playback
          setAudioQuality(user.settings.playback?.audioQuality || "high");
          setAutoplay(user.settings.playback?.autoplay !== false);
          setCrossfade(user.settings.playback?.crossfade || false);
          setCrossfadeDuration(user.settings.playback?.crossfadeDuration || 5);

          // Appearance
          setTheme(user.settings.appearance?.theme || "light");
          setAccentColor(user.settings.appearance?.accentColor || "purple");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({
        displayName,
        bio,
        location,
        website,
      });

      setIsEditing(false);

      // Reload user data
      if (refreshUser) {
        await refreshUser();
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setDisplayName(user?.displayName || "");
    setBio(user?.bio || "");
    setLocation(user?.location || "");
    setWebsite(user?.website || "");
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      console.log("📸 Uploading avatar...");
      const response = await usersApi.uploadAvatar(file);
      console.log("✅ Avatar uploaded:", response.avatarUrl);

      // Reload user data to show new avatar
      if (refreshUser) {
        await refreshUser();
      }

      alert("Avatar updated successfully!");
    } catch (error) {
      console.error("❌ Error uploading avatar:", error);
      alert(error.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveSettings = async (section) => {
    setSaving(true);
    try {
      console.log(`💾 Saving ${section} settings...`);

      switch (section) {
        case "privacy":
          const privacyData = {
            isPrivate: isPrivateAccount,
            whoCanSendRequests,
            showLikedSongs,
            showPlaylists,
          };
          console.log("🔒 Privacy settings:", privacyData);
          await usersApi.updatePrivacySettings(privacyData);
          break;
        case "notifications":
          const notifData = {
            push: pushNotifications,
            email: emailNotifications,
            friendRequests: friendRequestNotifs,
            likes: likeNotifs,
            comments: commentNotifs,
          };
          console.log("🔔 Notification settings:", notifData);
          await usersApi.updateNotificationSettings(notifData);
          break;
        case "playback":
          const playbackData = {
            audioQuality,
            autoplay,
            crossfade,
            crossfadeDuration,
          };
          console.log("🎵 Playback settings:", playbackData);
          await usersApi.updatePlaybackSettings(playbackData);
          break;
        case "appearance":
          const appearanceData = {
            theme,
            accentColor,
          };
          console.log("🎨 Appearance settings:", appearanceData);
          await usersApi.updateAppearanceSettings(appearanceData);
          break;
      }

      // Reload user data
      console.log("🔄 Refreshing user data...");
      if (refreshUser) {
        await refreshUser();
      }
      console.log("✅ Settings saved successfully!");

      alert("Settings saved successfully!");
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      alert(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/auth/login");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'This action cannot be undone. Type "DELETE" to confirm:'
    );
    if (confirmation === "DELETE") {
      try {
        await usersApi.deleteAccount();
        await logout();
        navigate("/auth/login");
        alert("Account deleted successfully");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert(error.message || "Failed to delete account");
      }
    }
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "playback", label: "Playback", icon: Music },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 bg-white rounded-2xl shadow-lg p-4">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{section.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-gray-200 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6">
            {activeSection === "profile" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Profile Settings
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Avatar Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-3xl font-bold text-purple-700 overflow-hidden">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          displayName?.charAt(0).toUpperCase() ||
                          user?.username?.charAt(0).toUpperCase() ||
                          "U"
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 shadow-lg cursor-pointer"
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                        id="avatar-upload"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-gray-700 disabled:opacity-50"
                      >
                        {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG, GIF or WebP. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="Tell us about yourself..."
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bio.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === "account" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Account Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.username || ""}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Username cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Change Password
                    </label>
                    <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "privacy" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Privacy Settings
                  </h2>
                  <button
                    onClick={() => handleSaveSettings("privacy")}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">
                        Private Account
                      </div>
                      <div className="text-sm text-gray-600">
                        Only approved followers can see your content
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPrivateAccount}
                        onChange={(e) => setIsPrivateAccount(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Who can send you friend requests?
                    </label>
                    <select
                      value={whoCanSendRequests}
                      onChange={(e) => setWhoCanSendRequests(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="friends-of-friends">
                        Friends of friends
                      </option>
                      <option value="no-one">No one</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">
                        Show Liked Songs
                      </div>
                      <div className="text-sm text-gray-600">
                        Let others see songs you've liked
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showLikedSongs}
                        onChange={(e) => setShowLikedSongs(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">
                        Show Playlists
                      </div>
                      <div className="text-sm text-gray-600">
                        Let others see your public playlists
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPlaylists}
                        onChange={(e) => setShowPlaylists(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Notification Settings
                  </h2>
                  <button
                    onClick={() => handleSaveSettings("notifications")}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">
                        Push Notifications
                      </div>
                      <div className="text-sm text-gray-600">
                        Receive notifications on your device
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotifications}
                        onChange={(e) => setPushNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">
                        Email Notifications
                      </div>
                      <div className="text-sm text-gray-600">
                        Receive updates via email
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) =>
                          setEmailNotifications(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Activity Notifications
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700">Friend Requests</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={friendRequestNotifs}
                            onChange={(e) =>
                              setFriendRequestNotifs(e.target.checked)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700">
                          Likes on your songs
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={likeNotifs}
                            onChange={(e) => setLikeNotifs(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700">Comments</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={commentNotifs}
                            onChange={(e) => setCommentNotifs(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "playback" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Playback Settings
                  </h2>
                  <button
                    onClick={() => handleSaveSettings("playback")}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Audio Quality
                    </label>
                    <select
                      value={audioQuality}
                      onChange={(e) => setAudioQuality(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="low">Low (96 kbps)</option>
                      <option value="normal">Normal (160 kbps)</option>
                      <option value="high">High (320 kbps)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">Autoplay</div>
                      <div className="text-sm text-gray-600">
                        Continue playing similar songs when queue ends
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoplay}
                        onChange={(e) => setAutoplay(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">Crossfade</div>
                      <div className="text-sm text-gray-600">
                        Smooth transition between songs
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crossfade}
                        onChange={(e) => setCrossfade(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {crossfade && (
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Crossfade Duration: {crossfadeDuration}s
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={crossfadeDuration}
                        onChange={(e) =>
                          setCrossfadeDuration(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === "appearance" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Appearance
                  </h2>
                  <button
                    onClick={() => handleSaveSettings("appearance")}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["light", "dark"].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTheme(t);
                            changeTheme(t); // Apply theme immediately
                          }}
                          className={`px-4 py-3 border rounded-lg capitalize ${
                            theme === t
                              ? "border-purple-600 bg-purple-50 text-purple-700"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">
                      Accent Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { name: "purple", color: "bg-purple-600" },
                        { name: "blue", color: "bg-blue-600" },
                        { name: "pink", color: "bg-pink-600" },
                        { name: "green", color: "bg-green-600" },
                        { name: "orange", color: "bg-orange-600" },
                        { name: "red", color: "bg-red-600" },
                        { name: "yellow", color: "bg-yellow-600" },
                        { name: "indigo", color: "bg-indigo-600" },
                      ].map((c) => (
                        <button
                          key={c.name}
                          onClick={() => {
                            setAccentColor(c.name);
                            changeAccentColor(c.name); // Apply accent color immediately
                          }}
                          className={`h-12 rounded-lg ${c.color} ${
                            accentColor === c.name
                              ? "ring-4 ring-offset-2 ring-gray-400"
                              : ""
                          }`}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border-2 border-red-200">
          <h3 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Delete Account</div>
                <div className="text-sm text-gray-600">
                  Permanently delete your account and all data
                </div>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
