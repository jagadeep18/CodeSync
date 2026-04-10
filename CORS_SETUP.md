# CORS Configuration for Dev-Hub Backend

## Overview
This document explains the CORS (Cross-Origin Resource Sharing) configuration for the Dev-Hub backend to allow your React frontend (deployed on Vercel) to communicate with your Node.js backend (deployed on Render).

## What Was Changed

### 1. Express CORS Middleware (server.ts)
Updated the CORS configuration to allow requests from:
- **Local Development**: `http://localhost:3000` and `http://localhost:5173`
- **Production (Vercel)**: Any domain ending with `.vercel.app`
- **Testing (ngrok)**: Any ngrok tunnel domains

```typescript
app.use(cors({
	origin: [
		"http://localhost:5173",      // Vite dev server
		"http://localhost:3000",      // React dev server
		/.*\.vercel\.app$/,           // Vercel deployed frontend
		/.*\.ngrok(?:-free)?\.app$/   // ngrok tunnels
	],
	credentials: true,                // Allow cookies and authentication headers
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}))
```

### 2. Socket.IO CORS Configuration
Updated Socket.IO to match the Express CORS settings for consistency:

```typescript
const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:5173",
			"http://localhost:3000",
			/.*\.vercel\.app$/,
			/.*\.ngrok(?:-free)?\.app$/
		],
		credentials: true,
		methods: ["GET", "POST"]
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
})
```

## Comparison with Python FastAPI

Your Python FastAPI example:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

Our Node.js/Express equivalent provides the same functionality plus:
- ✅ Support for multiple origins (localhost + production)
- ✅ Regex patterns for dynamic domain matching (Vercel, ngrok)
- ✅ Credentials support for authentication
- ✅ All HTTP methods allowed
- ✅ Common headers allowed

## Deployment Instructions

### For Render (Backend)
1. Make sure your backend is deployed on Render
2. The CORS configuration will automatically accept requests from any `.vercel.app` domain
3. No additional environment variables needed for CORS

### For Vercel (Frontend)
1. Deploy your frontend to Vercel
2. Update your frontend API base URL to point to your Render backend
3. Example: `https://your-backend.onrender.com`

### Environment Variables
Make sure your frontend has the backend URL configured:

```env
VITE_API_URL=https://your-backend.onrender.com
# or for React
REACT_APP_API_URL=https://your-backend.onrender.com
```

## Testing

### Local Development
1. Start backend: `npm run dev` (runs on port 4000 by default)
2. Start frontend: `npm run dev` (runs on port 5173 for Vite or 3000 for React)
3. Both should communicate without CORS errors

### Production
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Your Vercel domain (e.g., `https://dev-hub.vercel.app`) will be automatically allowed

## Troubleshooting

### CORS Error Still Occurring?
1. **Check browser console** for the exact error message
2. **Verify frontend URL** matches one of the allowed origins
3. **Check Render logs** to see if requests are reaching the backend
4. **Ensure credentials** are being sent if using authentication

### Adding Additional Domains
If you need to allow additional domains, add them to the `origin` array:

```typescript
origin: [
	"http://localhost:5173",
	"http://localhost:3000",
	/.*\.vercel\.app$/,
	/.*\.ngrok(?:-free)?\.app$/,
	"https://your-custom-domain.com"  // Add custom domains here
],
```

## Security Notes

- ✅ **Credentials enabled**: Allows cookies and authentication headers
- ✅ **Specific origins**: Uses regex patterns instead of wildcard `*`
- ✅ **Common methods**: Allows standard HTTP methods
- ✅ **Standard headers**: Allows Content-Type, Authorization, etc.

## Next Steps

1. **Build and deploy** your backend to Render:
   ```bash
   npm run build
   ```

2. **Test locally** before deploying:
   ```bash
   npm run dev
   ```

3. **Deploy frontend** to Vercel with the correct backend URL

4. **Monitor** for any CORS errors in production and adjust as needed

## Additional Resources

- [Express CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)
- [Socket.IO CORS Documentation](https://socket.io/docs/v4/handling-cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
