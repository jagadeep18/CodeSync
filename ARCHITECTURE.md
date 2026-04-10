# Code-Sync Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER BROWSER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Frontend (Port 5173)                 │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │        App.tsx (Routes)                        │  │  │
│  │  │  ├── HomePage.tsx (Google Login)              │  │  │
│  │  │  └── EditorPage.tsx (Main Editor)             │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │        Context Providers                       │  │  │
│  │  │  ├── AppContext (Auth State)                  │  │  │
│  │  │  ├── FileContext (File Management)           │  │  │
│  │  │  ├── SocketContext (Real-time Sync)          │  │  │
│  │  │  └── ChatContext                             │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │     Components                                 │  │  │
│  │  │  ├── GoogleLoginComponent                      │  │  │
│  │  │  ├── ProjectManager                           │  │  │
│  │  │  ├── FileStructureView                        │  │  │
│  │  │  ├── Editor                                   │  │  │
│  │  │  └── DrawingEditor                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │     API Calls                                  │  │  │
│  │  │  ├── projectAPI.ts                            │  │  │
│  │  │  └── axios (HTTP Client)                      │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │     Local Storage                              │  │  │
│  │  │  ├── authToken                                │  │  │
│  │  │  └── currentUser                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP/REST + WebSocket
                         │
┌─────────────────────────────────────────────────────────────┐
│                 EXPRESS SERVER (Port 3000)                  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Server.ts (Main Server)                   │  │
│  │  ├── Express App Setup                             │  │
│  │  ├── CORS Configuration                            │  │
│  │  ├── MongoDB Connection                            │  │
│  │  └── Socket.io Configuration                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Routes                                    │  │
│  │  ├── auth.ts                                        │  │
│  │  │   ├── POST /api/auth/google-login              │  │
│  │  │   ├── POST /api/auth/register                  │  │
│  │  │   ├── POST /api/auth/login                     │  │
│  │  │   └── GET /api/auth/me                         │  │
│  │  │                                                 │  │
│  │  └── projects.ts                                   │  │
│  │      ├── POST /api/projects/save                  │  │
│  │      ├── GET /api/projects/list                   │  │
│  │      ├── GET /api/projects/:id                    │  │
│  │      ├── GET /api/projects/room/:roomId           │  │
│  │      ├── DELETE /api/projects/:id                 │  │
│  │      └── PATCH /api/projects/:id/drawing          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Middleware                                │  │
│  │  ├── authMiddleware (JWT verification)             │  │
│  │  ├── CORS                                          │  │
│  │  └── JSON Parser                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Services                                  │  │
│  │  ├── Google OAuth Verification                      │  │
│  │  ├── JWT Generation                                │  │
│  │  ├── Password Hashing (bcryptjs)                   │  │
│  │  └── Socket.io Events Handling                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Socket.io Events                          │  │
│  │  ├── JOIN_REQUEST / JOIN_ACCEPTED                  │  │
│  │  ├── FILE_CREATED / FILE_UPDATED / FILE_DELETED   │  │
│  │  ├── DRAWING_UPDATE                               │  │
│  │  ├── SEND_MESSAGE / RECEIVE_MESSAGE               │  │
│  │  └── USER_JOINED / USER_DISCONNECTED              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         │
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Collections:                                         │  │
│  │                                                      │  │
│  │  ┌─ users                                           │  │
│  │  │  ├── _id (ObjectId)                             │  │
│  │  │  ├── googleId (String, optional)                │  │
│  │  │  ├── email (String, unique)                     │  │
│  │  │  ├── username (String)                          │  │
│  │  │  ├── password (String, hashed, optional)        │  │
│  │  │  ├── profilePicture (String)                    │  │
│  │  │  ├── createdAt (Date)                           │  │
│  │  │  └── updatedAt (Date)                           │  │
│  │  │                                                  │  │
│  │  └─ projects                                        │  │
│  │     ├── _id (ObjectId)                             │  │
│  │     ├── userId (ObjectId, ref: User)              │  │
│  │     ├── roomId (String)                            │  │
│  │     ├── projectName (String)                       │  │
│  │     ├── description (String)                       │  │
│  │     ├── fileStructure (Mixed JSON)                │  │
│  │     ├── files (Array of file objects)             │  │
│  │     ├── drawingData (Mixed JSON)                  │  │
│  │     ├── createdAt (Date)                           │  │
│  │     ├── updatedAt (Date)                           │  │
│  │     └── Indexes:                                   │  │
│  │         ├── userId (for user projects)             │  │
│  │         └── roomId (for room projects)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ External Services
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼──────┐              ┌──────────▼───┐
   │  Google   │              │  MongoDB     │
   │  OAuth    │              │  Atlas       │
   │  Service  │              │  (Optional)  │
   └───────────┘              └──────────────┘
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ GOOGLE OAUTH AUTHENTICATION FLOW                            │
└─────────────────────────────────────────────────────────────┘

