# NexMeet — Full Stack Video Conferencing App

A Zoom-style video conferencing app built with React, Node.js, Socket.IO, WebRTC, and MongoDB.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios, MUI  |
| Realtime  | Socket.IO (client + server)             |
| Video     | WebRTC (browser native P2P)             |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB Atlas + Mongoose                |
| Auth      | JWT (jsonwebtoken), bcryptjs            |

---

## Project Structure

```
nexmeet/
├── backend/
│   ├── .env                          ← environment variables
│   ├── package.json
│   ├── config/
│   │   └── db.js                     ← MongoDB connection helper
│   └── src/
│       ├── index.js                  ← main server (Express + Socket.IO)
│       ├── models/
│       │   └── User.js               ← Mongoose user schema
│       ├── controllers/
│       │   └── userController.js     ← register, login, history handlers
│       ├── routes/
│       │   └── userRoutes.js         ← API route definitions
│       └── middlewares/
│           └── auth.middleware.js    ← JWT verification middleware
│
└── frontend/
    ├── .env                          ← REACT_APP_SERVER_URL
    ├── package.json
    └── src/
        ├── App.js                    ← root router
        ├── App.css                   ← complete design system
        ├── environment.js            ← reads server URL from .env
        ├── index.js                  ← React entry point
        ├── contexts/
        │   └── AuthContext.jsx       ← global auth state + API helpers
        ├── pages/
        │   ├── landing.jsx           ← public marketing page
        │   ├── authentication.jsx    ← login / register
        │   ├── home.jsx              ← dashboard (protected)
        │   ├── VideoMeet.jsx         ← video call room (WebRTC)
        │   └── history.jsx           ← meeting history
        ├── utils/
        │   └── withAuth.jsx          ← HOC for protected routes
        └── styles/
            └── videoComponent.module.css
```

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm run dev        # development (nodemon)
# or
npm start          # production
```

Backend runs on: `http://localhost:8000`

### 2. Frontend

```bash
cd frontend
npm install
# Edit .env: REACT_APP_SERVER_URL=http://localhost:8000
npm start
```

Frontend runs on: `http://localhost:3000`

---

## Environment Variables

### backend/.env
```
PORT=8000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/nexmeet
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d
```

### frontend/.env
```
REACT_APP_SERVER_URL=http://localhost:8000
```

---

## API Endpoints

| Method | Route                             | Auth     | Description              |
|--------|-----------------------------------|----------|--------------------------|
| POST   | /api/v1/users/register            | Public   | Create new account       |
| POST   | /api/v1/users/login               | Public   | Login, returns JWT token |
| GET    | /api/v1/users/get_all_activity    | JWT      | Get meeting history      |
| POST   | /api/v1/users/add_to_activity     | JWT      | Save meeting to history  |

Protected routes accept the JWT token in:
- Request body: `{ token: "..." }`
- Query param: `?token=...`

---

## Socket.IO Events

| Event          | Direction        | Description                         |
|----------------|------------------|-------------------------------------|
| join-call      | Client → Server  | Join a meeting room by URL          |
| user-joined    | Server → Client  | Notify all peers of new participant |
| user-left      | Server → Client  | Notify when someone disconnects     |
| signal         | Bidirectional    | WebRTC SDP / ICE signaling          |
| chat-message   | Client → Server  | Send a chat message                 |
| chat-history   | Server → Client  | Receive historical messages on join |

---

## Key Bug Fixes (vs original code)

1. **Duplicate files removed** — merged `user.controller.js` + `userController.js` into one clean controller
2. **Server URL fixed** — `environment.js` now reads from `REACT_APP_SERVER_URL` env var instead of hardcoding a wrong URL
3. **Infinite render loop fixed** — `getPermissions()` now uses `useCallback` with a `ref` guard so it only fires once
4. **JWT payload consistent** — all tokens use `{ userId, username }` and middleware reads `req.user.userId`
5. **withAuth HOC fixed** — returns `null` immediately instead of briefly rendering the protected page
6. **WebRTC updated** — uses `addTrack` / `ontrack` instead of deprecated `addStream` / `onaddstream`
7. **Real user name displayed** — home page reads from `localStorage.user` instead of hardcoding "Rahul Sharma"
