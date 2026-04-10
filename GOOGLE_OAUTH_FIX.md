# 🔐 Google OAuth Fix for Vercel + Render Deployment

## 🚨 Problem Summary

**Symptoms:**
- ❌ "Google Client ID not configured" error in frontend
- ❌ "Google login failed. Please try again" toast message
- ❌ `/api/auth/google-login` does NOT appear in Network tab
- ❌ No auth request logs in Render backend
- ✅ Regular API routes work fine
- ✅ MongoDB connects successfully

**Root Cause:**
The Google OAuth button never renders because `VITE_GOOGLE_CLIENT_ID` is not available in the deployed Vercel app. This is a **frontend configuration issue**, not a CORS issue.

---

## ✅ Complete Fix (Step-by-Step)

### Step 1: Verify Your Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create one if you haven't)
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID** (or create one)

#### Required Configuration:

**Authorized JavaScript Origins** (add ALL of these):
```
http://localhost:5173
http://localhost:3000
https://dev-hub-delta-lyart.vercel.app
https://*.vercel.app
```

**Authorized Redirect URIs** (add ALL of these):
```
http://localhost:5173
http://localhost:3000
https://dev-hub-delta-lyart.vercel.app
https://dev-hub-delta-lyart.vercel.app/
```

> **Important**: Replace `dev-hub-delta-lyart.vercel.app` with your actual Vercel deployment URL

5. **Copy your Client ID** - you'll need it in the next steps

---

### Step 2: Update Environment Variables in Vercel

This is the **CRITICAL** step that's currently missing.

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select your project: **dev-hub-delta-lyart** (or your project name)
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_URL` | `https://your-backend.onrender.com` | Production, Preview, Development |
| `VITE_BACKEND_URL` | `https://your-backend.onrender.com` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` | Production, Preview, Development |

> **Replace** the backend URL with your actual Render URL
> **Replace** the Client ID with your actual Google Client ID

6. **Save** each variable
7. **Redeploy** your application (see Step 4)

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Navigate to your client directory
cd client

# Add environment variables
vercel env add VITE_API_URL
# When prompted, enter: https://dev-hub-backend-latest.onrender.com
# Select: Production, Preview, Development

vercel env add VITE_BACKEND_URL
# When prompted, enter: https://your-backend.onrender.com
# Select: Production, Preview, Development

vercel env add VITE_GOOGLE_CLIENT_ID
# When prompted, enter: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
# Select: Production, Preview, Development
```

---

### Step 3: Update Environment Variables in Render (Backend)

1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Click **Environment** in the left sidebar
4. Add/Update these variables:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `YOUR_GOOGLE_CLIENT_SECRET` |
| `MONGODB_URI` | `mongodb+srv://DevHub:GJChinnu%4013579@devhub.9fco20y.mongodb.net/?appName=DevHub` |
| `JWT_SECRET` | `41764863136003446d4ce70628de950784146fc33af8e44aeef5eb62fcfcb4cd` |
| `PORT` | `10000` |

> **Important**: Make sure the `GOOGLE_CLIENT_ID` in Render **MATCHES** the `VITE_GOOGLE_CLIENT_ID` in Vercel

5. **Save Changes** - Render will automatically redeploy

---

### Step 4: Redeploy Both Services

#### Redeploy Vercel (Frontend):
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

#### Verify Render (Backend):
1. Go to Render Dashboard → Your Service
2. Check that it's running
3. Visit your backend URL: `https://dev-hub-backend-latest.onrender.com`
4. You should see the index.html page

---

### Step 5: Verify the Fix

#### Test 1: Check Environment Variables in Browser
1. Open your Vercel app: `https://dev-hub-delta-lyart.vercel.app`
2. Open DevTools (F12) → Console
3. Type: `import.meta.env.VITE_GOOGLE_CLIENT_ID`
4. Should show your Client ID (not `undefined`)

#### Test 2: Check Google Button Renders
1. Go to the login page
2. You should see the Google Sign-In button
3. If you see "Google Client ID not configured", the env var is still missing

#### Test 3: Test Google Login
1. Click "Sign in with Google"
2. Complete the Google login flow
3. Check Network tab - you should see:
   - Request to `/api/auth/google-login`
   - Status: 200 OK
   - Response with token and user data

#### Test 4: Check Render Logs
1. Go to Render Dashboard → Your Service → Logs
2. After clicking Google login, you should see:
   ```
   Attempting to verify Google token...
   Expected audience (Client ID): 656840032038...
   ```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Google Client ID not configured" Still Appears

**Cause**: Environment variable not loaded in Vercel

**Solution**:
1. Verify you added `VITE_GOOGLE_CLIENT_ID` in Vercel dashboard
2. Make sure you selected **Production** environment
3. **Redeploy** the app after adding the variable
4. Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue 2: "Token verification failed" or "Invalid audience"

**Cause**: Client ID mismatch between frontend and backend

**Solution**:
1. Verify `VITE_GOOGLE_CLIENT_ID` (Vercel) **MATCHES** `GOOGLE_CLIENT_ID` (Render)
2. Both should be: `656840032038-e570hfn9l5dm8cl4lakbpf60ig4t6h5a.apps.googleusercontent.com`
3. Redeploy both services after fixing

