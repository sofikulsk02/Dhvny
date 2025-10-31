# Settings & Profile - Debug Guide

## Quick Verification Steps

### **1. Check if Backend is Running**

```bash
# Backend should be running on port 4000
# Open: http://localhost:4000/api/health (or similar endpoint)
```

### **2. Check Authentication Token**

Open Browser DevTools → Application/Storage → Local Storage

- Look for key: `dhvny_token`
- Should have a JWT token value
- If missing → You're not logged in

### **3. Test API Endpoints Manually**

#### Get Your Profile (with token)

```bash
# In browser console:
fetch('http://localhost:4000/api/users/profile/YOUR_USERNAME', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('dhvny_token')
  }
}).then(r => r.json()).then(console.log)
```

#### Update Profile

```bash
fetch('http://localhost:4000/api/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('dhvny_token')
  },
  body: JSON.stringify({
    displayName: 'Test Name',
    bio: 'Test bio'
  })
}).then(r => r.json()).then(console.log)
```

#### Update Privacy Settings

```bash
fetch('http://localhost:4000/api/users/settings/privacy', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('dhvny_token')
  },
  body: JSON.stringify({
    isPrivate: true,
    whoCanSendRequests: 'friends',
    showLikedSongs: false,
    showPlaylists: false
  })
}).then(r => r.json()).then(console.log)
```

---

## Browser Console Debugging

### **Enable Detailed Logging**

Add these console.log statements to `SettingsPage.jsx`:

#### In useEffect (line ~70):

```javascript
useEffect(() => {
  const loadSettings = async () => {
    console.log("🔵 Loading settings for user:", user?.username);
    if (!user) return;

    console.log("📦 User object:", user);
    console.log("⚙️ User settings:", user.settings);

    // ... rest of code
  };
  loadSettings();
}, [user]);
```

#### In handleSaveProfile (line ~125):

```javascript
const handleSaveProfile = async () => {
  console.log("💾 Saving profile:", { displayName, bio, location, website });
  setSaving(true);
  try {
    const response = await usersApi.updateProfile({
      displayName,
      bio,
      location,
      website,
    });
    console.log("✅ Profile saved:", response);

    // ... rest of code
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    // ... rest of code
  }
};
```

#### In handleSaveSettings (line ~150):

```javascript
const handleSaveSettings = async (section) => {
  console.log("💾 Saving settings section:", section);
  setSaving(true);
  try {
    switch (section) {
      case "privacy":
        console.log("🔒 Privacy settings:", {
          isPrivate: isPrivateAccount,
          whoCanSendRequests,
          showLikedSongs,
          showPlaylists,
        });
        await usersApi.updatePrivacySettings({
          isPrivate: isPrivateAccount,
          whoCanSendRequests,
          showLikedSongs,
          showPlaylists,
        });
        console.log("✅ Privacy settings saved");
        break;
      // ... rest of cases with similar logging
    }

    console.log("🔄 Refreshing user data...");
    if (refreshUser) {
      await refreshUser();
    }
    console.log("✅ User data refreshed");

    // ... rest of code
  }
};
```

#### In Toggle onChange handlers:

```javascript
// Example for Private Account toggle (line ~528):
onChange={(e) => {
  console.log("🔘 Private account toggled:", e.target.checked);
  setIsPrivateAccount(e.target.checked);
}}
```

---

## Common Issues & Solutions

### **Issue 1: Settings Don't Save**

**Symptoms:** Click "Save Changes" but nothing happens

**Debug:**

1. Open DevTools → Console
2. Click "Save Changes"
3. Look for error messages

**Possible Causes:**

- ❌ Backend not running → Start backend server
- ❌ Token expired → Logout and login again
- ❌ API endpoint error → Check backend console logs
- ❌ CORS issue → Verify backend CORS config allows frontend origin

**Solution:**

```bash
# Backend logs should show:
PUT /api/users/settings/privacy 200 OK
```

---

### **Issue 2: Toggles Don't Update**

**Symptoms:** Click toggle but it doesn't change

**Debug:**

1. Add console.log to onChange handler:

```javascript
onChange={(e) => {
  console.log("Toggle clicked:", e.target.checked);
  setIsPrivateAccount(e.target.checked);
}}
```

2. Click toggle
3. Check console - should see log message

**Possible Causes:**

- ❌ onChange handler not called → Check JSX syntax
- ❌ State not updating → Check setState call
- ❌ Component not re-rendering → Check React DevTools

**Solution:**

- Verify toggle JSX has both `checked={state}` and `onChange={handler}`
- Use React DevTools to inspect state updates

