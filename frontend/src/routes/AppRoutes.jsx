import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import MySongsPage from "../pages/MySongsPage";
import CollectionsPage from "../pages/CollectionsPage";
import FriendsPage from "../pages/FriendsPage";
import NowPlayingPage from "../pages/NowPlayingPage";
import SongDetailPage from "../pages/SongDetailPage";
import SearchPage from "../pages/SearchPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import NotificationsPage from "../pages/NotificationsPage";
import NotificationTest from "../pages/NotificationTest";
import JamSessionsPage from "../pages/JamSessionsPage";
import JamRoomPage from "../pages/JamRoomPage";
import TestSongsPage from "../pages/TestSongsPage";
import UploadPage from "../pages/UploadPage";
import PlaylistDetail from "../components/collections/PlaylistDetail";
import ProfilePage from "../components/profile/ProfilePage";
import SettingsPage from "../components/profile/SettingsPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
// import PlaylistPage from "./pages/PlaylistPage";
// import TestSongsAdvancedPage from "./pages/TestSongsAdvancedPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-test"
        element={
          <ProtectedRoute>
            <NotificationTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jam"
        element={
          <ProtectedRoute>
            <JamSessionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jam/:sessionId"
        element={
          <ProtectedRoute>
            <JamRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-songs"
        element={
          <ProtectedRoute>
            <MySongsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collections"
        element={
          <ProtectedRoute>
            <CollectionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists/:playlistId"
        element={
          <ProtectedRoute>
            <PlaylistDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/now-playing"
        element={
          <ProtectedRoute>
            <NowPlayingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/songs/:songId"
        element={
          <ProtectedRoute>
            <SongDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-songs"
        element={
          <ProtectedRoute>
            <TestSongsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
