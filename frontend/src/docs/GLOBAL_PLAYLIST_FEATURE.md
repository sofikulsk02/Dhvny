# Global Playlist Feature

## Overview

The Global Playlist feature allows an admin user to create a single playlist that is visible to all users, but only the admin (playlist owner) can add or remove songs. This is perfect for curating a shared music collection.

## Architecture

### Backend Components

#### 1. Model (`backend/src/models/Playlist.model.js`)

- Added `isGlobal: Boolean` field (default: false)
- Added index on `isGlobal` for query performance
- Only one global playlist should exist per application

#### 2. Controller (`backend/src/controllers/playlists.controller.js`)

Four new functions:

- **`getGlobalPlaylist()`** - Public endpoint

  - Returns the global playlist with populated songs
  - No authentication required (everyone can view)
  - Returns 404 if no global playlist exists

- **`createGlobalPlaylist()`** - Admin only

  - Creates a new global playlist
  - Checks if one already exists
  - Sets `isGlobal: true` and `owner` to current user

- **`addSongToGlobalPlaylist(songId)`** - Admin only

  - Validates user is the playlist owner
  - Adds song to the global playlist's songs array
  - Prevents duplicates

- **`removeSongFromGlobalPlaylist(songId)`** - Admin only
  - Validates user is the playlist owner
  - Removes song from the global playlist

#### 3. Routes (`backend/src/routes/playlist.routes.js`)

```javascript
GET    /api/playlists/global              // Public - view global playlist
POST   /api/playlists/global/create       // Admin - create global playlist
POST   /api/playlists/global/songs        // Admin - add song
DELETE /api/playlists/global/songs/:songId // Admin - remove song
```

### Frontend Components

#### 1. API Client (`frontend/src/api/playlists.api.js`)

Four new API functions matching the backend endpoints:

- `getGlobalPlaylist()`
- `createGlobalPlaylist(name, description)`
- `addSongToGlobalPlaylist(songId)`
- `removeSongFromGlobalPlaylist(songId)`

#### 2. Collections Page (`frontend/src/components/collections/CollectionsPage.jsx`)

- Loads and displays the global playlist in a special section
- Purple/pink gradient card with "GLOBAL" badge
- Globe icon to indicate public visibility
- Shows song count
- Separated from user's personal playlists
- Clicking navigates to the playlist detail page

#### 3. Song Options Menu (`frontend/src/components/song/SongOptionsMenu.jsx`)

- Added "Add to Global Playlist" option (admin only)
- Checks if user is the global playlist owner on mount
- Only shows the option if user is admin
- Handles errors gracefully (playlist not found, not authorized, etc.)
- Shows toast notifications for success/failure

## Usage Flow

### Admin User

1. Create the global playlist (via API or future UI button)
2. Browse songs and click the 3-dot menu
3. Select "Add to Global Playlist" option
4. Song is added to the global playlist
5. All users can now see this song in the global playlist

### Regular Users

1. Navigate to Collections page
2. See the "Global Playlist" section at the top
3. Click to view all songs in the global playlist
4. Play songs from the global playlist
5. Cannot add or remove songs (option not visible)

## Admin Detection

The system determines admin status by:

1. Fetching the global playlist on component mount
2. Comparing `user._id` with `globalPlaylist.owner._id`
3. Setting `isAdmin` state accordingly
4. Menu options adapt based on this state

## Security

- Only the playlist owner can add/remove songs
- Backend validates ownership on every mutation
- Regular users have read-only access
- Public viewing doesn't require authentication

## Future Enhancements

- [ ] UI button to create global playlist (currently API only)
- [ ] "Remove from Global Playlist" option in song menu
- [ ] Visual indicator on songs already in global playlist
- [ ] Confirmation dialog before adding songs
- [ ] Global playlist management page for admin
- [ ] Multiple admins/moderators support
- [ ] Activity log for global playlist changes

## Testing Checklist

- [ ] Create global playlist as admin user
- [ ] Add songs to global playlist via song menu
- [ ] View global playlist in Collections page
- [ ] Verify regular users can see but not edit
- [ ] Test error handling (no playlist, not authorized)
- [ ] Verify jam sessions still work correctly
- [ ] Check mobile responsiveness

## Notes

- Only one global playlist should exist
- Creating multiple global playlists will require additional logic
- The first admin to create it becomes the owner
- Consider adding transfer ownership feature in the future
