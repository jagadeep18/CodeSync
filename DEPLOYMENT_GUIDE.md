# Deployment Guide - GitHub, Vercel & Render

## Overview
This guide covers deploying your Dev-Hub application with:
- **GitHub**: Source code repository
- **Vercel**: Frontend (React/Vite client)
- **Render**: Backend (Node.js/Express server with Docker)

---

## 1. GitHub Repository Setup

### Repository URL
```
https://github.com/jagadeep18/dev-hub.git
```

### Current Configuration
The repository is already configured correctly:
```bash
git remote -v
# origin  https://github.com/jagadeep18/dev-hub.git (fetch)
# origin  https://github.com/jagadeep18/dev-hub.git (push)
```

### Pushing Changes
```bash
# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "feat: Add Google OAuth fix, logout functionality, and zoom improvements"

# Push to GitHub
git push origin main
```

---

## 2. Vercel Deployment (Frontend)

### Automatic Deployment
Vercel is connected to your GitHub repository and will **automatically deploy** when you push to the `main` branch.

### Configuration
**Project**: `dev-hub-delta-lyart.vercel.app`

**Build Settings**:
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables (Vercel)
Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# VITE_BACKEND_URL - Still needed for WebSocket connections
VITE_BACKEND_URL=https://dev-hub-backend-latest.onrender.com

# VITE_GOOGLE_CLIENT_ID - Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=656840032038-9tcp1pmsagbvkjm233pv5qth1nm1cou6.apps.googleusercontent.com
```

> **Note**: `VITE_API_URL` is no longer needed. API calls use relative URLs (`/api/*`) which are proxied to the backend by Vercel's configuration.

### Manual Deployment (if needed)
```bash
cd client
vercel --prod
```

---

## 3. Render Deployment (Backend with Docker)

### Service Configuration
**Service Name**: `dev-hub-backend-latest`  
**URL**: `https://dev-hub-backend-latest.onrender.com`

### Docker Deployment
Render will use the `Dockerfile` in the root directory to build and deploy your backend.

### Updated Dockerfile
The Dockerfile has been optimized for TypeScript:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy TypeScript configuration and source code
COPY server/tsconfig.json ./
COPY server/src ./src

# Build TypeScript to JavaScript
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the server (using the built JavaScript)
CMD ["node", "dist/server.js"]
```

### Render Settings
**Environment**: Docker  
**Docker Command**: (uses CMD from Dockerfile)  
**Port**: 3000

### Environment Variables (Render)
Set these in Render Dashboard → Environment:

```env
PORT=3000
MONGOURI_URI=mongodb+srv://DevHub:GJChinnu%4013579@devhub.9fco20y.mongodb.net/devhub?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=656840032038-9tcp1pmsagbvkjm233pv5qth1nm1cou6.apps.googleusercontent.com
JWT_SECRET=41764863136003446d4ce70628de950784146fc33af8e44aeef5eb62fcfcb4cd
```

### Automatic Deployment
Render is connected to your GitHub repository and will **automatically deploy** when you push to the `main` branch.

### Manual Deployment (if needed)
1. Go to Render Dashboard
2. Select your service: `dev-hub-backend-latest`
3. Click "Manual Deploy" → "Deploy latest commit"

---

## 4. Complete Deployment Workflow

### Single URL Architecture

Your application now uses a **single URL** for both frontend and backend:

```
https://dev-hub-delta-lyart.vercel.app
                    │
                    ├── / (Frontend - React app)
                    ├── /api/* (Proxied to backend → https://dev-hub-backend-latest.onrender.com)
                    └── Socket.IO (WebSocket - direct connection)
```

**How it works:**
1. **Frontend**: Served directly from Vercel's edge network
2. **REST API**: Vercel proxies `/api/*` requests to the Render backend
3. **WebSocket**: Direct connection to Render backend (different protocol)

### Step-by-Step Process

#### 1. Commit and Push Changes
```bash
# Navigate to project root
cd c:\Users\gjaga\OneDrive\Desktop\AD\Devhub\code\Dev-Hub

# Check status
git status

# Stage all changes
git add .

# Commit
git commit -m "feat: OAuth fix, logout, zoom improvements, Docker optimization"

# Push to GitHub
git push origin main
```

#### 2. Automatic Deployments Trigger
- **Vercel**: Detects push → Builds frontend → Deploys to production
- **Render**: Detects push → Builds Docker image → Deploys backend

#### 3. Monitor Deployments
- **Vercel**: Check deployment status at https://vercel.com/dashboard
- **Render**: Check deployment logs at https://dashboard.render.com

#### 4. Verify Deployment
- **Frontend & API**: https://dev-hub-delta-lyart.vercel.app
- **WebSocket**: https://dev-hub-backend-latest.onrender.com
- **Health Check**: Visit backend URL to see if server responds

---

## 5. Important Files

### Root Directory
- `Dockerfile` - Backend Docker configuration for Render
- `.gitignore` - Excludes node_modules, .env, dist, etc.

### Client Directory
- `client/Dockerfile` - Frontend Docker (not used by Vercel)
- `client/vercel.json` - Vercel configuration
- `client/.env` - Production environment variables (gitignored)
- `client/.env.local` - Local development variables (gitignored)

### Server Directory
- `server/Dockerfile` - Alternative backend Docker (not used)
- `server/.env` - Server environment variables (gitignored)
- `server/package.json` - Contains build script: `"build": "tsc"`

---

## 6. Troubleshooting

### Vercel Build Fails
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Ensure `client/package.json` has correct build script
4. Check for TypeScript errors

### Render Build Fails
1. Check build logs in Render dashboard
2. Verify Dockerfile syntax
3. Ensure all dependencies are in `package.json`
4. Check TypeScript compilation errors

### Backend Not Connecting
1. Verify MongoDB connection string
2. Check CORS configuration allows Vercel domain
3. Ensure environment variables are set in Render
4. Check server logs for errors

### Google OAuth Issues
1. Verify Client ID matches in both frontend and backend
2. Check authorized JavaScript origins in Google Cloud Console:
   - `https://dev-hub-delta-lyart.vercel.app`
   - `http://localhost:5173` (for development)
3. Ensure redirect URIs are configured

---

## 7. Post-Deployment Checklist

After pushing to GitHub:

- [ ] Vercel deployment completes successfully
- [ ] Render deployment completes successfully
- [ ] Frontend loads at Vercel URL
- [ ] Backend responds at Render URL
- [ ] Google OAuth login works
- [ ] Socket.IO connection works
- [ ] Room joining works
- [ ] File editing and collaboration works
- [ ] Logout functionality works

---

## 8. Rollback Strategy

If deployment fails:

### Vercel
```bash
# Redeploy previous version from Vercel dashboard
# Or revert commit and push
git revert HEAD
git push origin main
```

### Render
1. Go to Render dashboard
2. Select previous successful deployment
3. Click "Redeploy"

---

## Summary

✅ **GitHub**: Repository configured at `https://github.com/jagadeep18/dev-hub.git`  
✅ **Vercel**: Auto-deploys frontend from `client/` directory  
✅ **Render**: Auto-deploys backend using Docker from root `Dockerfile`  
✅ **Single URL**: Both frontend and API accessible at `https://dev-hub-delta-lyart.vercel.app`
✅ **API Proxy**: Vercel proxies `/api/*` requests to Render backend
✅ **Docker**: Optimized for TypeScript build and Node.js runtime  

**Next Step**: Push your changes to GitHub to trigger automatic deployments! 🚀
