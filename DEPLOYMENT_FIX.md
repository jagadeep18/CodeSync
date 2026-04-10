# 🔧 Backend Connection Fix for Vercel Deployment

## 🚨 Issues Found

### 1. **Backend URL Typo**
- You mentioned: `https://dev-hub-backend-latest.onrender.co` ❌
- Correct URL should be: `https://dev-hub-backend-latest.onrender.com` ✅
- Render uses `.onrender.com` not `.onrender.co`

### 2. **Environment Variable Mismatch**
- **Socket.IO** expects: `VITE_BACKEND_URL` (line 30 in SocketContext.tsx)
- **API calls** expect: `VITE_API_URL` (used in projectAPI.ts and GoogleLoginComponent.tsx)
- **Your .env** only has: `VITE_API_URL`

### 3. **Vercel Environment Variables Not Set**
- Vercel **does NOT** read `.env` files from your repository
- You must manually set environment variables in Vercel dashboard

---

## ✅ Solution

### Step 1: Update Local Environment Files

I'll update your `.env` file to include both variables:

```env
VITE_API_URL=https://dev-hub-backend-latest.onrender.com
VITE_BACKEND_URL=https://dev-hub-backend-latest.onrender.com
```

### Step 2: Configure Vercel Environment Variables

You need to add these environment variables in your Vercel dashboard:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `dev-hub-delta-lyart`
3. **Go to Settings** → **Environment Variables**
4. **Add the following variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://dev-hub-backend-latest.onrender.com` | Production, Preview, Development |
| `VITE_BACKEND_URL` | `https://dev-hub-backend-latest.onrender.com` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `656840032038-e570hfn9l5dm8cl4lakbpf60ig4t6h5a.apps.googleusercontent.com` | Production, Preview, Development |

5. **Redeploy** your application after adding the variables

### Step 3: Verify Backend is Running

Test your backend URL:
- Open: https://dev-hub-backend-latest.onrender.com
- You should see your backend's index.html page

### Step 4: Redeploy Frontend

After setting the environment variables in Vercel:
1. Go to your Vercel project
2. Click **Deployments**
3. Click the three dots on the latest deployment
4. Click **Redeploy**

---

## 🔍 How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Visit: https://vercel.com/dashboard
2. Click on your project: **dev-hub-delta-lyart**
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. For each variable:
   - Enter the **Key** (e.g., `VITE_API_URL`)
   - Enter the **Value** (e.g., `https://dev-hub-backend-latest.onrender.com`)
   - Select **All Environments** (Production, Preview, Development)
   - Click **Save**

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add VITE_API_URL
# When prompted, enter: https://dev-hub-backend-latest.onrender.com
# Select: Production, Preview, Development

vercel env add VITE_BACKEND_URL
# When prompted, enter: https://dev-hub-backend-latest.onrender.com
# Select: Production, Preview, Development

vercel env add VITE_GOOGLE_CLIENT_ID
# When prompted, enter: 656840032038-e570hfn9l5dm8cl4lakbpf60ig4t6h5a.apps.googleusercontent.com
# Select: Production, Preview, Development
```

---

## 🧪 Testing After Fix

### Test Backend Connection
1. Open browser console on: https://dev-hub-delta-lyart.vercel.app/
2. Check for errors - should see no CORS errors
3. Socket.IO should connect successfully

### Test API Calls
1. Try logging in with Google
2. Try creating/saving a project
3. Check Network tab - all requests should go to `https://dev-hub-backend-latest.onrender.com`

---

## 🛠️ Alternative: Fix the Code (Long-term Solution)

Instead of maintaining two separate environment variables, you could update `SocketContext.tsx` to use the same variable:

**Change line 30 from:**
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
```

**To:**
```typescript
const BACKEND_URL = import.meta.env.VITE_API_URL;
```

This way you only need one environment variable: `VITE_API_URL`

---

## 📋 Quick Checklist

- [ ] Verify backend URL is `.onrender.com` (not `.co`)
- [ ] Update local `.env` file with both variables
- [ ] Add environment variables to Vercel dashboard
- [ ] Redeploy frontend on Vercel
- [ ] Test backend connection
- [ ] Test API calls and Socket.IO connection

---

## 🔗 Important URLs

- **Backend**: https://dev-hub-backend-latest.onrender.com
- **Frontend**: https://dev-hub-delta-lyart.vercel.app/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com/

---

## 🆘 Still Having Issues?

If you're still seeing connection errors after following these steps:

1. **Check Vercel Deployment Logs**:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check the build logs for any errors

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for specific error messages
   - Check Network tab for failed requests

3. **Verify Environment Variables**:
   - In Vercel Dashboard → Settings → Environment Variables
   - Make sure all variables are set for "Production"
   - Click "Redeploy" after making changes

4. **Check Render Backend**:
   - Visit https://dev-hub-backend-latest.onrender.com directly
   - Should see your backend's index page
   - Check Render logs for any errors
