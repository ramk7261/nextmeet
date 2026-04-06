# 🚀 NexMeet – Real-Time Video Conferencing App

NexMeet is a full-stack real-time video conferencing application built using the **MERN stack**, **WebRTC**, and **Socket.IO**. It allows users to create and join meeting rooms with live video and audio communication, similar to modern platforms like Zoom and Google Meet.

This project demonstrates real-time communication, peer-to-peer connection, and scalable backend architecture.

---

## 🌐 Live Demo
- 🔗 Frontend: [Live Frontend](https://nextmeet-fronted.vercel.app)  
- 🔗 Backend: [Live Backend](https://nextmeet-ub3v.onrender.com)

## ⚙️ Tech Stack

### 🎨 Frontend
- React.js (Create React App)
- Context API (State Management)
- Axios (API communication)

### ⚙️ Backend
- Node.js
- Express.js
- REST APIs

### 🔄 Real-Time Communication
- Socket.IO (Signaling Server)
- WebRTC (Peer-to-Peer Video/Audio Streaming)

### 🗄️ Database
- MongoDB (Mongoose)

### 🚀 Deployment
- Frontend: Vercel
- Backend: Render

---

## ✨ Features

### 🎥 Video Conferencing
- Real-time video and audio communication
- Peer-to-peer connection using WebRTC
- Low latency streaming

### 🔗 Meeting System
- Create meeting rooms
- Join using room ID
- Multiple participants support

### 💬 Real-Time Signaling
- WebRTC signaling handled via Socket.IO
- Instant connection setup between users

### 🔐 Authentication
- User signup and login system
- Secure authentication flow

### 📜 Meeting History
- Track previously joined meetings
- Store meeting details in database

### 🌍 Deployment Ready
- Fully deployed frontend and backend
- Accessible globally

---

## 🔄 How It Works

1. User creates or joins a meeting room  
2. Socket.IO establishes a signaling connection  
3. WebRTC creates a peer-to-peer connection between users  
4. Media streams (video/audio) are exchanged directly  
5. Real-time communication starts without server streaming  

---

## 📂 Project Structure

NexMeet/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── socket/
│   └── package.json
│
└── README.md

---

## ▶️ How to Run Locally

### 1. Clone the repository

git clone https://github.com/ramk7261/Uber-clone.git

### 2. Install dependencies

Frontend:

cd frontend  
npm install  

Backend:

cd backend  
npm install  

### 3. Run the project

Frontend:

npm start  

Backend:

npm run dev  

---

## 🔧 Environment Variables

### Backend (.env)

PORT=8000  
MONGO_URI=your_mongodb_connection_string  

---

## 🧠 Key Concepts Used

- Real-time communication using WebRTC  
- Socket.IO for signaling  
- REST API design using Express.js  
- Full-stack MERN architecture  
- State management using Context API  
- Asynchronous programming  
- MVC pattern (backend structure)  

---

## 💪 Strengths of the Project

- Real-time communication system implementation  
- Clean separation of frontend and backend  
- Scalable architecture using Socket.IO  
- Hands-on experience with WebRTC  
- Fully deployed production-ready application  
- Strong full-stack project for interviews  

---

## ⚠️ Limitations

- No screen sharing feature  
- Limited scalability for large meetings  
- No chat system (optional enhancement)  
- No recording feature  
- Basic UI (can be improved further)  

---

## 🚀 Future Improvements

- Add screen sharing  
- Add real-time chat feature  
- Add meeting recording  
- Improve UI/UX design  
- Add role-based access (host/admin)  
- Optimize performance for large users  
- Add notifications and scheduling  

---

## 🛠️ Tech Summary

- Frontend: React.js  
- Backend: Node.js, Express.js  
- Real-time: Socket.IO + WebRTC  
- Database: MongoDB  
- Deployment: Vercel + Render  

---

## 📌 Resume Line

Built a real-time video conferencing application using MERN stack, WebRTC, and Socket.IO with features like meeting rooms, peer-to-peer video/audio communication, authentication, and live signaling.

---

## 👨‍💻 Author

Ramgopal Katare

---

## ⭐ Note

This project showcases strong full-stack development skills, real-time system design, and practical implementation of WebRTC-based communication systems.
