<h1 align="center">
  MedSync
</h1>

<p align="center">
  Full-stack clinic management platform — appointment scheduling, doctor and patient management, with a complete React frontend.
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img alt="Fastify" src="https://img.shields.io/badge/Fastify-5-000000?style=for-the-badge&logo=fastify&logoColor=white"/>
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
</p>

<p align="center">
  <a href="https://medsync-theta.vercel.app" target="_blank"> Live Demo</a>
  &nbsp;·&nbsp;
  <a href="https://medsync-api-7eqd.onrender.com/docs" target="_blank"> API Docs (Swagger)</a>
</p>

---

## About

**MedSync** is a full-stack clinic management system built with a focus on clean architecture, real-world patterns, and a polished user experience.

The backend follows **Clean Architecture** principles, with a clear separation of responsibilities across layers (Controller → Service → Repository). The frontend delivers a responsive, role-aware interface where patients can browse doctors and schedule appointments, and doctors can manage their consultations.

---

## Demo

Try the live demo — use the quick access buttons on the login screen:

| Role       | Email               | Password |
| ---------- | ------------------- | -------- |
| 👤 Patient | patient@medsync.com | 123456Me |
| 🩺 Doctor  | doctor@medsync.com  | 123456Me |

---

## Features

- **Full authentication** — register, login with JWT, role-based authorization
- **Role-based access control** — PATIENT, DOCTOR, and ADMIN with different permissions
- **Doctor management** — profiles with CRM, specialty, and consultation fee
- **Patient management** — profiles with personal data
- **Appointment scheduling** — with time conflict validation
- **Rate limiting** — brute-force protection via Redis
- **Swagger docs** — interactive API documentation
- **Security** — Helmet, CORS, bcrypt, input validation
- **Email notifications** — powered by Resend
- **Docker support** — containerized local setup
- **Automated tests** — unit and integration tests with Vitest

---

## Tech Stack

### Backend

| Tech                    | Purpose                         |
| ----------------------- | ------------------------------- |
| Node.js 20 + TypeScript | Runtime & type safety           |
| Fastify                 | High-performance HTTP framework |
| Prisma 7                | ORM & database migrations       |
| PostgreSQL (Neon)       | Relational database             |
| Redis (Upstash)         | Rate limiting & caching         |
| Zod                     | Schema validation               |
| JWT + bcrypt            | Auth & password hashing         |
| Resend                  | Transactional emails            |
| Docker                  | Containerization                |
| Render                  | Cloud deployment                |

### Frontend

| Tech                         | Purpose                       |
| ---------------------------- | ----------------------------- |
| React 19 + Vite + TypeScript | UI framework                  |
| React Query                  | Server state & caching        |
| React Hook Form + Zod        | Form validation               |
| Axios                        | HTTP client with interceptors |
| React Router v7              | Client-side routing           |
| Shadcn/ui + Tailwind         | UI components                 |
| Vercel                       | Cloud deployment              |

---

## Architecture

```
src/
├── config/          # Environment, database, redis config
├── modules/         # Feature modules (domain-driven)
│   ├── auth/        # Authentication
│   ├── users/       # Users
│   ├── doctors/     # Doctors
│   ├── patients/    # Patients
│   └── appointments/# Appointments
├── shared/          # Shared code
│   ├── errors/      # Custom error classes
│   ├── middlewares/ # Reusable middlewares (authenticate, authorize)
│   └── types/       # Global TypeScript types
└── infra/           # Infrastructure (cache, queues, workers)
```

Each module follows the **Controller → Service → Repository** pattern:

```
Request → Controller (validates) → Service (business rules) → Repository (database)
```

---

## Running Locally

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

### Backend

```bash
# Clone the repo
git clone https://github.com/gfsiilva/medsync.git
cd medsync

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your values (see section below)

# Start the database
docker compose -f docker/docker-compose.yml up -d

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

API available at `http://localhost:3333`

### Frontend

```bash
git clone https://github.com/gfsiilva/medsync-web.git
cd medsync-web

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:3333" > .env

# Start dev server
npm run dev
```

Frontend available at `http://localhost:5173`

---

## Environment Variables

```env
NODE_ENV=development
PORT=3333

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Auth
JWT_SECRET="generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
JWT_EXPIRES_IN="7d"

# Redis
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"

# Email
RESEND_API_KEY="your_resend_key"
EMAIL_FROM="noreply@yourdomain.com"

# CORS
ALLOWED_ORIGINS="http://localhost:5173"
```

---

## API Reference

| Method | Route                             | Description            | Auth     |
| ------ | --------------------------------- | ---------------------- | -------- |
| POST   | `/api/v1/auth/register`           | Register user          | Public   |
| POST   | `/api/v1/auth/login`              | Login                  | Public   |
| GET    | `/api/v1/users/me`                | Get current user       | Required |
| GET    | `/api/v1/doctors`                 | List doctors           | Public   |
| GET    | `/api/v1/doctors/:id`             | Get doctor profile     | Public   |
| POST   | `/api/v1/doctors/profile`         | Create doctor profile  | DOCTOR   |
| POST   | `/api/v1/patients/profile`        | Create patient profile | PATIENT  |
| POST   | `/api/v1/appointments`            | Schedule appointment   | PATIENT  |
| GET    | `/api/v1/appointments/mine`       | List my appointments   | Required |
| PATCH  | `/api/v1/appointments/:id/status` | Update status          | Required |

Full interactive documentation at `/docs` (Swagger UI).

### Authentication

All protected routes require:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Security

- **Rate Limiting** — 100 req/min globally, 5 attempts/min on login
- **Helmet** — secure HTTP headers
- **CORS** — configurable allowed origins
- **bcrypt** — password hashing with salt rounds 12
- **JWT** — tokens with configurable expiration
- **Zod** — strict validation on all inputs

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Developed by <a href="https://github.com/gfsiilva">Gustavo Silva</a>
  &nbsp;·&nbsp;
  <a href="https://linkedin.com/in/gfsiilva">LinkedIn</a>
</p>
