# Testbook — Collaborative Code Repository & Version Control Platform

> An accessible, web-first collaborative development platform designed for computer science students and academic software teams.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2d3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac.svg)](https://tailwindcss.com/)

---

## 1. Overview

**Testbook** is a lightweight, web-first version-control and repository hosting platform built to help college students master structured software engineering workflows without the steep initial intimidation of complex Git CLI operations.

Testbook provides visual code browsing, an in-browser code editor, branch management, automated commit generation, unified line-by-line diff viewing, task/issue tracking, and pull requests with peer code reviews and 3-way merge conflict detection.

---

## 2. Key Capabilities

- **User Authentication & Profiles**: Secure registration, login, bcrypt password hashing (12 rounds), JWT-based stateless sessions, and contribution statistics.
- **Repository Management**: Public and private repository hosting with strict Role-Based Access Control (`OWNER`, `CONTRIBUTOR`, `VIEWER`).
- **Version Control System**:
  - In-browser code explorer with syntax-aware viewing.
  - Interactive file creation, editing, and deletion with automatic commit generation.
  - Multi-branching support with default branch (`main`) deletion protection.
  - Commit history timeline with parent linkages and unified line diffs (`add`, `delete`, `normal`).
  - 3-Way merge conflict engine: detects overlapping line edits and blocks conflicting pull request merges to prevent code corruption.
- **Academic Collaboration**:
  - Issue tracker with status lifecycle (`OPEN` / `CLOSED`) and discussion replies.
  - Pull request lifecycle with branch comparison, peer review verdicts (`APPROVED`, `CHANGES_REQUESTED`), and conflict-safe merges.
  - Audit activity stream tracking project events.

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (minimalist developer dark theme), React Router v7, TanStack Query v5, Axios.
- **Backend**: Node.js, Express 5, TypeScript, Zod schema validation, Helmet security headers, CORS with credentials.
- **Database**: PostgreSQL (hosted on Supabase) with Prisma ORM and `@prisma/adapter-pg`.
- **Security**: JWT (`jsonwebtoken`), bcrypt password encryption, path traversal root containment, role-based route middleware.

---

## 4. System Architecture

```
[ Client (React 18 SPA) ]
       │ Axios (Bearer JWT)
       ▼
[ API Gateway (Express 5 + Helmet) ]
       │
  Routes → Controllers (Zod Validation) → Services (Business Logic)
       │
   ┌───┴────────────────────────┐
   ▼                            ▼
Prisma ORM (@prisma/adapter-pg)  Storage Disk (/storage/repos/)
   ▼                            ▼
Supabase PostgreSQL (13 Tables)  Source Code Files
```

---

## 5. Getting Started (Local Setup)

### Prerequisites
- Node.js v20.x or v22.x LTS installed.
- npm v10+ installed.
- PostgreSQL database (or free Supabase project).

### 1. Clone the repository
```bash
git clone https://github.com/your-username/testbook.git
cd testbook
```

### 2. Configure Backend Environment
Navigate to `server/`:
```bash
cd server
cp .env.example .env
```
Edit `server/.env` with your Supabase credentials:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-secure-random-256-bit-secret-key"
CLIENT_URL="http://localhost:5173"
```

### 3. Install Backend Dependencies & Run Migrations
```bash
npm install
npm run prisma:generate
npm run build
```

### 4. Configure Frontend Environment
In a separate terminal, navigate to `client/`:
```bash
cd client
cp .env.example .env
```
Ensure `client/.env` points to the local backend:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Install Frontend Dependencies
```bash
npm install
```

### 6. Run the Application

Start the backend:
```bash
# In server/
npm run dev
# Server starts on http://localhost:5000
```

Start the frontend:
```bash
# In client/
npm run dev
# Frontend starts on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 6. Verification & Automated Testing

Testbook includes automated end-to-end integration and security test suites executing against the live database:

```bash
# Run End-to-End Workflow Test (18 test scenarios)
node --env-file=server/.env server/scripts/test-phase2-e2e.js

# Run Comprehensive Security & Concurrency Audit (34 test scenarios)
node --env-file=server/.env server/scripts/test-phase3-audit.js

# Run Frontend Typecheck
npm.cmd --prefix client run typecheck

# Run Frontend Production Build
npm.cmd --prefix client run build
```

---

## 7. Deployment Instructions

### Frontend (Vercel / Netlify)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://[your-backend-api-domain]/api`
- *Note*: Single Page Application routing rewrites are pre-configured in `client/vercel.json` and `client/public/_redirects`.

### Backend (Render / Railway)
- **Root Directory**: `server`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/server.js`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `5000` (or host `$PORT`)
  - `DATABASE_URL`: `postgresql://postgres:...@db...supabase.co:5432/postgres`
  - `JWT_SECRET`: `[secure-random-secret]`
  - `CLIENT_URL`: `https://[your-frontend-vercel-domain]`

---

## 8. College Project Documentation Links

Comprehensive documentation is available in the `docs/` folder:
- [Project Report](docs/PROJECT_REPORT.md) — Complete BCA minor project report with methodology and module specifications.
- [Database Documentation](docs/DATABASE.md) — Entity-Relationship diagram, table schemas, and enumerations.
- [System Design](docs/SYSTEM_DESIGN.md) — Architecture diagrams, use-case models, and DFD Level 0 & 1 diagrams.
- [API Documentation](docs/API_DOCUMENTATION.md) — Complete REST endpoint catalog with request/response examples.
- [Testing Documentation](docs/TESTING.md) — QA strategy and test case matrix.
- [Viva & Presentation Guide](docs/VIVA_PREPARATION.md) — 25 viva questions with answers and live demonstration sequence.

---

## 9. Academic License

Developed as a BCA Minor Project. Distributed under the ISC License.