User Browser                    Client                Server
    │                             │                     │
    │─── Click "Sign with Google" ─>                    │
    │<─── Opens Google Login Modal ─│                   │
    │                             │                     │
    │─── Completes Google OAuth ──>                    │
    │<─── Google Returns Token ────│                   │
    │                             │                     │
    │                    POST /api/auth/google-login    │
    │                    {tokenId: token}              │
    │─────────────────────────────>│                   │
    │                             │ Verify with Google  │
    │                             │ OAuth Library       │
    │                             │────────────────────>│
    │                             │                    │
    │                             │<──── Verified ─────│
    │                             │                    │
    │                             │ Check if User      │
    │                             │ Exists in MongoDB  │
    │                             │                    │
    │                             │ Create/Update User │
    │                             │ in MongoDB         │
    │                             │                    │
    │                             │ Generate JWT Token │
    │                             │                    │
    │<────── JWT Token ──────────────────────────────│
    │                             │                    │
    │ Save Token to localStorage  │                   │
    │ Store User Data             │                   │
    │                             │                    │
    │─────── Authenticated ────────>                   │
```

## Project Save/Load Flow

```
┌─────────────────────────────────────────────────────────────┐
│ PROJECT SAVE & LOAD FLOW                                    │
└─────────────────────────────────────────────────────────────┘

User Interface              ProjectManager            Server/DB
         │                       │                         │
         │ Click "Save Project"  │                         │
         │──────────────────────>│                         │
         │                       │ Collect:                │
         │                       │ - fileStructure         │
         │                       │ - files array           │
         │                       │ - drawingData           │
         │                       │                         │
         │                       │ POST /api/projects/save │
         │                       │─────────────────────────>│
         │                       │                         │
         │                       │                  Check JWT
         │                       │                  Verify User
         │                       │                  Save to MongoDB
         │                       │                         │
         │<───── Success Toast ──│<── Return Project ─────│
         │                       │                         │

         │ Click "Download"      │                         │
         │──────────────────────>│                         │
         │                       │ Create ZIP:             │
         │                       │ - files/                │
         │                       │ - file-structure.json   │
         │                       │ - drawing-data.json     │
         │                       │                         │
         │<──── Download ZIP ────│                         │
         │                       │                         │

         │ Click "My Projects"   │                         │
         │──────────────────────>│                         │
         │                       │ GET /api/projects/list  │
         │                       │─────────────────────────>│
         │                       │                         │
         │                       │<──── Projects List ─────│
         │<─ Display Projects ───│                         │
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────┐
│ MONGODB SCHEMA RELATIONSHIPS                                │
└─────────────────────────────────────────────────────────────┘

Users Collection
┌──────────────────────────────┐
│ _id: ObjectId               │
│ googleId: String (unique)   │  ┌─────────────────────────┐
│ email: String (unique)      │  │ One User can have      │
│ username: String            │  │ Many Projects          │
│ password: String (optional) │  │ (1:M relationship)     │
│ profilePicture: String      │──│                         │
│ createdAt: Date             │  │                         │
│ updatedAt: Date             │  │                         │
└──────────────────────────────┘  └─────────────────────────┘
          ▲                                    │
          │                                    │
          │ userId (Reference)                 │
          │                                    ▼
          └──────────────────────────────────────────────
                                  │
                        Projects Collection
                        ┌────────────────────────────────┐
                        │ _id: ObjectId                  │
                        │ userId: ObjectId (ref: Users)  │
                        │ roomId: String                 │
                        │ projectName: String            │
                        │ description: String            │
                        │ fileStructure: Mixed JSON      │
                        │ files: Array                   │
                        │   ├── id: String               │
                        │   ├── name: String             │
                        │   ├── content: String          │
                        │   └── language: String         │
                        │ drawingData: Mixed JSON        │
                        │ createdAt: Date                │
                        │ updatedAt: Date                │
                        └────────────────────────────────┘

Key Queries:
- Find all projects for user: db.projects.find({userId: <userObjectId>})
- Find project by room: db.projects.findOne({roomId: <roomId>})
- Delete user projects: db.projects.deleteMany({userId: <userObjectId>})
```

## Data Flow on Project Save

```
User File Structure (In Memory)
        │
        ├── Root Folder
        │   ├── src/
        │   │   ├── App.tsx
        │   │   ├── main.tsx
        │   │   └── ...
        │   ├── public/
        │   └── package.json
        │
        └── Active Drawing Data (if in drawing mode)

        │ ProjectManager Collects Data
        ▼

ProjectManager State
        │
        ├── projectName: "My Project"
        ├── fileStructure: {JSON representation}
        ├── files: [{id, name, content, language}]
        └── drawingData: {TLDraw snapshot}

        │ Axios POST Request with JWT
        ▼

Server Receives
        │
        ├── Verify JWT Token
        ├── Extract User ID from token
        ├── Validate input data
        └── Check if project exists for user

        │ MongoDB Operation
        ▼

MongoDB Insert/Update
        │
        └── Save to projects collection with userId reference

        │ Response to Client
        ▼

Client UI
        │
        ├── Update local state
        ├── Show success toast
        └── Clear form
```

---

**Last Updated**: December 2024
**Architecture Version**: 1.0
