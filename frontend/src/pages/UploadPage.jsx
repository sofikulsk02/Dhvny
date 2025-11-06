// src/pages/UploadPage.jsx
import React, { useState, useCallback, useRef } from "react";
import uploadApi from "../api/upload.api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // file states
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // form states
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [duration, setDuration] = useState(0);

  // ui states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const audioRef = useRef(null);

  // handle audio file selection
  const handleAudioChange = useCallback((file) => {
    if (!file) return;

    // validate file type
    if (!file.type.startsWith("audio/")) {
      setError("Please select a valid audio file");
      return;
    }

    // validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError("Audio file must be less than 50MB");
      return;
    }

    setAudioFile(file);
    setError("");

    // create audio preview to get duration
    const url = URL.createObjectURL(file);
    setAudioPreview(url);

    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(Math.round(audio.duration));
    });
  }, []);

  // handle cover image selection
  const handleCoverChange = useCallback((file) => {
    if (!file) return;

    // validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate File Sze (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be less than 5MB");
      return;
    }

    setCoverFile(file);
    setError("");

    // create preview
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }, []);

  // drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("audio/")) {
          handleAudioChange(file);
        } else if (file.type.startsWith("image/")) {
          handleCoverChange(file);
        }
      }
    },
    [handleAudioChange, handleCoverChange]
  );

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // validation
    if (!audioFile) {
      setError("Please select an audio file");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a song title");
      return;
    }

    if (!artist.trim()) {
      setError("Please enter the artist name");
      return;
    }

    if (!duration) {
      setError(
        "Audio duration could not be detected. Please try another file."
      );
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Parse tags
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const songData = {
        title: title.trim(),
        artist: artist.trim(),
        album: album.trim(),
        genre: genre.trim(),
        tags: tagsArray,
        lyrics: lyrics.trim(),
        duration,
      };

      const response = await uploadApi.uploadSong(
        songData,
        audioFile,
        coverFile
      );

      if (!response) {
        setError(
          "No response from server. Make sure the backend is running at http://localhost:4000"
        );
        return;
      }

      if (response.success) {
        // Success! Navigate to My Songs
        alert("✅ Song uploaded successfully!");
        navigate("/my-songs");
      } else {
        setError(response.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);

      // Network errors (fetch failed / connection refused)
      if (err.type === "network" || /Network error/i.test(err.message)) {
        setError(
          "Network error: could not reach the backend. Make sure the server is running at http://localhost:4000"
        );
        return;
      }

      // Unauthorized
      if (err.status === 401) {
        setError("Unauthorized: please login before uploading a song.");
        return;
      }

      // Try to extract a helpful message from the error
      const msg =
        err.body?.message || err.response?.data?.message || err.message;
      setError(msg || "Failed to upload song");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Clear form
  const handleClear = () => {
    setAudioFile(null);
    setCoverFile(null);
    setAudioPreview(null);
    setCoverPreview(null);
    setTitle("");
    setArtist("");
    setAlbum("");
    setGenre("");
    setTags("");
    setLyrics("");
    setDuration(0);
    setError("");
  };

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-8 px-4 sm:px-6 rounded-t-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Upload Song</h1>
          <p className="text-purple-100">Share your music with the world</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Audio Upload Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Audio File</h2>

            {!audioFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>

                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your audio file here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or click to browse (MP3, WAV, M4A - Max 50MB)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Choose File
                  </button>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleAudioChange(e.target.files?.[0])}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {audioFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    {duration > 0 &&
                      ` • ${Math.floor(duration / 60)}:${String(
                        duration % 60
                      ).padStart(2, "0")}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAudioFile(null);
                    setAudioPreview(null);
                    setDuration(0);
                  }}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Cover Image Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cover Image{" "}
              <span className="text-sm font-normal text-gray-500">
                (Optional)
              </span>
            </h2>

            <div className="flex items-start space-x-4">
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">
                  Upload an album cover or artwork for your song
                </p>
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Choose Image
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverChange(e.target.files?.[0])}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, or WebP • Max 5MB • Recommended: 800x800px
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Song Details
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter song title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Artist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Enter artist name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Album & Genre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Album
                  </label>
                  <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                    placeholder="Album name (optional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select genre (optional)</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="hip-hop">Hip Hop</option>
                    <option value="electronic">Electronic</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="country">Country</option>
                    <option value="r&b">R&B</option>
                    <option value="latin">Latin</option>
                    <option value="reggae">Reggae</option>
                    <option value="folk">Folk</option>
                    <option value="indie">Indie</option>
                    <option value="metal">Metal</option>
                    <option value="blues">Blues</option>
                    <option value="soul">Soul</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., summer, upbeat, party (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Lyrics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lyrics
                </label>
                <textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder="Enter song lyrics (optional)"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Uploading...
                </span>
                <span className="text-sm font-medium text-purple-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={handleClear}
              disabled={uploading}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={uploading || !audioFile || !title || !artist}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload Song"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
