# 🎵 Dhvny - Music Social Platform

A modern music streaming and social platform built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (optional, for cloud storage)

### Installation

1. **Clone and Install**

```bash
# Clone repository
git clone https://github.com/sofikulsk02/Dhvny.git
cd Dhvny

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Configure Backend**

Create `backend/.env` file:

```env
PORT=your port no(not specific)
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=the mongo url you have created in mongoDb Atlas

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this-too
JWT_EXPIRES_IN=7d or as your choice
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5175

# File Upload Limits (bytes)
MAX_AUDIO_SIZE=52428800  # 50MB
MAX_IMAGE_SIZE=5242880   # 5MB

# Cloudinary (Optional - leave empty for local storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Start Development Servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm run dev
# Runs on http://localhost:5175
```

## 📦 Features Implemented

### ✅ Day 1: Authentication System

- User registration with email/username
- Secure login with JWT tokens
- Token refresh mechanism
- Protected routes
- User profile management
- Modern glassmorphism UI

### ✅ Day 2: Song Upload & Storage

- Drag & drop file upload
- Audio file validation (MP3, WAV, M4A)
- Cover image upload with preview
- Cloudinary cloud storage integration
- Local storage fallback
- Metadata form (title, artist, album, genre, tags, lyrics)
- Automatic duration detection
- Upload progress tracking
- Song listing with pagination
- Search and filter functionality

### 🚧 Coming Soon

- Day 3: Song Listing & Player Integration
- Day 4: Likes & Legend System
- Day 5: Comments System
- Day 6: Friends System
- Day 7: Playlists & Collections
- Day 8: Real-time Notifications
- Day 9: Jam Sessions (Sync Playback)
- Day 10: UI Polish & Testing

## 🎨 Tech Stack

### Frontend

- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **State:** Context API
- **HTTP Client:** Axios
- **Audio:** HTML5 Audio API

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas)
- **ODM:** Mongoose
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Cloud Storage:** Cloudinary
- **Real-time:** Socket.IO (ready)

## 📁 Project Structure

```
Dhvny/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, upload, error handling
│   │   ├── utils/          # JWT, Cloudinary helpers
│   │   ├── sockets/        # Socket.IO handlers
│   │   └── server.js       # Express app entry
│   ├── uploads/            # Local file storage (if not using Cloudinary)
│   ├── .env               # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/            # API client functions
    │   ├── components/     # React components
    │   ├── contexts/       # Context providers
    │   ├── hooks/          # Custom hooks
    │   ├── pages/          # Page components
    │   ├── routes/         # Route configuration
    │   ├── services/       # Business logic
    │   ├── styles/         # Global styles
    │   └── utils/          # Utility functions
    ├── public/             # Static assets
    └── package.json
```

## 🔑 API Endpoints

### Authentication

```
POST /api/auth/register     - Create new account
POST /api/auth/login        - Login with credentials
POST /api/auth/refresh      - Refresh access token
POST /api/auth/logout       - Logout and clear tokens
GET  /api/auth/me          - Get current user profile
```

### Song Upload & Management

```
POST   /api/upload/song       - Upload new song (auth required)
POST   /api/upload/avatar     - Upload user avatar (auth required)
GET    /api/songs             - List all songs (paginated, searchable)
GET    /api/songs/:id         - Get single song details
GET    /api/songs/user/:userId - Get user's uploaded songs
PATCH  /api/songs/:id         - Update song metadata (auth required)
DELETE /api/songs/:id         - Delete song (auth required)
POST   /api/songs/:id/play    - Increment play count
```

## 🎵 Using the Upload Feature

1. **Navigate to Upload Page** - Click "Upload" from the bottom navigation or home page

2. **Prepare Your Files**

   - Audio: MP3, WAV, or M4A format (max 50MB)
   - Cover: PNG, JPG, or WebP image (max 5MB, recommended 800x800px)

3. **Upload Process**

   - Drag & drop audio file or click to browse
   - System automatically detects duration
   - Add cover image (optional)
   - Fill in metadata:
     - Title\* (required)
     - Artist\* (required)
     - Album (optional)
     - Genre (optional - dropdown)
     - Tags (optional - comma-separated)
     - Lyrics (optional)

4. **Submit & Verify**
   - Click "Upload Song"
   - Watch progress bar
   - Redirects to "My Songs" on success
   - Song appears in your library with all metadata

## ☁️ Cloudinary Setup (Optional)

If you want to use cloud storage instead of local files:

1. **Sign up for Cloudinary** - [https://cloudinary.com](https://cloudinary.com)
2. **Get your credentials** from the dashboard
3. **Add to `.env`:**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Benefits:**

- Automatic audio optimization (MP3, 128k bitrate)
- Image resizing and optimization (800x800px)
- CDN delivery for faster streaming
- No server storage costs

**Without Cloudinary:**

- Files stored in `backend/uploads/` directory
- Served by Express static middleware
- Good for development, not recommended for production

## 🧪 Testing

### Manual Testing

1. Register a new account
2. Login with your credentials
3. Navigate to Upload page
4. Upload a test song with metadata
5. Check My Songs page
6. Click play button to test playback

### API Testing with curl

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","displayName":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Upload song (get token from login response)
curl -X POST http://localhost:4000/api/upload/song \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@path/to/song.mp3" \
  -F "title=Test Song" \
  -F "artist=Test Artist" \
  -F "duration=180"

# List songs
curl http://localhost:4000/api/songs
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows - Find process using port 4000
netstat -ano | findstr :4000

# Kill process (replace PID)
taskkill /PID <process_id> /F
```

### MongoDB Connection Error

- Check your MongoDB Atlas connection string in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network/firewall settings

### File Upload Fails

- Check file size limits in `.env`
- Ensure `uploads/` directory exists (auto-created by Multer)
- Verify Cloudinary credentials if using cloud storage
- Check backend logs for detailed error messages

### Frontend Not Connecting to Backend

- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check frontend is using correct API base URL in `src/api/client.js`
- Ensure backend server is running on port 4000

## 📚 Documentation

- **Day 1 Completion:** See `AUTH_IMPLEMENTATION.md`
- **Day 2 Completion:** See `DAY_2_COMPLETION.md`
- **Song Features:** See `MY_SONGS_FEATURES.md`
- **API Reference:** Check individual route files in `backend/src/routes/`

## 🤝 Contributing

This is a learning project for personal use with 4-6 friends. Feel free to fork and adapt for your own use!

## 📄 License

MIT License - Feel free to use this project for learning and personal projects.

## 🎯 Roadmap

- [x] Day 1: Authentication System
- [x] Day 2: Song Upload & Storage
- [ ] Day 3: Song Listing & Player Integration
- [ ] Day 4: Likes & Legend System
- [ ] Day 5: Comments System
- [ ] Day 6: Friends System
- [ ] Day 7: Playlists & Collections
- [ ] Day 8: Real-time Notifications
- [ ] Day 9: Jam Sessions (Sync Playback)
- [ ] Day 10: UI Polish & Testing

---

**Current Status:** Day 2 Complete ✅

**Next:** Day 3 - Song Listing, Search & Player Integration
