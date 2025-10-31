# Component API Reference

Quick reference for all major Dhvny frontend components.

## 🎵 Song Components

### SongCard

**Location**: `src/components/song/SongCard.jsx`

Displays a song with controls.

```jsx
import SongCard from "./components/song/SongCard";

<SongCard
  song={{
    songId: "123",
    title: "Song Title",
    artist: "Artist Name",
    coverUrl: "https://...",
    audioUrl: "https://...",
    duration: 210,
    tags: ["pop", "2024"],
    isLegend: false,
    liked: false,
  }}
  compact={false}
  showControls={true}
  onOpenComments={(song) => {}}
  onOpenKaraoke={(song) => {}}
  onAddToCollection={(song) => {}}
  onShare={(song) => {}}
/>;
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `song` | `Song` | required | Song object with id, title, artist, etc. |
| `compact` | `boolean` | `false` | Smaller UI variant |
| `showControls` | `boolean` | `true` | Show play/like/options buttons |
| `onOpenComments` | `function` | `undefined` | Callback when comments clicked |
| `onOpenKaraoke` | `function` | `undefined` | Callback when karaoke clicked |
| `onAddToCollection` | `function` | `undefined` | Callback when add to collection clicked |
| `onShare` | `function` | `undefined` | Callback when share clicked |

**Actions**:

- Click cover → Play now (replaces queue)
- Click play button → Toggle play/pause
- Click heart → Like/unlike
- Click three-dot menu → Open SongOptionsMenu

---

### SongOptionsMenu

**Location**: `src/components/song/SongOptionsMenu.jsx`

Popover menu with song actions.

```jsx
import SongOptionsMenu from "./components/song/SongOptionsMenu";

<SongOptionsMenu
  song={songObject}
  onClose={() => setShowMenu(false)}
  onOpenComments={(song) => {}}
  onOpenKaraoke={(song) => {}}
  onAddToCollection={(song) => {}}
  onShare={(song) => {}}
/>;
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `song` | `Song` | Yes | Song object |
| `onClose` | `function` | Yes | Close callback |
| `onOpenComments` | `function` | No | Comments callback |
| `onOpenKaraoke` | `function` | No | Karaoke callback |
| `onAddToCollection` | `function` | No | Collection callback |
| `onShare` | `function` | No | Share callback |

**Features**:

- Play now / Play next / Add to queue
- Like/Unlike with optimistic UI
- Promote to Legend (server + localStorage fallback)
- Share (copy to clipboard)
- Open comments
- Open karaoke

---

## 🎹 Player Components

### FullPlayer

**Location**: `src/components/player/FullPlayer.jsx`

Full-screen player UI.

```jsx
import FullPlayer from "./components/player/FullPlayer";

<FullPlayer />;
```

**No props** - uses `usePlayer()` internally.

**Features**:

- Large album art
- Seek bar (click to seek)
- Position & duration display
- Play/pause/prev/next controls
- Volume slider
- Lyrics toggle
- Comments overlay
- Jam session dialog
- Song options menu

---

### PlayerBar

**Location**: `src/components/player/PlayerBar.jsx`

Sticky bottom player bar.

```jsx
import PlayerBar from "./components/player/PlayerBar";

<PlayerBar />;
```

**No props** - uses `usePlayer()` internally.

**Displays**:

- Song thumbnail
- Title & artist
- Play/pause/next buttons
- Progress bar

---

### QueueViewer

**Location**: `src/components/player/QueueViewer.jsx`

Developer tool for queue management.

```jsx
import QueueViewer from "./components/player/QueueViewer";

<QueueViewer />;
```

**No props** - uses `usePlayer()` internally.

**Actions**:

- Jump to song
- Remove from queue
- Move up/down
- Clear queue

---

## 💬 Social Components

### CommentsOverlay

**Location**: `src/components/comments/CommentsOverlay.jsx`

Modal for viewing and posting comments.

