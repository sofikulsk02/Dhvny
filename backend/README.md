# 🎵 Dhvny Backend API

Node.js + Express + MongoDB backend for the Dhvny music platform.

## 📋 Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**

```bash
# Install MongoDB Community Server
# Windows: https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud - Free Tier)**

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get your connection string
4. Replace in `.env` file

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
```

**Important:** Change `JWT_SECRET` to a random string:

```env
JWT_SECRET=your-random-secret-here-make-it-long-and-random
MONGODB_URI=mongodb://localhost:27017/dhvny
```

### 4. Start the Server

```bash
npm run dev
```

Server runs on: **http://localhost:4000**

## 📡 API Endpoints

### Authentication (✅ Day 1 - COMPLETE)

| Method | Endpoint             | Description      | Auth    |
| ------ | -------------------- | ---------------- | ------- |
| POST   | `/api/auth/register` | Create new user  | Public  |
| POST   | `/api/auth/login`    | Login user       | Public  |
| GET    | `/api/auth/me`       | Get current user | Private |
| POST   | `/api/auth/logout`   | Logout user      | Private |
| POST   | `/api/auth/refresh`  | Refresh token    | Public  |

### Songs (🚧 Coming Day 2-3)

- List songs
- Upload song
- Like/unlike
- Legend promotion
- Search

### Comments (🚧 Coming Day 5)

- CRUD operations
- Like comments

### Friends (🚧 Coming Day 6)

- Send/accept requests
- Friend list

### Playlists (🚧 Coming Day 7)

- Create/edit playlists
- Add/remove songs

### Notifications (🚧 Coming Day 8)

- Real-time notifications

### Jam Sessions (🚧 Coming Day 9)

- WebSocket sync

## 🧪 Testing the API

### Register a User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   │   └── auth.controller.js ✅
│   ├── middleware/     # Auth, upload, errors
│   │   ├── auth.middleware.js ✅
│   │   ├── error.middleware.js ✅
│   │   ├── rateLimiter.middleware.js ✅
│   │   └── upload.middleware.js ✅
│   ├── models/         # Mongoose schemas
│   │   ├── User.model.js ✅
│   │   ├── Song.model.js ✅
│   │   ├── Comment.model.js ✅
│   │   ├── Playlist.model.js ✅
│   │   ├── Notification.model.js ✅
│   │   └── JamSession.model.js ✅
│   ├── routes/         # API routes
│   │   ├── auth.routes.js ✅
│   │   └── (more coming each day)
│   ├── sockets/        # WebSocket handlers
│   │   └── index.js 🚧
│   ├── utils/          # Helper functions
│   │   └── jwt.utils.js ✅
│   └── server.js       # Express app ✅
├── uploads/            # File storage (auto-created)
├── .env               # Configuration
├── .env.example       # Template
└── package.json       # Dependencies
```

## 🔐 Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Rate limiting (100 req/15min)
- ✅ Auth rate limiting (5 attempts/15min)
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ Input validation

## 🛠️ Development

### NPM Scripts

```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Start production server
npm run seed   # Seed database (coming soon)
```

### Environment Variables

| Variable       | Description        | Default                         |
| -------------- | ------------------ | ------------------------------- |
| PORT           | Server port        | 4000                            |
| MONGODB_URI    | MongoDB connection | mongodb://localhost:27017/dhvny |
| JWT_SECRET     | JWT signing secret | (required)                      |
| JWT_EXPIRES_IN | Token expiry       | 7d                              |
| CORS_ORIGIN    | Allowed origin     | http://localhost:5174           |
| MAX_FILE_SIZE  | Max upload size    | 52428800 (50MB)                 |

## 📊 Database Models

### User

- username, email, password (hashed)
- displayName, bio, avatarUrl
- friends, likedSongs, playlists
- Role-based access (user/artist/admin)

### Song

- title, artist, album, duration
- audioUrl, coverUrl, lyrics
- tags, genre, releaseDate
- Likes, plays, comments count
- Legend promotion tracking

### Comment

- content, user, song
- Likes, replies (nested)
- Edit/delete tracking

### Playlist

- name, description, coverUrl
- Songs with order
- Collaborative features

### Notification

- Type (like, comment, friend_request, etc.)
- Related entities (song, user, etc.)
- Read/unread status

### JamSession

- Host, participants
- Queue, currentSong, position
- Real-time sync settings

## 🚨 Common Issues

### MongoDB Connection Failed

```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhvny
```

### Port Already in Use

```bash
# Kill process on port 4000 (Windows)
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5000
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📝 Next Steps (10-Day Plan)

- ✅ **Day 1:** Auth system (DONE!)
- 🚧 **Day 2:** Song upload
- 🚧 **Day 3:** Songs API & player
- 🚧 **Day 4:** Likes & legends
- 🚧 **Day 5:** Comments
- 🚧 **Day 6:** Friends
- 🚧 **Day 7:** Playlists
- 🚧 **Day 8:** Notifications
- 🚧 **Day 9:** Jam sessions
- 🚧 **Day 10:** Polish & testing

## 🤝 Contributing

This is a personal learning project. Feel free to experiment!

## 📄 License

MIT - Do whatever you want with this code!

---

**Built with ❤️ for learning how big tech works**
