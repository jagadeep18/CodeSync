# Code-Sync Setup Guide

This guide will help you set up and integrate Google OAuth login and database storage features.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance like MongoDB Atlas)
- Google OAuth 2.0 credentials

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5173` (for local development)
   - `http://localhost:3000`
   - Your production domain
6. Copy your Client ID

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
```bash
# Install MongoDB locally and start the service
mongod
```

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
# Dev Hub Setup Guide
3. Copy your connection string
4. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/code-sync`

## Step 3: Environment Variables

### Server Setup (`.env` in `/server`)
4. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/dev-hub`
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/code-sync
# Or for MongoDB Atlas:
MONGODB_URI=mongodb://localhost:27017/codenest

# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dev-hub
JWT_SECRET=your-secret-jwt-key-generate-a-random-string
```

### Client Setup (`.env.local` in `/client`)

```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## Step 4: Install Dependencies

### Server
```bash
Dev-Hub/
npm install
```

### Client
```bash
cd client
npm install
```

## Step 5: Run the Application

### Terminal 1 - Start MongoDB (if using local)
```bash
mongod
```

### Terminal 2 - Start Server
```bash
cd server
npm run dev
```

The server will start on `http://localhost:3000`

### Terminal 3 - Start Client
```bash
cd client
npm run dev
```

The client will start on `http://localhost:5173`

## Features Overview

### 1. Google OAuth Login
- Click the Google login button on the home page
- Authenticate with your Google account
- Your profile information is automatically saved

### 2. Project Storage
Once logged in, you can:
- **Save Projects**: Save your current work with a project name
- **Download Projects**: Download projects as ZIP files with all files and whiteboard data
- **View Projects**: See all your saved projects
- **Delete Projects**: Remove projects you no longer need

### 3. File Management
- Upload folders and files from your computer
- Create, edit, and delete files
- Files are synchronized in real-time

### 4. Collaboration
- Join a room with a unique Room ID
- Collaborate with others in real-time
- See live updates from other users

## API Endpoints

### Authentication
- `POST /api/auth/google-login` - Google OAuth login
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info

### Projects
- `POST /api/projects/save` - Save a project
- `GET /api/projects/list` - Get all projects
- `GET /api/projects/:projectId` - Get specific project
- `GET /api/projects/room/:roomId` - Get project by room ID
- `DELETE /api/projects/:projectId` - Delete a project
- `PATCH /api/projects/:projectId/drawing` - Update drawing data

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, whitelist your IP address

### Google Login Not Working
- Verify `GOOGLE_CLIENT_ID` is correct in both `.env` files
- Check that your redirect URIs are configured in Google Cloud Console
- Clear browser cache and cookies

### Port Already in Use
- Change the `PORT` in server `.env` to another port (e.g., 3001)
- Update `VITE_API_URL` in client `.env.local` to match

### CORS Errors
- Ensure both client and server are running
- Check that `VITE_API_URL` matches the server URL

## Project Structure

```
Code-Sync/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── projectAPI.ts
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── GoogleLoginComponent.tsx
│   │   │   ├── common/
│   │   │   │   └── UserProfile.tsx
│   │   │   └── projects/
│   │   │       └── ProjectManager.tsx
│   │   ├── context/
│   │   │   └── AppContext.tsx
│   │   └── types/
│   │       ├── app.ts
│   │       └── user.ts
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   └── db.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Project.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── projects.ts
│   │   └── server.ts
│   └── .env.example
```

## Next Steps

1. Customize the UI to match your branding
2. Add more features like team workspaces
3. Implement role-based access control
4. Add project sharing capabilities
5. Set up automated backups for MongoDB

## Support

For issues or questions, please open an issue on GitHub or refer to the documentation for the libraries used:
- [Socket.io Documentation](https://socket.io/docs/)
- [Google OAuth Documentation](https://developers.google.com/identity)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