```jsx
import CommentsOverlay from "./components/comments/CommentsOverlay";

<CommentsOverlay
  visible={showComments}
  onClose={() => setShowComments(false)}
  song={currentSong}
/>;
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | Yes | Show/hide overlay |
| `onClose` | `function` | Yes | Close callback |
| `song` | `Song` | Yes | Song to show comments for |

**Features**:

- Load comments from API or sample data
- Post comment with optimistic UI
- Like/unlike comments
- Auto-focus input when opened

---

## 🏠 Layout Components

### MobileShell

**Location**: `src/components/layout/MobileShell.jsx`

Main app shell container.

```jsx
import MobileShell from "./components/layout/MobileShell";

<MobileShell>
  <Routes>{/* Your routes */}</Routes>
</MobileShell>;
```

**Props**: All optional (uses contexts internally).

**Structure**:

- Top bar (profile, search, notifications)
- Main content area (`children`)
- Mini-player (bottom, above nav)
- Bottom navigation (Home, Collections, Friends, Now Playing)

**Optional Props** (for standalone use):

```jsx
<MobileShell
  currentUser={{ name: "John", avatar: "..." }}
  onProfileClick={() => {}}
  onNotificationsClick={() => {}}
  onSearch={(query) => {}}
  currentSong={{ title: "...", artist: "..." }}
  onMiniPlayerClick={() => {}}
  onTogglePlay={() => {}}
  onPlayNext={() => {}}
  unreadNotifications={3}
/>
```

---

## 🎸 Jam Components

### JamRoom

**Location**: `src/components/jam/JamRoom.jsx`

Simulated jam session room.

```jsx
import JamRoom from "./components/jam/JamRoom";

<JamRoom onClose={() => {}} />;
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onClose` | `function` | Yes | Close callback |

**Features**:

- Host controls (play/pause/next/prev)
- Participant list
- Simulated sync (no real WebSocket yet)

---

### JamRequestDialog

**Location**: `src/components/jam/JamRequestDialog.jsx`

Dialog for jam session requests.

```jsx
import JamRequestDialog from "./components/jam/JamRequestDialog";

<JamRequestDialog
  visible={showDialog}
  onClose={() => {}}
  onRequest={(friendId) => {}}
/>;
```

**Props**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `visible` | `boolean` | Yes | Show/hide dialog |
| `onClose` | `function` | Yes | Close callback |
| `onRequest` | `function` | No | Request jam callback |

---

## 📝 Form Components

### LoginPage

**Location**: `src/pages/Auth/LoginPage.jsx`

Login form page.

```jsx
// Route: /auth/login
```

**No props** - uses `useAuth()` internally.

**Features**:

- Email/username input
- Password input
- Error display
- Redirects to previous page on success

---

### RegisterPage

**Location**: `src/pages/Auth/RegisterPage.jsx`

Registration form page.

```jsx
// Route: /auth/register
```

**No props** - uses `useAuth()` internally.

---

## 🎨 Usage Patterns

### Playing a Song

```jsx
import { usePlayer } from "./hooks/usePlayer";

function MyComponent() {
  const { setQueue, setPlaying } = usePlayer();

  const playSong = (song) => {
    setQueue([song], 0, true); // queue, startIndex, autoplay
  };

  return <button onClick={() => playSong(song)}>Play</button>;
}
```

### Adding to Queue

```jsx
const { addToQueue, addToQueueNext } = usePlayer();

// Add to end
addToQueue(song);

// Add after current
addToQueueNext(song);
```

### Checking Auth

```jsx
const { user, isAuthenticated, login, logout } = useAuth();

if (!isAuthenticated) {
  return <LoginPrompt />;
}

return <ProfileButton user={user} onLogout={logout} />;
```

### Making API Calls

```jsx
import songsApi from "./api/songs.api";

const loadSongs = async () => {
  try {
    const { songs } = await songsApi.listSongs({ limit: 20 });
    setSongs(songs);
  } catch (error) {
    console.error("Failed to load songs:", error);
  }
};
```

---

## 🔗 Related Docs

- [README.md](./README.md) - Main documentation
- [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) - Recent changes
- [Architecture Overview](./README.md#architecture)
- [API Reference](./README.md#api-integration)
