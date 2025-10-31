// src/pages/SearchPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  Music,
  Loader2,
  ArrowUpDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import * as songsApi from "../api/songs.api";
import SongCard from "../components/song/SongCard";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("relevance"); // relevance, asc, desc

  // Debounced search with useCallback to prevent too many API calls
  const searchSongs = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSongs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await songsApi.listSongs({
        page: 1,
        perPage: 100,
        q: searchQuery, // Use 'q' parameter for text search
      });
      setSongs(response.songs || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search songs");
    } finally {
      setLoading(false);
    }
  }, []);

  // Search songs when query changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSongs(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, searchSongs]);

  // Sort songs based on selected order
  const sortedSongs = useMemo(() => {
    if (!songs.length) return [];

    const songsCopy = [...songs];

    switch (sortOrder) {
      case "asc":
        return songsCopy.sort((a, b) => {
          const titleA = (a.title || "").toLowerCase();
          const titleB = (b.title || "").toLowerCase();
          return titleA.localeCompare(titleB);
        });
      case "desc":
        return songsCopy.sort((a, b) => {
          const titleA = (a.title || "").toLowerCase();
          const titleB = (b.title || "").toLowerCase();
          return titleB.localeCompare(titleA);
        });
      case "relevance":
      default:
        return songsCopy; // Keep original order (relevance from backend)
    }
  }, [songs, sortOrder]);

  const toggleSortOrder = () => {
    if (sortOrder === "relevance") {
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("relevance");
    }
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case "asc":
        return <SortAsc className="w-4 h-4" />;
      case "desc":
        return <SortDesc className="w-4 h-4" />;
      default:
        return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case "asc":
        return "A → Z";
      case "desc":
        return "Z → A";
      default:
        return "Relevance";
    }
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Search Results</h1>
        </div>
        {query && (
          <p className="text-purple-100">
            Searching for: <span className="font-semibold">"{query}"</span>
          </p>
        )}
      </div>

      {/* Sort Controls */}
      {sortedSongs.length > 0 && (
        <div className="px-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {sortedSongs.length} {sortedSongs.length === 1 ? "song" : "songs"}{" "}
            found
          </p>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {getSortIcon()}
            <span>Sort: {getSortLabel()}</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-600">Searching songs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State - No Query */}
      {!query && !loading && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Search for songs
          </h2>
          <p className="text-gray-600 max-w-sm">
            Use the search bar above to find songs by title, artist, or tags
          </p>
        </div>
      )}

      {/* Empty State - No Results */}
      {query && !loading && sortedSongs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Music className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No songs found
          </h2>
          <p className="text-gray-600 max-w-sm mb-6">
            We couldn't find any songs matching "{query}". Try different
            keywords.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse All Songs
          </button>
        </div>
      )}

      {/* Results Grid */}
      {!loading && sortedSongs.length > 0 && (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-4">
            {sortedSongs.map((song) => (
              <SongCard key={song._id} song={song} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
