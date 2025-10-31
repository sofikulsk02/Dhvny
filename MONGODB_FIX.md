# 🔧 MongoDB Atlas Authentication Fix

## ❌ Current Issue

```
MongoServerError: bad auth : Authentication failed.
```

This means the username/password combination is incorrect in MongoDB Atlas.

## ✅ Fix It (5 minutes)

### Step 1: Go to MongoDB Atlas

1. Open: https://cloud.mongodb.com
2. Login with your account
3. Select your project (where you created the cluster)

### Step 2: Check/Create Database User

1. Click **"Database Access"** in the left sidebar (Security section)
2. Look for user: `sofikulmain_db_user`

**If user exists:**

- Click "Edit"
- Click "Edit Password"
- Set password to: `UTfX5oEtSBJr6Y9B`
- Click "Update User"

**If user doesn't exist:**

- Click "Add New Database User"
- Authentication Method: **Password**
- Username: `sofikulmain_db_user`
- Password: `UTfX5oEtSBJr6Y9B`
- Database User Privileges: **Atlas admin** (or "Read and write to any database")
- Click "Add User"

### Step 3: Check Network Access (IP Whitelist)

1. Click **"Network Access"** in the left sidebar
2. Check if you have an IP entry

**If no IPs listed:**

- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0)
- Click "Confirm"

**Note:** This allows connections from any IP (fine for development, not for production)

### Step 4: Get Correct Connection String

1. Click **"Database"** in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: **Node.js** / Version: **5.5 or later**
5. Copy the connection string

It should look like:

```
mongodb+srv://sofikulmain_db_user:<password>@dhvny-cluster.dxj50pp.mongodb.net/?retryWrites=true&w=majority&appName=dhvny-cluster
```

6. Replace `<password>` with: `UTfX5oEtSBJr6Y9B`

Final string:

```
mongodb+srv://sofikulmain_db_user:UTfX5oEtSBJr6Y9B@dhvny-cluster.dxj50pp.mongodb.net/dhvny?retryWrites=true&w=majority
```

### Step 5: Update .env File

Open `C:\Dhvny\backend\.env` and make sure this line is correct:

```env
MONGODB_URI=mongodb+srv://sofikulmain_db_user:UTfX5oEtSBJr6Y9B@dhvny-cluster.dxj50pp.mongodb.net/dhvny?retryWrites=true&w=majority
```

### Step 6: Restart Backend

In your terminal (where backend is running):

1. Press `Ctrl+C` to stop
2. Run: `npm run dev`

You should see:

```
✅ Connected to MongoDB
🚀 Server running on http://localhost:4000
```

## 🚨 Still Not Working?

### Option A: Create a New User (Simplest)

1. Go to **Database Access**
2. Click "Add New Database User"
3. Username: `dhvny`
4. Password: Click "Autogenerate Secure Password" → **Copy it!**
5. Privileges: **Atlas admin**
6. Click "Add User"
7. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://dhvny:<YOUR_PASSWORD>@dhvny-cluster.dxj50pp.mongodb.net/dhvny?retryWrites=true&w=majority
   ```

### Option B: Use Local MongoDB Instead

If Atlas is too complicated:

1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dhvny
   ```
3. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```
4. Restart backend: `npm run dev`

## 📝 Common Mistakes

❌ **Wrong username** - Make sure it's exactly: `sofikulmain_db_user`
❌ **Wrong password** - Make sure it's exactly: `UTfX5oEtSBJr6Y9B`
❌ **Special characters** - If password has `@`, `#`, etc., they need URL encoding
❌ **IP not whitelisted** - Must add your IP or "Allow from Anywhere"
❌ **User doesn't have permissions** - Must have "Read and write" access

## ✅ Success Checklist

Once it works, you'll see:

- [ ] Backend terminal shows: `✅ Connected to MongoDB`
- [ ] Backend terminal shows: `🚀 Server running on http://localhost:4000`
- [ ] No error messages about authentication
- [ ] Can open http://localhost:4000/health in browser

---

**Need help? Double-check these 3 things:**

1. Username is correct in MongoDB Atlas
2. Password is correct in MongoDB Atlas
3. IP is whitelisted (or "Allow from Anywhere")

After fixing, just type `rs` in the backend terminal to restart nodemon!
