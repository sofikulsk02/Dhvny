# 🎵 Dhvny Setup - Quick Start Guide

## First Time Setup

### 1. Install MongoDB

**Choose ONE option:**

#### Option A: Local MongoDB (Recommended for learning)

1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install it (accept defaults)
3. MongoDB should auto-start as a service

#### Option B: MongoDB Atlas (Cloud - Easier!)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a free cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dhvny
   ```

### 2. Install Backend Dependencies

```powershell
cd C:\Dhvny\backend
npm install
```

### 3. Install Frontend Dependencies (if not done)

```powershell
cd C:\Dhvny\frontend
npm install
```

## Daily Startup (2 Terminals)

### Terminal 1: Backend

```powershell
cd C:\Dhvny\backend
npm run dev
```

Wait for:

```
✅ Connected to MongoDB
🚀 Server running on http://localhost:4000
```

### Terminal 2: Frontend

```powershell
cd C:\Dhvny\frontend
npm run dev
```

Wait for:

```
  VITE ready in Xms

  ➜  Local:   http://localhost:5174/
```

## Test It Works

1. Open browser: http://localhost:5174
2. Go to login page: http://localhost:5174/auth/login
3. Click "Register" and create an account
4. Should automatically log you in!

## Health Checks

### Backend Health

Open: http://localhost:4000/health

Should show:

```json
{ "status": "ok", "timestamp": "...", "uptime": 123 }
```

### MongoDB Check

```powershell
# If using local MongoDB:
# Windows - check service
net start | findstr MongoDB

# Should show: MongoDB Server (MongoDB)
```

## Common Issues

### "MongoDB not running"

```powershell
# Start MongoDB service
net start MongoDB
```

### "Port already in use"

```powershell
# Find and kill process
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### "Module not found"

```powershell
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install
```

## What's Working Now (Day 1)

✅ User registration
✅ Login/logout
✅ JWT authentication
✅ Protected routes
✅ Auto-restore session

## Coming Next (Day 2)

🚧 Song upload
🚧 Audio file storage
🚧 Upload progress tracking

---

**Need help?** Check `DAY_1_COMPLETE.md` for detailed troubleshooting!
