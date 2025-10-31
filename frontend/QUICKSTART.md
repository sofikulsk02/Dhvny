# Quick Start Guide - Dhvny Frontend

Get up and running in 5 minutes!

## ⚡ Prerequisites

- Node.js 18+ (check: `node --version`)
- npm or yarn (check: `npm --version`)
- Git (check: `git --version`)

## 🚀 Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

**Output**:

```
  VITE v7.1.12  ready in 712 ms

  ➜  Local:   http://localhost:5173/
```

Visit http://localhost:5173 in your browser.

## ✅ Verify Installation

### Check 1: Home Page Loads

- Navigate to http://localhost:5173
- Should see the home page without errors

### Check 2: Test Songs Load

- Navigate to http://localhost:5173/test-songs
- Should see sample songs (Shakira, T-Rex demo)
- Click a song cover → should play audio

### Check 3: Player Works

- Play a song
- Bottom player bar should appear
- Should show: song title, play/pause, progress bar

### Check 4: Queue Management

- Scroll down on `/test-songs`
- See "Queue Viewer" section
- Should list queued songs
- Try "Jump", "Move Up", "Remove" buttons

## 🎯 Quick Tour

### Must-Visit Routes

| Route                  | Description                 | What to Test                     |
| ---------------------- | --------------------------- | -------------------------------- |
| `/`                    | Home page                   | Layout, navigation               |
| `/test-songs`          | Sample songs + queue viewer | Play songs, queue management     |
| `/test-songs-advanced` | Advanced controls           | Queue operations, shuffle/repeat |
| `/now-playing`         | Full-screen player          | Seek, volume, comments           |
| `/auth/login`          | Login page                  | Form validation                  |
| `/collections`         | Playlists                   | Create playlist, add songs       |
| `/friends`             | Friends list                | View friends (demo data)         |
| `/notifications`       | Activity feed               | Mark as read                     |

### Key Interactions

**Playing Music**:

1. Go to `/test-songs`
2. Click any song cover
3. Player bar appears at bottom
4. Click play/pause to toggle

**Adding to Queue**:

1. Click three-dot menu on a song
2. Select "Add to queue"
3. Check queue viewer below

**Full Player**:

1. Play a song
2. Click song info in bottom player bar
3. Opens `/now-playing` route
4. Try seek bar, volume, lyrics toggle

**Legend Promotion** (localStorage demo):

1. Open song options menu (three dots)
2. Click "Promote to Legend"
3. Do this 3 times (opens devtools → Application → localStorage)
4. Check `dhvny_legend_promotions_v1`
5. After 3 promotions, song gets Legend badge

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `Port 5173 is in use`

**Solution**: Vite auto-assigns next available port (e.g., 5174)

**Or manually stop conflicting process**:

```powershell
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Or change port in vite.config.js
export default defineConfig({
  server: { port: 3000 }
})
```

### Module Not Found

**Error**: `Cannot find module './contexts/PlayerContext'`

**Solution**:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Audio Not Playing

**Possible causes**:

1. **Autoplay blocked** - Click play button (browser requires user gesture)
2. **No audio source** - Check `song.audioUrl` is valid URL
3. **CORS issue** - Check network tab, may need backend CORS config

**Test with sample songs**: Sample songs use Cloudinary (CORS-enabled)

### White Screen

**Check console for errors**:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors

**Common fixes**:

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

## 📚 Next Steps

### Learn the Codebase

1. **Read**: [README.md](./README.md) - Full documentation
2. **Reference**: [COMPONENTS.md](./COMPONENTS.md) - Component API
3. **Review**: [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) - Recent changes

### Try These Features

- [ ] Create a playlist (`/collections`)
- [ ] Add songs to playlist
- [ ] Play playlist (loads queue)
- [ ] Like a song (heart icon)
- [ ] Promote song to Legend (3 times)
- [ ] Post a comment (`/now-playing` → comments)
- [ ] Try shuffle/repeat toggles

### Customize

**Change API endpoint** (`.env`):

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

**Add your own sample songs** (`src/data/sampleSong.js`):

```javascript
export const MY_SONG = {
  songId: "my_song_001",
  title: "My Song",
  artist: "Me",
  audioUrl: "https://...",
  duration: 180,
  tags: ["custom"],
  isLegend: false,
  liked: false,
};

export const SAMPLE_LIST = [CLOUD_SONG, SAMPLE_SMALL, MY_SONG];
```

## 🔗 Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint (if configured)
npm run format       # Format with Prettier (if configured)

# Clean
rm -rf node_modules/.vite  # Clear Vite cache
rm -rf node_modules        # Full clean
npm install                # Reinstall
```

## 💡 Pro Tips

### Use Browser DevTools

**React DevTools** (Chrome/Firefox extension):

- Inspect component props
- View context values
- Profile performance

**Network Tab**:

- Monitor API calls
- Check request/response
- Debug CORS issues

**Application Tab**:

- View localStorage
- See `dhvny_*` keys
- Debug persistence

### localStorage Keys to Watch

Open DevTools → Application → localStorage:

- `dhvny_token` - Auth token
- `dhvny_player` - Queue state
- `dhvny_legend_promotions_v1` - Legend votes
- `dhvny_collections_v1` - Playlists

**Clear all data**:

```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Quick Debug

**Check if contexts are working**:

```javascript
// In browser console (on any page)
window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
```

**Check player state**:

```javascript
// Add to a component temporarily
import { usePlayer } from "./hooks/usePlayer";
const player = usePlayer();
console.log("Player state:", player);
```

## 🎉 You're Ready!

Your Dhvny frontend is fully set up and running.

**Need help?**

- Check [README.md](./README.md) for detailed docs
- Check [COMPONENTS.md](./COMPONENTS.md) for component API
- Check browser console for errors
- Check [SESSION_SUMMARY.md](./SESSION_SUMMARY.md) for recent changes

**Happy coding! 🚀**
