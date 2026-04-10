# 🔐 Google OAuth Deployment Checklist

## Quick Diagnosis

Run through these checks to identify the issue:

### ✅ Frontend (Vercel) Checks

- [ ] **Environment Variables Set in Vercel Dashboard**
  - Go to: Vercel Dashboard → Settings → Environment Variables
  - Verify these exist for **Production**:
    - `VITE_API_URL`
    - `VITE_BACKEND_URL`
    - `VITE_GOOGLE_CLIENT_ID`

- [ ] **Verify in Browser Console**
  - Open your Vercel app
  - Press F12 → Console
  - Type: `import.meta.env.VITE_GOOGLE_CLIENT_ID`
  - Should show your Client ID (not `undefined`)

- [ ] **Google Button Renders**
  - Go to login page
  - Should see Google Sign-In button
  - If you see "Google Client ID not configured" → env var missing

### ✅ Backend (Render) Checks

- [ ] **Environment Variables Set in Render**
  - Go to: Render Dashboard → Environment
  - Verify these exist:
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `MONGODB_URI`
    - `JWT_SECRET`

- [ ] **Backend is Running**
  - Visit: `https://your-backend.onrender.com`
  - Should see index.html page
  - Check Render logs for "MongoDB connected successfully"

- [ ] **Client IDs Match**
  - `VITE_GOOGLE_CLIENT_ID` (Vercel) === `GOOGLE_CLIENT_ID` (Render)
  - Both should be the same value

### ✅ Google Cloud Console Checks

- [ ] **Authorized JavaScript Origins**
  - Go to: Google Cloud Console → APIs & Services → Credentials
  - Your OAuth 2.0 Client ID should have:
    - `http://localhost:5173` (for local dev)
    - `http://localhost:3000` (for local dev)
    - `https://your-app.vercel.app` (your production URL)
    - `https://*.vercel.app` (for preview deployments)

- [ ] **Authorized Redirect URIs**
  - Should have:
    - `http://localhost:5173`
    - `http://localhost:3000`
    - `https://your-app.vercel.app`

---

## 🚀 Quick Fix Steps

### If Google Button Doesn't Render:

**Problem**: `VITE_GOOGLE_CLIENT_ID` is undefined in Vercel

**Fix**:
1. Add `VITE_GOOGLE_CLIENT_ID` in Vercel Dashboard → Settings → Environment Variables
2. Value: Your Google Client ID (e.g., `656840032038-...apps.googleusercontent.com`)
3. Select: Production, Preview, Development
4. Redeploy: Vercel Dashboard → Deployments → Redeploy

### If Google Login Fails with "Invalid Token":

**Problem**: Client ID mismatch or not configured in backend

**Fix**:
1. Verify `GOOGLE_CLIENT_ID` in Render matches `VITE_GOOGLE_CLIENT_ID` in Vercel
2. Check Render logs for "Expected audience" vs "Token payload audience"
3. Update Render environment variable if needed
4. Render will auto-redeploy

### If "origin_mismatch" Error:

**Problem**: Vercel URL not authorized in Google Cloud Console

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Add your Vercel URL to Authorized JavaScript Origins
3. Save and wait 5 minutes for Google to propagate

### If Request Never Reaches Backend:

**Problem**: Wrong API URL in frontend

**Fix**:
1. Verify `VITE_API_URL` in Vercel points to your Render backend
2. Should be: `https://your-backend.onrender.com` (no trailing slash)
3. Redeploy Vercel after fixing

---

## 🧪 Testing Checklist

After making changes:

- [ ] **Clear browser cache** (Ctrl+Shift+R)
- [ ] **Wait 5 minutes** after updating Google Cloud Console
- [ ] **Redeploy Vercel** after adding environment variables
- [ ] **Check Vercel deployment logs** for build errors
- [ ] **Check Render logs** for authentication errors

### Test Flow:

1. [ ] Open Vercel app in incognito window
2. [ ] Go to login page
3. [ ] Verify Google button appears
4. [ ] Click Google button
5. [ ] Complete Google login
6. [ ] Check Network tab for `/api/auth/google-login` request
7. [ ] Should receive 200 OK with token and user data
8. [ ] Should be redirected to dashboard/home

---

## 📊 Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Google Client ID not configured" | `VITE_GOOGLE_CLIENT_ID` missing in Vercel | Add env var in Vercel, redeploy |
| "Invalid token" or "Token verification failed" | Client ID mismatch | Match `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` |
| "origin_mismatch" | Vercel URL not in Google Console | Add URL to Authorized JavaScript Origins |
| "Network Error" or no request in Network tab | Wrong `VITE_API_URL` | Fix backend URL in Vercel env vars |
| CORS error | Backend not accepting origin | Already fixed with `origin: true` |

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com/
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Your Frontend**: https://dev-hub-delta-lyart.vercel.app
- **Your Backend**: https://dev-hub-backend-latest.onrender.com

---

## 🛠️ Automated Setup

Run the PowerShell script to automatically configure Vercel:

```powershell
cd "c:\Users\gjaga\OneDrive\Desktop\AD\Devhub\code\Dev-Hub"
.\setup-google-oauth-vercel.ps1
```

Or manually via Vercel CLI:

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variables
vercel env add VITE_GOOGLE_CLIENT_ID
# Enter your Client ID when prompted
# Select: Production, Preview, Development

# Redeploy
cd client
vercel --prod
```

---

## 📞 Need Help?

If you're still stuck after following this checklist:

1. **Check the detailed guide**: `GOOGLE_OAUTH_FIX.md`
2. **Share these details**:
   - Screenshot of browser console error
   - Render logs showing the request
   - Vercel deployment logs
   - Network tab showing failed request

---

**Last Updated**: 2026-01-24
