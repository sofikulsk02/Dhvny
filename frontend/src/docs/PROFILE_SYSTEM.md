# Profile System Documentation

## Overview

Complete user profile system with comprehensive features for viewing, editing, and managing user profiles, settings, and privacy.

## Features Implemented

### 1. Profile Page (`/profile/:username` or `/profile`)

#### Layout

- **Cover Banner**: Gradient header (purple → pink → blue)
- **Avatar Section**:
  - 128px circular avatar with fallback to initials
  - Legend crown badge (⭐) for legend users
  - White border with shadow
  - Positioned overlapping the banner

#### User Information

- **Primary Info**:

  - Display name with legend badge
  - Username (@username)
  - Bio (max 160 characters)

- **Meta Information**:
  - Location with MapPin icon
  - Join date with Calendar icon
  - Website link with external icon
  - All optional fields

#### Statistics Dashboard

5 key metrics displayed prominently:

- **Uploads**: Total songs uploaded
- **Likes**: Total likes received
- **Playlists**: Number of playlists created
- **Followers**: User follower count
- **Following**: Users being followed

All stats are clickable (hover effect) for future filtering.

#### Action Buttons

**Own Profile:**

- Edit Profile button (purple, primary action)
- Settings gear icon (secondary)

**Other Users' Profiles:**

- Follow/Unfollow button (toggles state and count)
- Add Friend button (if not already friends)
- Share button (copies profile URL to clipboard)

#### Content Tabs

4 tabs with icon + label:

1. **Uploads** 🎵

   - Shows all songs uploaded by user
   - Grid layout with song cards
   - Empty state: "No uploads yet"

2. **Likes** ❤️

   - Shows all songs liked by user
   - Same layout as uploads
   - Empty state: "No liked songs yet"

3. **Playlists** 📋

   - Shows user's public playlists
   - 3-column grid on desktop
   - Empty state: "No playlists yet"

4. **Activity** 👤
   - Recent activity timeline
   - Actions: uploads, likes, playlist creation, follows
   - Empty state: "No recent activity"

### 2. Settings Page (`/settings`)

#### Layout

- **Sidebar Navigation**: Fixed left sidebar with all setting sections
- **Main Content Area**: Dynamic content based on selected section
- **Responsive**: Sidebar collapses on mobile

#### Setting Sections

##### A. Profile Settings

Editable fields:

- **Avatar Upload**: Image upload with preview
  - Accepts JPG, PNG, GIF
  - Max size: 5MB
  - Camera icon overlay for upload
- **Display Name**: Text input
- **Bio**: Textarea (160 char limit with counter)
- **Location**: Text input (City, Country)
- **Website**: URL input with validation

**Edit Mode**:

- Toggle edit mode with "Edit Profile" button
- Save/Cancel buttons when editing
- Disabled inputs when not editing
- Loading state during save

##### B. Account Settings

- **Username**: Display only (cannot be changed)
- **Email**: Editable email address
- **Change Password**: Button to open password modal
- Read-only fields clearly indicated

##### C. Privacy Settings

Toggles for:

- **Private Account**: Only approved followers see content
- **Friend Requests**: Dropdown (Everyone / Friends of friends / No one)
- **Show Liked Songs**: Toggle visibility of likes
- **Show Playlists**: Toggle visibility of public playlists

All settings use custom toggle switches (purple accent).

##### D. Notification Settings

Two main toggles:

- **Push Notifications**: Device notifications
- **Email Notifications**: Email updates

Activity-specific notifications:

- Friend Requests
- Likes on your songs
- Comments on your songs

Each with individual toggle switch.

##### E. Playback Settings

- **Audio Quality**: Dropdown
  - Low (96 kbps)
  - Normal (160 kbps)
  - High (320 kbps)
- **Autoplay**: Toggle for queue continuation
- **Crossfade**: Toggle with duration slider
  - Slider: 1-12 seconds
  - Only visible when crossfade enabled

##### F. Appearance

- **Theme**: 3 options (Light / Dark / Auto)
  - Visual button grid
  - Active state highlighting
- **Accent Color**: 8 color options
  - Visual color swatches
  - Purple, Blue, Pink, Green, Orange, Red, Yellow, Indigo
  - Ring indicator on active color

##### G. Language & Region

- **Language**: Dropdown selector
  - English, Español, Français, Deutsch, 日本語, 한국어
- **Time Zone**: Dropdown
  - Automatic (default)
  - Major US time zones