### Issue 3: "origin_mismatch" Error

**Cause**: Vercel URL not added to Google Cloud Console

**Solution**:
1. Go to Google Cloud Console → Credentials
2. Add your Vercel URL to **Authorized JavaScript Origins**:
   - `https://dev-hub-delta-lyart.vercel.app`
   - `https://*.vercel.app` (for preview deployments)
3. Save and wait 5 minutes for Google to propagate changes

### Issue 4: CORS Error on `/api/auth/google-login`

**Cause**: Backend CORS not accepting frontend origin

**Solution**:
Your backend already has `origin: true` which accepts all origins, so this shouldn't happen. But if it does:

1. Check Render logs to see the actual origin being rejected
2. Update `server.ts` CORS config if needed (though `origin: true` should work)

### Issue 5: Request Never Reaches Backend

**Cause**: Wrong API URL in frontend

**Solution**:
1. Verify `VITE_API_URL` in Vercel is correct
2. Should be: `https://dev-hub-backend-latest.onrender.com`
3. **NO trailing slash** at the end
4. Redeploy after fixing

---

## 🎯 Why This Happens

### The OAuth Flow:
```
1. Frontend loads → Checks for VITE_GOOGLE_CLIENT_ID
   ❌ If missing: Shows "Google Client ID not configured"
   ✅ If present: Renders Google button

2. User clicks Google button → Google OAuth popup opens
   - Uses VITE_GOOGLE_CLIENT_ID from frontend
   - Redirects to Google login
   - User authenticates

3. Google returns credential token → Frontend receives it
   - Frontend sends token to backend: POST /api/auth/google-login

4. Backend verifies token → Uses GOOGLE_CLIENT_ID
   - Verifies token audience matches GOOGLE_CLIENT_ID
   - Creates/updates user in MongoDB
   - Returns JWT token

5. Frontend stores token → User is logged in
```

### Where It's Failing:
**Step 1** - The Google button never renders because `VITE_GOOGLE_CLIENT_ID` is `undefined` in Vercel.

---

## 🔐 Security Best Practices

### ✅ What You're Doing Right:
- Using environment variables (not hardcoding)
- Separate Client ID and Secret
- CORS configured with credentials
- JWT for session management

### ⚠️ Security Improvements:

1. **Rotate Your Secrets** (I can see them in your .env.local):
   - Your `GOOGLE_CLIENT_SECRET` is exposed in this chat
   - Your `JWT_SECRET` is exposed
   - Your `MONGODB_URI` with password is exposed
   
   **Action Required**:
   - Generate new Google Client Secret in Google Cloud Console
   - Generate new JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Update MongoDB password in Atlas
   - Update all environment variables in Vercel and Render

2. **Use Different Client IDs for Dev/Prod** (Optional but recommended):
   - Create separate OAuth credentials for development and production
   - Use different `VITE_GOOGLE_CLIENT_ID` for local vs Vercel

3. **Restrict CORS in Production** (Optional):
   Instead of `origin: true`, use specific origins:
   ```typescript
   origin: [
     "https://dev-hub-delta-lyart.vercel.app",
     /.*\.vercel\.app$/,
     // Add localhost only in development
     ...(process.env.NODE_ENV === 'development' ? ["http://localhost:5173", "http://localhost:3000"] : [])
   ]
   ```

---

## 📋 Quick Checklist

Before testing, make sure:

- [ ] Google Cloud Console has your Vercel URL in Authorized JavaScript Origins
- [ ] Vercel has `VITE_GOOGLE_CLIENT_ID` environment variable set
- [ ] Vercel has `VITE_API_URL` pointing to your Render backend
- [ ] Render has `GOOGLE_CLIENT_ID` matching the frontend's `VITE_GOOGLE_CLIENT_ID`
- [ ] Render has `GOOGLE_CLIENT_SECRET` set
- [ ] Both services have been redeployed after setting environment variables
- [ ] You've waited 5 minutes after updating Google Cloud Console settings
- [ ] You've cleared browser cache and hard reloaded

---

## 🆘 Still Not Working?

If you've followed all steps and it's still failing:

1. **Check Vercel Build Logs**:
   - Go to Vercel → Deployments → Latest Deployment → Build Logs
   - Look for environment variable warnings

2. **Check Vercel Function Logs**:
   - Go to Vercel → Deployments → Latest Deployment → Functions
   - Look for runtime errors

3. **Check Render Logs**:
   - Go to Render → Your Service → Logs
   - Look for authentication errors

4. **Test Backend Directly**:
   ```bash
   curl -X POST https://dev-hub-backend-latest.onrender.com/api/auth/google-login \
     -H "Content-Type: application/json" \
     -d '{"tokenId": "test"}'
   ```
   Should return an error (invalid token) but confirms the endpoint is reachable

5. **Share the Error**:
   - Take a screenshot of browser console errors
   - Share Render logs showing the request
   - Share Vercel deployment logs

---

## 🔗 Important URLs

- **Frontend (Vercel)**: https://dev-hub-delta-lyart.vercel.app
- **Backend (Render)**: https://dev-hub-backend-latest.onrender.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com/
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Last Updated**: 2026-01-24
**Status**: Ready to implement
