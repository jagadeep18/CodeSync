# 🚀 Quick Deployment & Testing Guide

## Current Issue

**Error**: "No 'Access-Control-Allow-Origin' header is present on the requested resource"

**Cause**: Backend hasn't been deployed with the new CORS configuration yet, OR the origin is being rejected.

---

## ⚡ Quick Fix Steps

### Step 1: Build and Test Backend Locally (Optional)

```bash
cd server
npm run build
npm start
```

Check console output - should see:
```
[CORS] Allowed origins: [ 'http://localhost:5173', ... ]
Listening on port 3000
MongoDB connected successfully
```

### Step 2: Deploy Backend to Render

**Option A: Auto-deploy via Git (Recommended)**

```bash
# From project root
git add .
git commit -m "fix: Add CORS OPTIONS handler and debugging"
git push origin main
```

Render will auto-deploy. Monitor at: https://dashboard.render.com/

**Option B: Manual Deploy**

1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Click "Manual Deploy" → "Deploy latest commit"

### Step 3: Monitor Render Logs

1. Go to Render Dashboard → Your Service → Logs
2. Wait for deployment to complete
3. Should see:
   ```
   [CORS] Allowed origins: [ 'http://localhost:5173', ... ]
   Listening on port 10000
   MongoDB connected successfully
   ```

### Step 4: Test CORS Manually

**Test OPTIONS request:**

```bash
curl -X OPTIONS https://dev-hub-backend-latest.onrender.com/api/auth/google-login \
  -H "Origin: https://dev-hub-delta-lyart.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

**Expected response:**
```
< HTTP/2 204
< access-control-allow-origin: https://dev-hub-delta-lyart.vercel.app
< access-control-allow-credentials: true
< access-control-allow-methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
```

**If you see 404 or no CORS headers**: Backend not deployed yet or CORS not working.

### Step 5: Check Render Logs for CORS Debug Messages

After testing, check Render logs. Should see:
```
[CORS] Request from origin: https://dev-hub-delta-lyart.vercel.app
[CORS] Origin https://dev-hub-delta-lyart.vercel.app is ALLOWED
```

If you see:
```
[CORS] Origin https://dev-hub-delta-lyart.vercel.app is REJECTED
```

Then the origin validation is failing. Check that your Vercel URL matches exactly.

### Step 6: Deploy Frontend to Vercel

```bash
cd client
git add vercel.json
git commit -m "fix: Add COOP headers for Google OAuth"
git push origin main
```

Or redeploy in Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Deployments → Click "..." → Redeploy

### Step 7: Test Google OAuth

1. Open: https://dev-hub-delta-lyart.vercel.app
2. Open DevTools (F12) → Network tab
3. Click "Sign in with Google"
4. Check Network tab:
   - Should see **OPTIONS** `/api/auth/google-login` → 204
   - Should see **POST** `/api/auth/google-login` → 200
5. Check Render logs:
   - Should see `[CORS] Request from origin: https://dev-hub-delta-lyart.vercel.app`
   - Should see `[CORS] Origin ... is ALLOWED`
   - Should see `Attempting to verify Google token...`

---

## 🔍 Troubleshooting

### Issue: Still getting "No Access-Control-Allow-Origin header"

**Possible causes:**

1. **Backend not deployed yet**
   - Check Render dashboard - is it still deploying?
   - Check Render logs - do you see the new `[CORS]` log messages?

2. **Wrong backend URL in frontend**
   - Check Vercel environment variables
   - `VITE_API_URL` should be: `https://dev-hub-backend-latest.onrender.com`
   - No trailing slash!

3. **Origin being rejected**
   - Check Render logs for `[CORS] Origin ... is REJECTED`
   - Verify your Vercel URL matches exactly
   - Check for typos in `allowedOrigins` array

4. **CORS middleware not applied**
   - Check that `app.use(cors(...))` is BEFORE `app.use("/api/auth", authRoutes)`
   - Check server.ts line order

### Issue: OPTIONS request returns 404

**Cause**: `app.options("*", cors())` not working or routes defined before CORS

**Fix**: Ensure this order in server.ts:
```typescript
app.use(express.json())
app.use(cors({ ... }))
app.options("*", cors())  // BEFORE routes
app.use("/api/auth", authRoutes)
```

### Issue: POST request works but returns CORS error

**Cause**: CORS configured for OPTIONS but not for POST

**Fix**: Already handled by `app.use(cors({ ... }))` - check that it's applied globally

---

## 🧪 Testing Checklist

- [ ] Backend deployed to Render
- [ ] Render logs show `[CORS] Allowed origins: ...`
- [ ] Render logs show `Listening on port 10000`
- [ ] Render logs show `MongoDB connected successfully`
- [ ] Manual curl test returns 204 with CORS headers
- [ ] Frontend deployed to Vercel
- [ ] Vercel environment variables set (VITE_API_URL, VITE_GOOGLE_CLIENT_ID)
- [ ] Browser Network tab shows OPTIONS request → 204
- [ ] Browser Network tab shows POST request → 200
- [ ] Render logs show `[CORS] Origin ... is ALLOWED`
- [ ] Google OAuth completes successfully

---

## 📊 Expected Request Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Google popup opens (COOP headers allow this)
   ↓
3. User authenticates with Google
   ↓
4. Google returns credential token to frontend
   ↓
5. Frontend sends POST to /api/auth/google-login
   ↓
6. Browser sends OPTIONS preflight first
   ├─ Request: OPTIONS /api/auth/google-login
   ├─ Origin: https://dev-hub-delta-lyart.vercel.app
   ├─ Backend: app.options("*", cors()) handles it
   └─ Response: 204 + CORS headers
   ↓
7. Browser allows actual POST request
   ├─ Request: POST /api/auth/google-login
   ├─ Body: { tokenId: "..." }
   ├─ Backend: Verifies token with Google
   └─ Response: 200 + { token, user }
   ↓
8. Frontend stores token
   ↓
9. User is logged in ✅
```

---

## 🔗 Quick Links

- **Render Dashboard**: https://dashboard.render.com/
- **Render Logs**: https://dashboard.render.com/ → Your Service → Logs
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Backend**: https://dev-hub-backend-latest.onrender.com
- **Your Frontend**: https://dev-hub-delta-lyart.vercel.app

---

## 🆘 If Still Not Working

1. **Share Render logs** showing:
   - The `[CORS]` debug messages
   - Any errors during deployment
   - The request logs when you try to login

2. **Share browser console** showing:
   - The exact CORS error message
   - Network tab screenshot of the failed request

3. **Verify environment variables**:
   - Render: `GOOGLE_CLIENT_ID`, `MONGODB_URI`, `JWT_SECRET`
   - Vercel: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`

4. **Test with curl** and share the output

---

**Next Step**: Deploy backend to Render and monitor the logs!

```bash
git add .
git commit -m "fix: Add CORS debugging and OPTIONS handler"
git push origin main
```

Then watch Render dashboard for deployment progress.
