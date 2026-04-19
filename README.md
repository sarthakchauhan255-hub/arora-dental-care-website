# 🦷 Aurora Dental Care — Full-Stack Management System

> **Healthy Smile, Brighter Tomorrow.**

A production-ready dental clinic website with an admin management system featuring JWT + OTP authentication, appointment booking with slot management, doctor/review CRUD, and a polished medical-luxury UI.

---

## 📁 Project Structure

```
aurora-dental/
├── frontend/          ← React 18 SPA
│   ├── public/
│   └── src/
│       ├── components/    Navbar, Footer, ProtectedRoute
│       ├── context/       AuthContext (JWT state)
│       ├── hooks/         useReveal (scroll animation)
│       ├── pages/         All page components
│       └── utils/         api.js (Axios + interceptors)
├── backend/           ← Node.js + Express REST API
│   ├── config/        database.js (MySQL pool)
│   ├── controllers/   authController, appointmentController, etc.
│   ├── middleware/    auth.js (JWT verify)
│   ├── routes/        index.js (all routes + rate limiting)
│   └── utils/         email.js, otp.js
└── database/
    └── schema.sql     ← Full schema + seed data
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **MySQL** 8.0+
- **npm** or **yarn**
- Gmail account (for Nodemailer OTP emails)

---

### 1. Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run the schema (creates DB, tables, and seeds data)
source /path/to/aurora-dental/database/schema.sql

# Verify
USE aurora_dental;
SHOW TABLES;
SELECT email FROM admin;   -- should show admin@auroradental.com
```

---

### 2. Backend Setup

```bash
cd aurora-dental/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values:
nano .env
```

**Required `.env` values:**
```env
PORT=5000
NODE_ENV=development

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=aurora_dental

# JWT — generate a strong random string
JWT_SECRET=change_this_to_a_64_char_random_string_in_production

# Gmail SMTP (use App Password, not account password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Aurora Dental Care <your_gmail@gmail.com>
ADMIN_EMAIL=admin@auroradental.com

FRONTEND_URL=http://localhost:3000
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail".

```bash
# Start backend
npm run dev
# → API running on http://localhost:5000
# → GET http://localhost:5000/health  (health check)
```

---

### 3. Frontend Setup

```bash
cd aurora-dental/frontend

# Install dependencies
npm install

# Start frontend
npm start
# → App running on http://localhost:3000
```

---

## 🔐 Admin Access

| Field | Value |
|-------|-------|
| URL | `http://localhost:3000/admin/login` |
| Email | `admin@auroradental.com` |
| Password | `Admin@Aurora2024` |
| OTP | Sent to your configured `EMAIL_USER` |

> ⚠️ **Change the admin password immediately after first login via Settings.**

---

## 🌐 Pages

| URL | Description |
|-----|-------------|
| `/` | Home — Hero, Services, Doctors, Stats, Reviews |
| `/services` | Services list with images and pricing |
| `/booking` | Appointment booking with live slot picker |
| `/about` | Clinic info, doctors, map, contact |
| `/admin/login` | Admin login (email + password → OTP) |
| `/admin/forgot-password` | Password reset via OTP |
| `/admin/dashboard` | Stats overview + recent appointments |
| `/admin/appointments` | Filterable appointment table + status updates |
| `/admin/doctors` | Add/Edit/Delete doctors |
| `/admin/reviews` | Approve/Delete patient reviews |
| `/admin/settings` | Update email/password |

---

## 🔌 REST API Endpoints

### Public
```
GET    /health                          Health check
GET    /api/services                    All active services
GET    /api/doctors                     All active doctors
GET    /api/reviews                     Approved reviews
POST   /api/reviews                     Submit review (rate limited)
GET    /api/appointments/slots?date=&doctor_id=   Available time slots
POST   /api/appointments                Book appointment (rate limited)
```

### Auth
```
POST   /api/auth/login                  Step 1: credentials → sends OTP
POST   /api/auth/verify-otp             Step 2: OTP → returns JWT
POST   /api/auth/resend-otp             Resend OTP (60s cooldown)
POST   /api/auth/forgot-password        Request password reset OTP
POST   /api/auth/reset-password         Reset password with OTP
GET    /api/auth/profile        🔒      Get admin profile
PUT    /api/auth/credentials    🔒      Update email/password
```

### Admin (JWT required)
```
GET    /api/appointments         🔒     All appointments (filterable)
PUT    /api/appointments/:id/status 🔒  Update appointment status
GET    /api/appointments/stats   🔒     Dashboard stats
GET    /api/doctors?active=false 🔒     All doctors (incl. inactive)
POST   /api/doctors              🔒     Add doctor
PUT    /api/doctors/:id          🔒     Update doctor
DELETE /api/doctors/:id          🔒     Deactivate doctor
GET    /api/admin/reviews        🔒     All reviews
PUT    /api/admin/reviews/:id/approve 🔒 Approve review
DELETE /api/admin/reviews/:id    🔒     Delete review
```

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcrypt (cost factor 12) |
| Authentication | JWT (8hr expiry) |
| OTP | 6-digit, 5min expiry, max 5 attempts |
| Rate limiting | 10 auth/15min, 5 bookings/hr, 3 reviews/hr |
| OTP resend | 60-second cooldown |
| Input validation | express-validator on all POST routes |
| Race condition prevention | MySQL `FOR UPDATE` row lock on slot booking |
| Unique constraint | DB-level unique on (doctor_id, date, time) |
| CORS | Restricted to FRONTEND_URL |
| Error messages | Generic on auth failures (no user enumeration) |
| Password policy | Min 8 chars: upper, lower, digit, symbol |

---

## 📊 Database Schema

```
admin          → id, name, email, password, otp, otp_expires_at, otp_attempts, last_otp_sent
doctors        → id, name, specialty, bio, image_url, email, phone, experience_years, is_active
services       → id, name, slug, description, short_description, duration_minutes, price_range, is_active, display_order
appointments   → id, patient_name, patient_email, patient_phone, service_id, doctor_id, appointment_date, appointment_time, message, status, confirmation_sent
               → UNIQUE KEY (doctor_id, appointment_date, appointment_time)
reviews        → id, patient_name, patient_email, rating, comment, is_approved
```

---

## 🚢 Production Deployment

### Backend (e.g. Railway, Render, DigitalOcean)
1. Set all `NODE_ENV=production` env vars
2. Use a strong 64-char `JWT_SECRET`
3. Restrict `FRONTEND_URL` to your domain
4. Use a managed MySQL database (PlanetScale, RDS, etc.)

### Frontend (e.g. Vercel, Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. `npm run build` → deploy `build/` folder

---

## 🎨 Brand Identity

| Element | Value |
|---------|-------|
| Clinic Name | Aurora Dental Care |
| Tagline | Healthy Smile, Brighter Tomorrow. |
| Primary Color | `#0284c7` (Sky Blue) |
| Display Font | Playfair Display |
| Body Font | DM Sans |
| Border Radius | Rounded (8–24px) |
| Aesthetic | Medical-luxury, clean, trustworthy |

---

## 🧪 Test Credentials

```
Admin Email:    admin@auroradental.com
Admin Password: Admin@Aurora2024
OTP:            Sent to your EMAIL_USER address
```

---

*Built with ❤️ for Aurora Dental Care — Healthy Smile, Brighter Tomorrow.*