##### H. Danger Zone (Red Section)

- **Delete Account**: Permanent deletion
  - Confirmation modal required
  - Type "DELETE" to confirm
  - Logs out and redirects on success

#### Logout Button

- Red text, separate from other sections
- Confirmation dialog before logout
- Located at bottom of sidebar

### 3. Routes

```javascript
// Profile routes
/profile              // Own profile (current user)
/profile/:username    // View any user's profile
/settings             // Settings page (own account only)
```

## Component Structure

```
profile/
├── ProfilePage.jsx          // Main profile display
├── SettingsPage.jsx         // Comprehensive settings
├── ProfileSidebar.jsx       // Sidebar navigation (legacy)
├── ActivityPage.jsx         // Activity timeline (legacy)
├── UploadsPage.jsx          // User uploads (legacy)
├── FriendsTabFromSidebar.jsx // Friends list (legacy)
```

## State Management

### ProfilePage States

```javascript
- profileUser: User object being viewed
- loading: Page loading state
- activeTab: Current active tab (uploads/likes/playlists/activity)
- isFollowing: Follow status (for other users)
- isFriend: Friend status (for other users)
- stats: { uploads, likes, playlists, followers, following }
- uploads: Array of uploaded songs
- likedSongs: Array of liked songs
- playlists: Array of playlists
- activities: Array of activity items
```

### SettingsPage States

```javascript
// Profile
-displayName,
  bio,
  location,
  website,
  avatarUrl - isEditing,
  saving -
    // Privacy
    isPrivateAccount,
  whoCanSendRequests - showLikedSongs,
  showPlaylists -
    // Notifications
    pushNotifications,
  emailNotifications - friendRequestNotifs,
  likeNotifs,
  commentNotifs -
    // Playback
    audioQuality,
  autoplay,
  crossfade,
  crossfadeDuration -
    // Appearance
    theme,
  accentColor;
```

## API Integration (TODO)

### Profile APIs Needed

```javascript
// User APIs
usersApi.getProfile(username); // Get user profile
usersApi.updateProfile(data); // Update own profile
usersApi.followUser(userId); // Follow user
usersApi.unfollowUser(userId); // Unfollow user
usersApi.getUserUploads(userId); // Get user's songs
usersApi.getUserLikes(userId); // Get liked songs
usersApi.getUserActivity(userId); // Get activity timeline
usersApi.deleteAccount(); // Delete account

// Settings APIs
usersApi.updatePrivacy(settings); // Update privacy settings
usersApi.updateNotifications(settings); // Update notification preferences
settingsApi.updatePlayback(settings); // Update playback preferences
settingsApi.updateAppearance(settings); // Update theme/colors

// Friends APIs
friendsApi.sendRequest(userId); // Send friend request
friendsApi.checkFriendStatus(userId); // Check if friends
```

## Privacy Logic

### Profile Visibility

- **Public Profile**: Anyone can view all content
- **Private Profile**:
  - Only followers see uploads, likes, playlists
  - Profile info (name, bio) visible to all
  - Friend requests require approval

### Content Visibility

Controlled by individual settings:

- `showLikedSongs`: Hide/show liked songs tab
- `showPlaylists`: Hide/show playlists tab
- Always show uploads (core content)

## Design System

### Colors