---

### **Issue 3: Settings Don't Load on Page Load**

**Symptoms:** All settings show default values even after saving

**Debug:**

1. Add console.log in useEffect:

```javascript
useEffect(() => {
  console.log("User object:", user);
  console.log("User settings:", user?.settings);
  // ...
}, [user]);
```

2. Refresh settings page
3. Check console for user data

**Possible Causes:**

- ❌ user object not loaded → Check AuthContext
- ❌ user.settings missing → Backend not returning settings
- ❌ Settings structure wrong → Check backend response format

**Solution:**

- Verify backend returns user object with nested `settings` property:

```json
{
  "_id": "...",
  "username": "sofikul",
  "displayName": "Sofikul",
  "settings": {
    "privacy": {
      "whoCanSendRequests": "everyone",
      "showLikedSongs": true,
      "showPlaylists": true
    },
    "notifications": { ... },
    "playback": { ... },
    "appearance": { ... }
  }
}
```

---

### **Issue 4: Profile Stats Show Zero**

**Symptoms:** Profile shows 0 uploads/likes/playlists even though content exists

**Debug:**

1. Check backend response:

```javascript
// In ProfilePage loadProfile function:
console.log("Profile API response:", response);
console.log("Stats:", response.stats);
```

**Possible Causes:**

- ❌ Backend not counting content → Fix backend stats calculation
- ❌ Content not linked to user → Check userId in Song/Playlist models
- ❌ API error → Check backend logs

**Solution:**
Backend should calculate stats like:

```javascript
const stats = {
  uploads: await Song.countDocuments({ uploadedBy: userId }),
  likes: await Like.countDocuments({ user: userId }),
  playlists: await Playlist.countDocuments({ createdBy: userId }),
  followers: await Follow.countDocuments({ following: userId }),
  following: await Follow.countDocuments({ follower: userId }),
};
```

---

### **Issue 5: Changes Don't Persist After Refresh**

**Symptoms:** Settings save successfully but reset after page refresh

**Debug:**

1. Save setting
2. Check Network tab → Should see successful PUT request
3. Refresh page
4. Check if useEffect loads saved values

**Possible Causes:**

- ❌ Backend saves but doesn't return updated user → Fix backend response
- ❌ refreshUser() not working → Check AuthContext refreshUser function
- ❌ Database not persisting → Check MongoDB connection

**Solution:**

- Verify backend saves to database:

```javascript
// Backend should do:
await user.save();
// Then return updated user:
res.json({ user });
```

---

### **Issue 6: Theme/Accent Color Don't Apply**

**Symptoms:** Save theme but UI doesn't change

**Current Status:** Settings save to backend but theme/accent not yet applied to UI

**To Implement:**

1. Create ThemeContext to manage theme state
2. Apply theme class to root element
3. Use CSS variables for accent colors
4. Load theme on app init from user settings

**Example:**

```javascript
// In App.jsx:
const { theme, accentColor } = user?.settings?.appearance || {};
document.documentElement.className = theme; // 'light' or 'dark'
document.documentElement.style.setProperty("--accent-color", accentColor);
```

---

## Network Tab Debugging

### **Check API Calls:**

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Perform action (e.g., click Save)
4. Look for API call

### **Successful Save Should Show:**

```
PUT /api/users/settings/privacy
Status: 200 OK
Response: { "message": "Privacy settings updated", "user": {...} }
```

### **Failed Save Might Show:**

```
PUT /api/users/settings/privacy
Status: 401 Unauthorized
Response: { "error": "Invalid token" }
```

→ Solution: Logout and login again

```
PUT /api/users/settings/privacy
Status: 500 Internal Server Error
Response: { "error": "Database error" }
```

→ Solution: Check backend console logs

---

## React DevTools Inspection

### **Check Component State:**

1. Install React DevTools extension
2. Open DevTools → Components tab
3. Find SettingsPage component
4. Inspect hooks state:
   - displayName
   - bio
   - isPrivateAccount
   - pushNotifications
   - etc.

### **Verify State Updates:**

1. Watch state in React DevTools
2. Click toggle/change input
3. State should update immediately
4. If state doesn't update → Check onChange handler

---

## Backend Verification

### **Check MongoDB Data:**

