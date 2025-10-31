# Dhvny — Music Social Platform Frontend

A mobile-first React application for music listening, queuing, and social interactions. Built with React Router, Tailwind CSS, and designed to work offline with localStorage fallbacks.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit http://localhost:5173 (or the port Vite assigns)

## ✨ Key Features

### 🎵 Music Player

- Full queue management with drag-and-drop reordering
- Play/pause, next/previous, seek, volume controls
- Shuffle & repeat modes
- Persistent playback state (survives page refresh)
- Full-screen player UI with lyrics and comments

### 🎤 Social Features

- Post and like comments on songs (optimistic UI)
- Friends system with jam session invites
- Community-driven Legend promotions
- Real-time activity notifications

### 📚 Collections & Playlists

- Create and manage custom playlists
- Works offline with localStorage
- Quick actions: add songs, play collection

### 🔐 Authentication

- Token-based auth with auto-refresh
- Auto-logout on 401 responses
- Protected routes

## 📁 Project Structure

```
src/
├── api/              # API client & endpoints
├── components/       # React components
│   ├── layout/      # MobileShell, HeaderTop, BottomNav
│   ├── player/      # FullPlayer, PlayerBar, QueueViewer
│   ├── song/        # SongCard, SongOptionsMenu
│   └── comments/    # CommentsOverlay
├── contexts/         # AuthContext, PlayerContext
├── hooks/            # useAuth, usePlayer
├── pages/            # Route components
├── services/         # Business logic (playerService)
├── data/             # Sample songs
└── App.jsx           # Root component
```

## 🎯 Core Components

### SongCard

Displays song with cover, title, artist, and controls.

- Click cover → Play now
- Heart icon → Like/unlike
- Three dots → Open options menu

### SongOptionsMenu

Full-featured action menu:

- Play now / Play next / Add to queue
- Like/Unlike
- Promote to Legend / Demote
- Add to collection
- Share (copy to clipboard)
- Open comments
- Open karaoke mode

### FullPlayer

Full-screen player at `/now-playing`:

- Large album art
- Seek bar with current position
- Playback controls
- Volume slider
- Lyrics toggle
- Comments overlay
- Jam session dialog

## 🔌 State Management

### AuthContext

```jsx
const { user, isAuthenticated, login, logout } = useAuth();
```

Provides:

- Current user state
- Login/register/logout methods
- Token management
- Auto-restore on mount

### PlayerContext

```jsx
const {
  queue,
  currentSong,
  isPlaying,
  position,
  duration,
  addToQueue,
  togglePlaying,
  seek,
} = usePlayer();
```

Manages:

- Audio element lifecycle
- Queue operations
- Playback state
- Progress tracking

## 🌐 API Integration

### API Client (`src/api/client.js`)

Fetch wrapper with:

- Automatic auth token injection
- JSON/FormData support
- 401 handling
- Error parsing

```javascript
import api from "./api/client";

await api.get("/songs");
await api.post("/songs", { title: "New Song" });
```

### Songs API (`src/api/songs.api.js`)

```javascript
import songsApi from "./api/songs.api";

// List songs
const { songs } = await songsApi.listSongs({ limit: 20 });

// Like song
await songsApi.likeSong(songId, true);

// Promote to Legend
await songsApi.setLegend(songId, true);

// Get comments
const comments = await songsApi.getComments(songId);
```

## 💾 Data Persistence

### localStorage Keys

| Key                           | Purpose                        |
| ----------------------------- | ------------------------------ |
| `dhvny_token`                 | JWT auth token                 |
| `dhvny_player`                | Player state (queue, position) |
| `dhvny_legend_promotions_v1`  | Legend vote counts             |
| `dhvny_collections_v1`        | User playlists                 |
| `dhvny_friends_v1`            | Friends list                   |
| `dhvny_notifications_demo_v1` | Notifications                  |

## 🛠️ Development

### Environment Variables

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### Dev Pages

- `/test-songs` - Quick song testing with sample data
- `/test-songs-advanced` - Advanced player controls

### Running Tests

```bash
# Unit tests (when added)
npm test

# E2E tests (when added)
npm run test:e2e
```

## 🚀 Deployment

### Build

```bash
npm run build
```

### Deploy to Netlify

```bash
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
vercel --prod
```

## 📝 API Requirements

Backend should implement:

**Auth**:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`

**Songs**:

- `GET /songs`
- `GET /songs/:id`
- `POST /songs` (with file upload)
- `POST /songs/:id/like`
- `POST /songs/:id/legend`

**Comments**:

- `GET /songs/:id/comments`
- `POST /songs/:id/comments`
- `POST /comments/:id/like`

## 🔮 Roadmap

### Planned Features

- Real-time jam sessions (WebSocket)
- Search functionality
- File upload with progress
- TypeScript migration
- Unit & E2E tests
- PWA support

## 📄 License

[Your License]

---

**Built with ❤️ using React, Vite, and Tailwind CSS**