- **Primary**: Purple (#7C3AED - purple-600)
- **Secondary**: Pink (#EC4899 - pink-600)
- **Accent**: Blue (#3B82F6 - blue-600)
- **Background**: Gradient from purple-50 → pink-50 → blue-50
- **Text**:
  - Primary: gray-900
  - Secondary: gray-600
  - Muted: gray-500

### Typography

- **Page Title**: 3xl, bold
- **Section Title**: 2xl, bold
- **Card Title**: base/lg, semibold
- **Body**: base, regular
- **Caption**: sm/xs, regular

### Spacing

- **Container Padding**: px-4 py-8
- **Card Padding**: p-6
- **Section Gap**: gap-6
- **Element Gap**: gap-2 to gap-4

### Components

- **Buttons**: Rounded-lg (0.5rem radius)
- **Cards**: Rounded-2xl (1rem radius)
- **Avatars**: Full circle (rounded-full)
- **Inputs**: Rounded-lg with focus ring

### Icons

Using Lucide React:

- Size: w-4 h-4 (small) to w-6 h-6 (large)
- Consistent stroke width
- Accessible labels

## Accessibility

### Keyboard Navigation

- All buttons are focusable
- Tab order follows visual flow
- Settings sections keyboard navigable

### ARIA Labels

- Buttons have descriptive labels
- Form inputs have associated labels
- Toggle switches have sr-only labels

### Color Contrast

- Text: WCAG AA compliant
- Buttons: High contrast states
- Icons: Clear visibility

## Mobile Responsiveness

### ProfilePage

- **Desktop (md+)**: Side-by-side avatar and info
- **Mobile (<md)**: Stacked layout
- **Tabs**: Horizontal scroll on mobile
- **Stats**: Wrap to 2 rows on small screens

### SettingsPage

- **Desktop (md+)**: Sidebar + content
- **Mobile (<md)**: Tabs or accordion
- **Forms**: Full width on mobile
- **Buttons**: Stack vertically

## Testing Checklist

### Profile Page

- [ ] Load own profile (/profile)
- [ ] Load other user profile (/profile/:username)
- [ ] Follow/unfollow functionality
- [ ] Send friend request
- [ ] Share profile (copy link)
- [ ] Switch between tabs
- [ ] View statistics
- [ ] Legend badge displays correctly
- [ ] Empty states show properly
- [ ] Navigate to settings

### Settings Page

- [ ] Edit profile information
- [ ] Upload avatar image
- [ ] Save profile changes
- [ ] Toggle privacy settings
- [ ] Toggle notification settings
- [ ] Change audio quality
- [ ] Enable/disable crossfade
- [ ] Adjust crossfade duration
- [ ] Change theme
- [ ] Change accent color
- [ ] Change language
- [ ] Logout
- [ ] Delete account (with confirmation)

### Responsive

- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Touch interactions work
- [ ] Sidebar navigation on mobile

## Future Enhancements

### Profile Features

- [ ] Activity timeline with real data
- [ ] Follower/following lists
- [ ] Profile views counter
- [ ] Verified badge for verified users
- [ ] Custom profile themes
- [ ] Profile banner customization
- [ ] Pinned playlists
- [ ] Social links (Twitter, Instagram, etc.)

### Settings Features

- [ ] Two-factor authentication
- [ ] Email verification
- [ ] Password strength meter
- [ ] Session management (active devices)
- [ ] Download user data (GDPR)
- [ ] Connected apps management
- [ ] Blocked users list
- [ ] Export/import settings

### Privacy Features

- [ ] Granular content visibility
- [ ] Hide specific playlists
- [ ] Activity history controls
- [ ] Data retention settings
- [ ] Anonymous mode

### Social Features

- [ ] Profile badges/achievements
- [ ] Top genres/artists
- [ ] Listening time statistics
- [ ] Year in review
- [ ] Collaborative playlists on profile
- [ ] Featured playlists section

## Performance Considerations

### ProfilePage

- **Lazy Loading**: Load tab content on demand
- **Image Optimization**: Avatar with srcset
- **Pagination**: For large song/playlist lists
- **Caching**: Cache profile data

### SettingsPage

- **Debouncing**: Slider inputs debounced
- **Optimistic Updates**: Toggle switches update immediately
- **Validation**: Client-side validation before API calls
- **Auto-save**: Optional auto-save for some settings

## Error Handling

### Profile Not Found

- Show friendly error message
- Provide "Go Home" button
- Log error for analytics

### Network Errors

- Toast notifications for failures
- Retry mechanism for important actions
- Offline indicator

### Validation Errors

- Inline error messages
- Clear field on error
- Prevent submission with errors

## Security Considerations

- **XSS Protection**: Sanitize bio and website inputs
- **URL Validation**: Validate website URLs
- **File Upload**: Validate avatar file type and size
- **Rate Limiting**: Limit profile updates (client + server)
- **CSRF Protection**: Use tokens for sensitive operations
- **Password Changes**: Require current password
- **Account Deletion**: Multi-step confirmation

## Analytics Events

Track key user actions:

- `profile_viewed`: { username, isOwnProfile }
- `profile_edited`: { fields_changed }
- `follow_user`: { target_username }
- `unfollow_user`: { target_username }
- `settings_changed`: { section, settings }
- `theme_changed`: { theme }
- `privacy_toggled`: { setting, value }
- `account_deleted`: { reason }

## Notes

- All API calls are currently mocked with TODO comments
- Backend endpoints need to be implemented
- User model needs to support all profile fields
- Consider adding profile completion indicator
- Add profile skeleton loaders for better UX
- Implement real-time updates for follower counts