```javascript
// In MongoDB shell or Compass:
db.users.findOne({ username: "sofikul" })

// Should show:
{
  "_id": ObjectId("..."),
  "username": "sofikul",
  "displayName": "Sofikul",
  "bio": "...",
  "location": "...",
  "website": "...",
  "isPrivate": false,
  "settings": {
    "privacy": {
      "whoCanSendRequests": "everyone",
      "showLikedSongs": true,
      "showPlaylists": true
    },
    "notifications": {
      "push": true,
      "email": true,
      "friendRequests": true,
      "likes": true,
      "comments": true
    },
    "playback": {
      "audioQuality": "high",
      "autoplay": true,
      "crossfade": false,
      "crossfadeDuration": 5
    },
    "appearance": {
      "theme": "light",
      "accentColor": "purple"
    }
  }
}
```

---

## Quick Test Checklist

### **Profile Settings:**

- [ ] Edit display name → Save → Name updates in header
- [ ] Edit bio → Save → Bio appears on profile page
- [ ] Edit location → Save → Location appears on profile
- [ ] Edit website → Save → Website link works

### **Privacy Settings:**

- [ ] Toggle private account → Save → Setting persists after refresh
- [ ] Change friend request permissions → Save → Setting persists
- [ ] Toggle show liked songs → Save → Setting persists
- [ ] Toggle show playlists → Save → Setting persists

### **Notification Settings:**

- [ ] Toggle push notifications → Save → Setting persists
- [ ] Toggle email notifications → Save → Setting persists
- [ ] Toggle activity notifications → Save → Settings persist

### **Playback Settings:**

- [ ] Change audio quality → Save → Setting persists
- [ ] Toggle autoplay → Save → Setting persists
- [ ] Toggle crossfade → Save → Setting persists
- [ ] Adjust crossfade duration → Save → Setting persists

### **Appearance Settings:**

- [ ] Change theme → Save → Setting persists (UI change pending)
- [ ] Change accent color → Save → Setting persists (UI change pending)

### **Profile Page:**

- [ ] Stats show correct counts (uploads, likes, playlists)
- [ ] Uploads tab loads songs
- [ ] Likes tab loads liked songs
- [ ] Playlists tab loads playlists
- [ ] Edit Profile button navigates to settings
- [ ] Share button copies profile URL

---

## Expected Behavior Summary

### **When Settings Page Loads:**

1. ✅ useEffect runs
2. ✅ Reads user object from AuthContext
3. ✅ Extracts settings from user.settings
4. ✅ Sets all state variables (displayName, bio, toggles, etc.)
5. ✅ UI renders with current values
6. ✅ Loading spinner disappears

### **When User Changes a Setting:**

1. ✅ onChange handler fires
2. ✅ setState updates React state
3. ✅ UI updates immediately (toggle switches, etc.)
4. ✅ Save button remains enabled (not auto-saving)

### **When User Clicks Save:**

1. ✅ Save button shows loading spinner
2. ✅ handleSaveSettings/handleSaveProfile called
3. ✅ API call made to backend
4. ✅ Backend updates database
5. ✅ Backend returns updated user object
6. ✅ refreshUser() called
7. ✅ AuthContext user state updates
8. ✅ Components re-render with new data
9. ✅ Success alert appears
10. ✅ Save button loading spinner disappears

### **When User Refreshes Page:**

1. ✅ App reloads
2. ✅ AuthContext loads user from localStorage token
3. ✅ Settings page useEffect runs
4. ✅ Loads settings from user object
5. ✅ UI shows previously saved values
6. ✅ All changes persisted

---

## If Everything Fails

### **Nuclear Option - Reset Everything:**

1. **Clear all app data:**

```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

2. **Restart backend:**

```bash
# Stop backend (Ctrl+C)
# Clear node_modules and reinstall
npm install
# Start fresh
npm run dev
```

3. **Check database connection:**

```bash
# Backend should log:
✅ MongoDB connected: mongodb://localhost:27017/dhvny
```

4. **Re-login to app:**

- Go to /auth/login
- Login with credentials
- Navigate to /settings
- Try saving settings again

---

## Contact Points for Help

If issues persist:

1. **Check Backend Logs:** Look for error messages in terminal where backend is running
2. **Check Browser Console:** Look for JavaScript errors or failed API calls
3. **Check Network Tab:** Verify API calls are being made and responses are correct
4. **Check MongoDB:** Verify data is actually being saved to database

---

## Success Indicators

### **Everything is working if:**

- ✅ No errors in browser console
- ✅ No errors in backend console
- ✅ API calls return 200 status codes
- ✅ MongoDB shows updated data after saves
- ✅ Settings persist after page refresh
- ✅ Profile stats show correct counts
- ✅ Tabs load content correctly

**If all above are true → System is fully functional!** 🎉
