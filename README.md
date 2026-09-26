# Ecommerce Admin System

A complete admin-side ecommerce business management system built with React + Vite frontend and Express backend.

## Stack
- Frontend: React + Vite + CSS
- Backend: Node.js + Express
- Auth: JWT-based admin login
- Database: PostgreSQL-ready Prisma schema with mock fallback for instant startup
- Admin-only web app

## Features
- Admin login and JWT authentication
- Dashboard analytics and KPI cards
- Product management (create, update, delete, stock tracking)
- Order management with status updates
- Customer management
- Sales and revenue reports
- Audit/activities feed
- Settings configuration
- Responsive admin layout

## Project structure
- `client/` — frontend app
- `server/` — backend API
- `server/prisma/` — PostgreSQL schema

## Quick start

### 1. Install backend dependencies
```bash
cd server
npm install
```

### 2. Install frontend dependencies
```bash
cd ../client
npm install
```

### 3. Configure environment
Copy the examples and update values as needed:

```bash
cd server
cp .env.example .env
```

### 4. Run backend
```bash
cd server
npm run dev
```

### 5. Run frontend
Open a second terminal:
```bash
cd client
npm run dev
```

### 6. Open app
Visit:
```text
http://localhost:5173
```

### Default admin login
```text
Email: admin@admin.com
Password: admin123
```

## Notes
- The backend works immediately with built-in mock data if no PostgreSQL database is connected.
- To enable PostgreSQL, set `DATABASE_URL` in `server/.env` and run Prisma migrations:
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

## Optional production deployment
- Frontend: Vercel or Netlify
- Backend: Render, Railway, or VPS
- Database: PostgreSQL on Render/Railway/Aiven

