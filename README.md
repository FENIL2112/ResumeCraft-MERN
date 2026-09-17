# ResumeCraft — MERN Resume Builder with Admin Panel

BCA Semester 5 final-project starter built with:
- React + Vite frontend
- Node.js + Express backend
- MongoDB-ready data layer with in-memory local sync fallback
- Role-based Admin & User architecture
- Professional dashboard, live resume editor, multi-template gallery, and comprehensive Admin Panel (User Management, Resume Management, Template Control, System Logs)

## Requirements
Node.js 18+ and MongoDB (local or Atlas).

## 🚀 Quick Start (Single Command)
To start **both Backend and Frontend together**, simply open cmd in the project root directory and run:

```bash
npm start
```

This will automatically launch:
- **Backend API Server**: http://localhost:5000
- **Frontend Web Client**: http://localhost:5173

---

## 🔑 Login Credentials

### 1. Administrator Account (Admin Panel)
- **Email**: `admin@resume.com`
- **Password**: `Admin@123`

### 2. User Account (User Panel)
- Click **"Get Started Free"** or **"Create Account"** tab to register with your Name, Email, and Password.
- Then login with your registered credentials to open the User Resume Builder.

---

## Individual Component Run (Optional)
If you wish to run backend and frontend in separate terminals:

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
cd client
npm run dev
```

---

## Features
- **User Dashboard & Blank Resume Editor**: Real-time resume preview, dynamic sections for education/experience/projects, and instant PDF download.
- **Template Library**: Multiple resume styles (Modern, Classic, Minimal, Executive, Creative, Developer).
- **Comprehensive Admin Panel**:
  - **Overview**: Real-time KPI metrics, registered users, total resumes, and system architecture status.
  - **User Management**: Search, filter by role/status, add users, toggle admin/user roles, activate/suspend accounts, delete users.
  - **All Resumes Management**: Search and filter resumes created across the platform with preview and deletion.
  - **Template Manager**: Enable/disable templates dynamically for end users with creation counters.
  - **Audit & System Logs**: Stream of user registrations, resume creations, admin role modifications, and system events.
