# Dhvny Frontend - Deployment Guide

## 🚀 Deploying to Vercel (Recommended)

Vercel is the easiest way to deploy your React + Vite app with zero configuration.

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub** (if not already done):
   ```bash
   cd c:\Dhvny\frontend
   git add .
   git commit -m "Add frontend deployment config"
   git push origin master
   ```

2. **Go to Vercel**:
   - Visit https://vercel.com
   - Sign in with GitHub
   - Click **"Add New Project"**

3. **Import Your Repository**:
   - Click **"Import Git Repository"**
   - Select your **Dhvny** repository
   - Vercel will auto-detect Vite configuration

4. **Configure Project**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

5. **Add Environment Variables**:
   Click **"Environment Variables"** and add:
   ```
   VITE_API_BASE_URL=https://dhvny-backend.onrender.com/api
   ```
   ⚠️ Replace with your actual backend URL from Render

6. **Deploy**:
   - Click **"Deploy"**
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://dhvny.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd c:\Dhvny\frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Your account)
# - Link to existing project? No
# - Project name? dhvny-frontend
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

---

## 🎨 Deploying to Netlify (Alternative)

### Option 1: Deploy via Netlify Dashboard

1. **Push to GitHub** (if not already done)

2. **Go to Netlify**:
   - Visit https://app.netlify.com
   - Click **"Add new site"** → **"Import an existing project"**

3. **Connect to GitHub**:
   - Choose **"GitHub"**
   - Select your **Dhvny** repository

4. **Configure Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Branch to deploy**: `master`

5. **Add Environment Variables**:
   - Go to **"Site settings"** → **"Environment variables"**
   - Add:
     ```
     VITE_API_BASE_URL=https://dhvny-backend.onrender.com/api
     ```

6. **Deploy**:
   - Click **"Deploy site"**
   - Wait for build to complete
   - You'll get a URL like: `https://dhvny-123456.netlify.app`

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend
cd c:\Dhvny\frontend

# Build the project
npm run build

# Deploy
netlify deploy

# Follow prompts:
# - Create & configure new site? Yes
# - Team? (Your team)
# - Site name? dhvny
# - Publish directory? dist

# For production deployment
netlify deploy --prod
```

---

## 🔧 Post-Deployment Configuration

### 1. Update Backend CORS

Your backend needs to allow requests from your frontend domain.

Go to **Render Dashboard** → **dhvny-backend** → **Environment**:

Update `CORS_ORIGIN`:
```
CORS_ORIGIN=https://dhvny.vercel.app,https://dhvny.netlify.app,http://localhost:5173
```

Add all your frontend URLs separated by commas.

**Save and redeploy backend** for changes to take effect.

---

## 🧪 Testing Your Deployment

### 1. Test Basic Functionality
- Visit your deployed URL
- Check if splash screen shows
- Try to sign up / log in
- Upload a song
- Play a song
- Test search

### 2. Test Backend Connection
Open browser console (F12) and check for:
- ✅ No CORS errors
- ✅ API calls successful (Network tab)
- ✅ Socket.io connection established

### 3. Check Environment Variables
In deployed site console, run:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```
Should output: `https://dhvny-backend.onrender.com/api`

---

## 🔄 Continuous Deployment

### Vercel Auto-Deploy
- Every push to `master` branch automatically deploys
- Pull requests get preview deployments
- View deployments in Vercel dashboard

### Netlify Auto-Deploy
- Every push to `master` branch automatically deploys
- Pull requests get preview deployments
- View deployments in Netlify dashboard

---

## 📱 Custom Domain (Optional)

### On Vercel:
1. Go to **Project Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `dhvny.com`)
4. Follow DNS configuration instructions

### On Netlify:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain
4. Update DNS records at your domain provider

---

## 🐛 Troubleshooting

### Issue: White Screen / Build Failed
**Solution**:
```bash
# Test build locally
cd c:\Dhvny\frontend
npm run build
npm run preview
```
Check for errors in terminal.

### Issue: API Calls Failing
**Cause**: CORS not configured or wrong API URL

**Solution**:
1. Check `VITE_API_BASE_URL` in Vercel/Netlify environment variables
2. Verify backend `CORS_ORIGIN` includes your frontend URL
3. Check browser console for CORS errors

### Issue: Socket.io Not Connecting
**Cause**: Backend URL not set correctly

**Solution**:
Check `SocketContext.jsx` uses correct backend URL from environment variable.

### Issue: Routes Not Working (404 on Refresh)
**Cause**: SPA routing not configured

**Solution**:
- Vercel: `vercel.json` already configured ✅
- Netlify: `netlify.toml` already configured ✅

### Issue: Environment Variables Not Working
**Cause**: Build didn't pick up environment variables

**Solution**:
1. Ensure variable name starts with `VITE_`
2. Redeploy with **"Clear cache and deploy"**
3. Check deployment logs

---

## 📊 Deployment Comparison

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **Price (Free)** | 100GB bandwidth | 100GB bandwidth |
| **Build Time** | ~2 min | ~2 min |
| **Auto-Deploy** | ✅ Yes | ✅ Yes |
| **Preview Deploys** | ✅ Yes | ✅ Yes |
| **Custom Domain** | ✅ Free SSL | ✅ Free SSL |
| **Analytics** | ✅ Paid | ✅ Paid |
| **Edge Functions** | ✅ Yes | ✅ Yes |
| **Recommendation** | ⭐ Best for React/Vite | ⭐ Great alternative |

---

## 🎯 Quick Deploy Checklist

- [ ] Backend deployed to Render ✅ (Already done!)
- [ ] Backend URL noted: `https://dhvny-backend.onrender.com`
- [ ] Frontend pushed to GitHub
- [ ] Vercel/Netlify account created
- [ ] Repository imported to Vercel/Netlify
- [ ] `VITE_API_BASE_URL` environment variable set
- [ ] Site deployed successfully
- [ ] Frontend URL noted (e.g., `https://dhvny.vercel.app`)
- [ ] Backend CORS updated with frontend URL
- [ ] Test: Sign up works ✅
- [ ] Test: Upload song works ✅
- [ ] Test: Play song works ✅
- [ ] Test: Search works ✅
- [ ] Test: Socket.io real-time features work ✅

---

## 📝 Important URLs

After deployment, save these URLs:

```
Backend API: https://dhvny-backend.onrender.com
Frontend: https://dhvny.vercel.app (or your custom domain)
GitHub Repo: https://github.com/sofikulsk02/Dhvny
```

---

## 🚀 You're Live!

Your Dhvny music streaming app is now deployed and accessible worldwide! 🎉

Share your app:
- Direct link: Your Vercel/Netlify URL
- QR code: Generate at https://qr.io
- Social media: Share the link

---

## 💡 Next Steps (Optional)

1. **Add Custom Domain**: Buy a domain (e.g., dhvny.com) and connect it
2. **Set Up Analytics**: Add Google Analytics or Vercel Analytics
3. **Enable HTTPS**: Already enabled by default! ✅
4. **Monitor Performance**: Check Vercel/Netlify dashboard
5. **Set Up Monitoring**: Use services like Sentry for error tracking

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Docs: https://vitejs.dev/guide/static-deploy.html

**Your app is ready to rock! 🎸🎵**
