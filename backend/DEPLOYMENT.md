# Dhvny Backend - Render Deployment Guide

## Prerequisites

- GitHub account with your backend code pushed to a repository
- Render account (sign up at https://render.com)
- MongoDB Atlas is already configured ✅
- Cloudinary is already configured ✅

## Step 1: Prepare Your Repository

1. Make sure your backend code is pushed to GitHub
2. The `render.yaml` file is already created in your backend folder

## Step 2: Create a New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your **dhvny backend repository**

## Step 3: Configure the Service

### Basic Settings:

- **Name**: `dhvny-backend` (or any name you prefer)
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main` or `master`
- **Root Directory**: Leave empty or set to `backend` if it's in a subfolder
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node src/server.js`

### Instance Type:

- **Free**: For testing (sleeps after 15 min inactivity)
- **Starter ($7/month)**: For production (always on)

## Step 4: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

### Required Variables:

```env
NODE_ENV=production

PORT=10000

MONGODB_URI=mongodb+srv://dhvny:e0Csj6CoX7cl2Nvb@dhvny-cluster.dxj50pp.mongodb.net/dhvny?retryWrites=true&w=majority

JWT_SECRET=dhvny-super-secret-jwt-key-change-this-for-production-2024

JWT_REFRESH_SECRET=dhvny-refresh-secret-change-this-too-2024

JWT_EXPIRES_IN=7d

JWT_REFRESH_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=desr9wxwa

CLOUDINARY_API_KEY=758365161158578

CLOUDINARY_API_SECRET=4KY2G8YsXFnvTnPj6MHeBKc5Flo

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

MAX_FILE_SIZE=52428800

MAX_AUDIO_SIZE=52428800

MAX_IMAGE_SIZE=5242880
```

### Important Notes:

- **CORS_ORIGIN**: Change to your frontend URL after deploying frontend (e.g., `https://dhvny.vercel.app`)
- **JWT_SECRET & JWT_REFRESH_SECRET**: Consider generating new secrets for production:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

## Step 5: MongoDB Atlas Configuration

Your MongoDB Atlas is already set up, but you need to:

1. Go to https://cloud.mongodb.com
2. Click **"Network Access"** in the left sidebar
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

This allows Render's servers to connect to your database.

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start your server with `node src/server.js`
3. Wait for the deployment to complete (3-5 minutes)

## Step 7: Get Your Backend URL

After deployment completes, you'll see:

- **URL**: `https://dhvny-backend.onrender.com` (example)
- Copy this URL - you'll need it for your frontend

## Step 8: Test Your Backend

Test these endpoints in your browser or Postman:

```
https://your-app.onrender.com/api/health
https://your-app.onrender.com/api/songs
```

## Step 9: Update Frontend Configuration

In your frontend, update the API base URL:

```javascript
// frontend/src/api/client.js
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://dhvny-backend.onrender.com/api";
```

Create `frontend/.env`:

```env
VITE_API_URL=https://dhvny-backend.onrender.com/api
```

## Step 10: Update CORS_ORIGIN

Once you deploy your frontend:

1. Go to Render dashboard
2. Select your backend service
3. Go to **"Environment"** tab
4. Update `CORS_ORIGIN` to your frontend URL
5. Save (this will trigger a redeploy)

Example:

```env
CORS_ORIGIN=https://dhvny.vercel.app,https://dhvny.netlify.app
```

## Troubleshooting

### Service won't start:

- Check **"Logs"** tab in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB URI is correct

### Database connection fails:

- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Test connection string in MongoDB Compass

### CORS errors:

- Update `CORS_ORIGIN` environment variable
- Redeploy after changing CORS settings

### Free tier sleep:

- Free services sleep after 15 min inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to Starter plan ($7/month) for production

## Important Security Notes

### Before Going Live:

1. **Generate new JWT secrets**:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Update `JWT_SECRET` and `JWT_REFRESH_SECRET` in Render

2. **Never commit .env files** to GitHub

   - Already in `.gitignore` ✅

3. **Rotate Cloudinary keys** if they were exposed in Git history

4. **Set specific CORS_ORIGIN** instead of wildcard

## Optional: Auto-Deploy on Git Push

Render automatically redeploys when you push to your GitHub branch.

To disable auto-deploy:

1. Go to service settings
2. Toggle **"Auto-Deploy"** off

## Monitoring

Monitor your service:

- **Logs**: Real-time logs in Render dashboard
- **Metrics**: CPU, memory usage (Starter plan and above)
- **Health checks**: Render pings your service every minute

## Cost Estimation

- **Free tier**: $0/month (sleeps after 15 min)
- **Starter**: $7/month (always on, better performance)
- **Standard**: $25/month (more resources, autoscaling)

## Next Steps

After backend is deployed:

1. ✅ Deploy frontend to Vercel/Netlify
2. ✅ Update frontend API URL
3. ✅ Update backend CORS_ORIGIN
4. ✅ Test full application
5. ✅ Set up custom domain (optional)

## Support

If you encounter issues:

- Check Render logs: https://dashboard.render.com → Your Service → Logs
- MongoDB Atlas logs: https://cloud.mongodb.com → Monitoring
- Render Community: https://community.render.com

---

**Your backend is ready to deploy! 🚀**

Just push your code to GitHub and follow the steps above.
