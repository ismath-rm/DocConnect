# 🩺 DocConnect – Online Doctor Consultation Platform

DocConnect is a fully featured telemedicine platform designed to simplify and modernize patient–doctor interactions.

It provides **real-time chat, video consultations, appointment booking**, and **role-based dashboards** for Patients, Doctors, and Admins.

Built with a scalable and modern tech stack — **React + Django + Redis + WebSockets + ZegoCloud + Razorpay** — DocConnect delivers a smooth, secure, and responsive healthcare experience.

---

# **⭐ Features**

**- 👥 Role-Based Access**
   1. **Patient Dashboard**
      - Book appointments
      - Real-time chat
      - Video consultations
      - Manage bookings & profile

   2. **Doctor Dashboard**
      - Manage availability & schedules
      - Accept or reject appointments
      - Chat & video call with patients

   3. **Admin Panel**
      - Approve doctor registrations
      - Manage users, doctors, notifications
      - Oversee platform operations

**- 💬 Real-Time Communication**
   - WebSocket-powered instant messaging
   - Live chat between patients and doctors
   - Redis as channel layer backend
   - Message timestamps & typing indicators 

**- 🎥 Video Consultation**
   - Powered by ZegoCloud SDK
   - Secure 1-on-1 video session
   - Camera/Mic toggle & disconnect

**- 📅 Advanced Appointment Booking**
   - View doctor availability
   - Book, cancel, or reschedule
   - Doctors set time slots & availability
   - Appointment verification

**- 💳 Secure Payments**
   - Razorpay Integration
   - Verified payment before consultation
   - Backend signature verification 

**- 🔔 Notifications System**
   - Appointment updates
   - Doctor approval status
   - Chat & consultation reminders

---

# **🛠 Tech Stack**

   . **Frontend**: React (Vite), Tailwind CSS, Axios, React Router
   . **Backend**: Django, Django REST Framework, Django Channels
   . **Database**:	PostgreSQL
   . **Real-Time**: Redis
   . **Video Calls**:	ZegoCloud
   . **Payments**:	Razorpay
   . **Auth**: JWT Authentication

---

# **🚀 Getting Started**
## 🔧 Backend Setup (Django)

```bash
# Clone the repo
git clone https://github.com/ismath-rm/DocConnect.git

# Move into the backend directory
cd docconnect/Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Run the development server
python manage.py runserver

```

## 🎨 Frontend Setup (React)

```bash
# Move into the frontend directory
cd docconnect/Frontend

# Install dependencies
npm install

# Start the development server
npm run dev

```

---

# **🔑 Environment Variables**
## Backend .env
Create a .env file in the backend directory with the following variables:

```bash
# ===============================
# DJANGO SETTINGS
# ===============================
SECRET_KEY=your_django_secret_key
DEBUG=True

# ===============================
# DATABASE SETTINGS
# ===============================
DB_NAME=docconnect
DB_USER=postgres
DB_PASSWORD=your_postgres_password


# ===============================
# EMAIL SETTINGS
# ===============================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EMAIL_USE_TLS=True

# ===============================
# PAYMENT - RAZORPAY
# ===============================
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# ===============================
# FRONTEND URL
# ===============================
FRONTEND_URL=http://localhost:5173

# ===============================
# REDIS CONFIG
# ===============================
USE_IN_MEMORY_REDIS=True

```

## Frontend .env
Create a .env file in the frontend directory with the following variables:

```bash

VITE_BASE_URL=http://127.0.0.1:8000/
VITE_WEBSOCKET=ws://127.0.0.1:8000/

```

---

# **📡 API Summary**

The Django + DRF backend provides API endpoints for:

 - User authentication (register, login, logout)
 - Patient & doctor profile management
 - Appointment booking, scheduling & cancellation
 - Admin-side doctor verification & dashboard controls
 - Real-time chat messaging (WebSockets + Channels)
 - Video consultation setup (ZegoCloud integration)
 - Payment processing with Razorpay

---

# **📈 Future Enhancements**

  - Prescription generation (PDF)
  - Doctor analytics dashboard
  - Patient medical history tracking
  - Mobile app (React Native)
  - Email/SMS notifications

---

# **👨‍💻 Author**
Built with dedication by Ismath RM

---

# **⭐ Support**

If you like this project, please give it a ⭐ on GitHub!
