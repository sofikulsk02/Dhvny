import React, { useState, useMemo, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usePlayer } from "../../hooks/usePlayer";
import { useNotifications } from "../../contexts/NotificationContext";

// icons component
const IconProfile = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 20c0-3.3137 2.6863-6 6-6h4c3.3137 0 6 2.6863 6 6"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconBell = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.5 14.5V11c0-3.19-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v0.68C7.64 5.36 6 7.81 6 11v3.5c0 .6-.24 1.18-.645 1.595L4 17h11z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSearch = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M21 21l-4.35-4.35"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const IconPlay = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
  </svg>
);

const IconPause = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="6" y="4" width="4" height="16" fill="currentColor" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" />
  </svg>
);

const IconHome = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11.5z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconCollections = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 7h18M3 12h18M3 17h18"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconFriends = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM6 11c1.657 0 3-1.343 3-3S7.657 5 6 5 3 6.343 3 8s1.343 3 3 3z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 20c0-2.209 1.791-4 4-4h8c2.209 0 4 1.791 4 4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconNow = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 3v18M3 12h18"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconJam = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 14.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9h2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="15" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const IconMusic = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM21 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ----------------------
   MobileShell component
   ---------------------- */
export default function MobileShell(props) {
  const {
    children,
    currentUser: propCurrentUser = null,
    onProfileClick: propOnProfileClick = () => {},
    onNotificationsClick: propOnNotificationsClick = null, // Changed to null so we can detect if not provided
    onSearch: propOnSearch = (q) => {
      console.log(q);
    },
    onMiniPlayerClick: propOnMiniPlayerClick = () => {},
    currentSong: propCurrentSong = null,
    isPlaying: propIsPlaying = false,
    onTogglePlay: propOnTogglePlay = () => {},
    onPlayNext: propOnPlayNext = () => {},
    unreadNotifications: propUnreadNotifications = 0,
  } = props;

  // Always call hooks unconditionally - React requirement
  // MobileShell must be used inside AuthProvider and PlayerProvider
  const auth = useAuth();
  const player = usePlayer();
  const notifications = useNotifications();

  // Use contexts first (if present), otherwise fall back to props
  const currentUser = auth?.user ?? propCurrentUser;

  // Toggle notification page - if already on notifications, go home
  const handleNotificationClick = () => {
    if (location.pathname === "/notifications") {
      console.log("🔔 Already on notifications, navigating to home");
      navigate("/");
    } else {
      console.log("🔔 Bell icon clicked! Navigating to /notifications");
      navigate("/notifications");
    }
  };

  const onNotificationsClick =
    propOnNotificationsClick || handleNotificationClick;

  const onSearch = propOnSearch;
  const onMiniPlayerClick = propOnMiniPlayerClick;

  const currentSong = player?.currentSong ?? propCurrentSong;
  const isPlaying =
    typeof player?.isPlaying !== "undefined" ? player.isPlaying : propIsPlaying;
  const onTogglePlay = player?.togglePlaying ?? propOnTogglePlay;
  const onPlayNext =
    typeof player?.playNext === "function" ? player.playNext : propOnPlayNext;

  // Get position and duration from player context
  const position = player?.position ?? 0;
  const duration = player?.duration ?? 0;
  const seek = player?.seek ?? (() => {});

  const unreadNotifications =
    notifications?.unreadCount ?? propUnreadNotifications;

  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showClear, setShowClear] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const trimmedQuery = useMemo(() => (searchQuery || "").trim(), [searchQuery]);

  // Sync search query with URL when on search page
  useEffect(() => {
    if (location.pathname === "/search") {
      const params = new URLSearchParams(location.search);
      const urlQuery = params.get("q") || "";
      if (urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
        setShowClear(!!urlQuery);
      }
    }
  }, [location.pathname, location.search]);

  // Real-time search - navigate to search page as user types
  useEffect(() => {
    if (trimmedQuery.length > 0) {
      // Navigate to search page with query
      const currentPath = location.pathname;
      const newPath = `/search?q=${encodeURIComponent(trimmedQuery)}`;

      // Only navigate if not already on search page or query changed
      if (
        currentPath !== "/search" ||
        location.search !== `?q=${encodeURIComponent(trimmedQuery)}`
      ) {
        navigate(newPath, { replace: currentPath === "/search" });
      }
    } else if (trimmedQuery.length === 0 && location.pathname === "/search") {
      // If search is cleared and we're on search page, stay there but clear results
      navigate("/search", { replace: true });
    }
  }, [trimmedQuery, navigate, location.pathname, location.search]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  function handleSearchSubmit(e) {
    e?.preventDefault?.();
    // Form submit is now just for pressing Enter - already handled by useEffect
    if (!trimmedQuery) return;
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function handleClearSearch() {
    setSearchQuery("");
    setShowClear(false);
    // Navigate back if on search page
    if (location.pathname === "/search") {
      navigate("/");
    }
  }

  function handleProfileMenuClick() {
    setShowProfileMenu(!showProfileMenu);
  }

  function handleLogout() {
    auth?.logout();
    setShowProfileMenu(false);
    navigate("/auth/login");
  }

  // Calculate progress percentage from position and duration
  const progressPercent =
    duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;

  return (
    <div
      className="mobile-shell min-h-screen max-w-md mx-auto bg-white dark:bg-[#0c0c0c] text-gray-900 dark:text-gray-100 flex flex-col transition-colors"
      style={{
        height: "100vh",
        maxWidth: 480,
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
    >
      {/* Top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center px-3 py-2 border-b dark:border-gray-700 bg-white dark:bg-[#0c0c0c] max-w-md mx-auto"
        role="banner"
      >
        {/* Profile with dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            aria-label="Open profile menu"
            onClick={handleProfileMenuClick}
            className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {currentUser && currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={`${
                  currentUser.displayName || currentUser.username
                } avatar`}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-indigo-600">
                <IconProfile size={18} />
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && currentUser && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-gray-900 truncate">
                  {currentUser.displayName || currentUser.username}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  @{currentUser.username}
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors text-left"
                >
                  <IconProfile size={16} />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-colors text-left"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.66 5.66l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.66-5.66l4.24-4.24" />
                  </svg>
                  <span>Settings</span>
                </button>

                <div className="my-2 border-t border-gray-100"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 mx-3"
          role="search"
          aria-label="Search songs"
        >
          <label htmlFor="shell-search" className="sr-only">
            Search songs
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconSearch size={16} />
            </div>

            <input
              id="shell-search"
              type="search"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowClear(!!e.target.value);
              }}
              placeholder="Search songs..."
              className="w-full pl-10 pr-10 py-2 rounded-xl border bg-gray-50 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />

            {showClear && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Open notifications"
          onClick={onNotificationsClick}
          className="p-2 rounded-full relative focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <IconBell size={20} />
          {unreadNotifications > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white"
              aria-live="polite"
            >
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 pb-32">
        <div className="px-4 py-3">{children}</div>
      </main>

      {/* Mini Player */}
      {location.pathname !== "/now-playing" && (
        <div className="fixed bottom-14 left-0 right-0 z-40 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md mx-auto">
          {currentSong ? (
            <div
              role="region"
              aria-label="Mini player"
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => navigate("/now-playing")}
            >
              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                {currentSong.coverUrl ? (
                  <img
                    src={currentSong.coverUrl}
                    alt={`${currentSong.title} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    ♪
                  </div>
                )}
              </div>

              <div className="flex-1 mx-3 min-w-0">
                <div className="text-sm font-medium truncate">
                  {currentSong.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {currentSong.artist}
                </div>

                <div
                  className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the mini player click
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    const newTime = percent * duration;
                    seek(newTime);
                  }}
                >
                  <div
                    className="h-full bg-indigo-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayNext();
                  }}
                  aria-label="Play next"
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                  title="Play next"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 4v16l11-8L5 4zM20 4v16"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="p-2 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center focus:outline-none"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <IconPause size={18} /> : <IconPlay size={18} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>No song playing</div>
                <div className="text-right">— Dhvny</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-md mx-auto"
        role="navigation"
        aria-label="Bottom Navigation"
      >
        <div className="flex justify-between items-center px-4 py-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? "text-indigo-600" : "text-gray-600"
              }`
            }
            aria-label="Home"
          >
            <div className="w-6 h-6 mb-0.5">
              <IconHome />
            </div>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/my-songs"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? "text-indigo-600" : "text-gray-600"
              }`
            }
            aria-label="My Songs"
          >
            <div className="w-6 h-6 mb-0.5">
              <IconMusic />
            </div>
            <span>My Songs</span>
          </NavLink>

          <NavLink
            to="/jam"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? "text-indigo-600" : "text-gray-600"
              }`
            }
            aria-label="Jam Sessions"
          >
            <div className="w-6 h-6 mb-0.5">
              <IconJam />
            </div>
            <span>Jam</span>
          </NavLink>

          <NavLink
            to="/collections"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? "text-indigo-600" : "text-gray-600"
              }`
            }
            aria-label="Collections"
          >
            <div className="w-6 h-6 mb-0.5">
              <IconCollections />
            </div>
            <span>Collections</span>
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? "text-indigo-600" : "text-gray-600"
              }`
            }
            aria-label="Friends"
          >
            <div className="w-6 h-6 mb-0.5">
              <IconFriends />
            </div>
            <span>Friends</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
