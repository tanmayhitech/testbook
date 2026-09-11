# Testbook — Project Status

> GitHub-inspired developer collaboration platform.
> This document tracks the current implementation status, architecture,
> technology stack, and development roadmap.

---

# 1. Project Overview

Testbook is a full-stack GitHub-inspired platform designed to provide:

- User authentication
- Developer profiles
- Repository management
- Repository members and permissions
- Branch management
- Commit history
- File/code browsing
- Issues
- Pull Requests
- Code reviews
- Repository activity
- Developer dashboard
- Collaboration features
- V2 advanced developer features

The goal is to build a professional, production-style application rather
than a simple CRUD college project.

---

# 2. Current Development Status

## Overall Progress

Backend foundation:     ████████████████░░░░ 80%
Authentication:         ██████████████████░░ 90%
Repository system:      ░░░░░░░░░░░░░░░░░░░░ 0%
Git-like system:        ░░░░░░░░░░░░░░░░░░░░ 0%
Issues:                 ░░░░░░░░░░░░░░░░░░░░ 0%
Pull Requests:          ░░░░░░░░░░░░░░░░░░░░ 0%
Frontend:               ░░░░░░░░░░░░░░░░░░░░ 0%
V2 Features:            ░░░░░░░░░░░░░░░░░░░░ 0%

---

# 3. Completed Work

## Project Foundation

- [x] Git repository initialized
- [x] main branch created
- [x] develop branch created
- [x] Server directory created
- [x] Server source structure created
- [x] TypeScript configured
- [x] Environment variables configured
- [x] Project documentation structure created

## Backend

- [x] Node.js backend
- [x] Express server
- [x] TypeScript
- [x] CORS
- [x] Helmet
- [x] dotenv
- [x] Zod validation
- [x] bcrypt password hashing
- [x] JWT authentication foundation

## Database

- [x] Supabase project created
- [x] PostgreSQL connected
- [x] Prisma configured
- [x] Prisma migrations configured
- [x] Prisma Client generated
- [x] PostgreSQL adapter configured
- [x] Database schema created
- [x] Database migration applied
- [x] Database connection tested successfully

## Authentication

- [x] User model
- [x] Registration
- [x] Password hashing
- [x] Login service
- [x] Login controller
- [x] JWT generation
- [x] Authentication middleware
- [x] Protected route foundation
- [x] `/api/auth/me` foundation

---

# 4. Current Working Area

Current module:

AUTHENTICATION

Current stage:

- Login route
- JWT middleware
- Protected `/me` endpoint
- Authentication testing

Next major module:

REPOSITORY SYSTEM

---

# 5. Technology Stack

## Frontend

Planned:

- Angular
- TypeScript
- Tailwind CSS
- Angular Router
- Reactive Forms
- HTTP Client
- Component-based architecture

## Backend

- Node.js
- Express.js
- TypeScript
- Zod
- bcrypt
- JSON Web Tokens
- Helmet
- CORS
- dotenv

## Database

- Supabase
- PostgreSQL
- Prisma ORM
- Prisma Client
- PostgreSQL adapter

## Development

- Git
- GitHub
- npm
- VS Code
- TypeScript compiler
- tsx

## Planned Infrastructure

- Vercel / suitable frontend hosting
- Backend deployment platform
- Supabase PostgreSQL
- Object/file storage for repository files
- Environment-based configuration

---

# 6. Backend Architecture

server/

├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── config/
│   │   └── prisma.ts
│   │
│   ├── controllers/
│   │   └── auth.controller.ts
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts
│   │
│   ├── routes/
│   │   └── auth.routes.ts
│   │
│   ├── services/
│   │   └── auth.service.ts
│   │
│   ├── utils/
│   │   └── jwt.ts
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── prisma.config.ts

---

# 7. Database Models

Current Prisma schema contains:

- User
- Repository
- RepositoryMember
- Branch
- Commit
- File
- CommitFile
- Issue
- IssueComment
- PullRequest
- PullRequestReview
- PullRequestComment
- Activity

---

# 8. Main Product Modules

## Authentication

- Register
- Login
- Logout
- JWT
- Protected routes
- Current user
- Refresh token

## Users

- Profile
- Avatar
- Bio
- Repository list
- Activity
- Developer profile

## Repositories

- Create repository
- Delete repository
- Repository settings
- Public/private visibility
- Repository members
- Permissions
- Repository dashboard

## Code

- File tree
- File viewer
- Branches
- Commits
- Commit details
- File history
- Repository activity

## Issues

- Create issue
- View issue
- Close issue
- Reopen issue
- Comments

## Pull Requests

- Create PR
- Branch comparison
- Reviews
- Comments
- Approve
- Request changes
- Merge
- Close

## Dashboard

- Recent repositories
- Recent activity
- Contributions
- Issues
- Pull Requests
- Notifications

---

# 9. V2 Feature Direction

V2 should focus on making Testbook feel like a serious developer platform rather than
just a GitHub clone.

Potential V2 features:

- Advanced developer dashboard
- Global search
- Repository discovery
- Developer discovery
- Notifications
- Contribution graph
- Advanced repository analytics
- Better code viewer
- Markdown rendering
- Code review improvements
- Collaboration improvements
- Activity feeds
- Repository insights
- Developer statistics
- Advanced permissions
- AI-assisted developer features
- Professional profile pages

V2 features must be implemented only after the core platform is stable.

---

# 10. Development Rules

1. Do not bypass the service/controller architecture.
2. Do not put database queries directly inside routes.
3. Validate external input with Zod.
4. Never store plaintext passwords.
5. Never expose passwordHash through API responses.
6. Never commit `.env`.
7. Never expose JWT secrets.
8. Use TypeScript types properly.
9. Run `npm run typecheck` before committing.
10. Keep API responses consistent.
11. Keep frontend and backend responsibilities separated.
12. Do not introduce new libraries without documenting the reason.
13. Do not build V2 features before the core V1 system is stable.
14. Do not modify the database schema without a Prisma migration.
15. Keep `AGENTS.md` rules synchronized with architectural decisions.

---

# 11. API Convention

Successful response:

{
  "success": true,
  "message": "Description",
  "data": {}
}

Error response:

{
  "success": false,
  "message": "Error description"
}

Validation errors may additionally contain:

{
  "errors": []
}

---

# 12. Development Workflow

For every feature:

1. Define the requirement.
2. Check the Prisma schema.
3. Update schema if necessary.
4. Create migration.
5. Create service.
6. Create controller.
7. Create route.
8. Add middleware if required.
9. Run typecheck.
10. Test API.
11. Update project status.
12. Commit changes.

---

# 13. Current API

## Health

GET

/api/health

Status:

IMPLEMENTED

## Authentication

POST

/api/auth/register

Status:

IMPLEMENTED

POST

/api/auth/login

Status:

IMPLEMENTED

GET

/api/auth/me

Status:

IMPLEMENTED / TESTING

---

# 14. Important Commands

Start backend:

npm run dev

Type check:

npm run typecheck

Generate Prisma Client:

npx prisma generate

Create migration:

npx prisma migrate dev --name <migration-name>

Check migration status:

npx prisma migrate status

Open Prisma Studio:

npx prisma studio

---

# 15. Project Status Update Rule

After completing a meaningful feature:

1. Update this file.
2. Update AGENTS.md if architecture/rules changed.
3. Update CHANGELOG.md.
4. Run typecheck.
5. Commit the changes.

Last updated:

2026-08-23