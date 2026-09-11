# TESTBOOK ARCHITECTURE

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod

## Backend

- Node.js
- Express
- TypeScript

## Database

- Supabase PostgreSQL
- Prisma ORM

## Storage

- Supabase Storage

## High-Level Architecture

React
↓
REST API
↓
Express
↓
Controllers
↓
Services
↓
Prisma
↓
Supabase PostgreSQL

Files:

React
↓
Express
↓
Supabase Storage

## Important Rule

The frontend must NOT directly access the database.

The frontend communicates with the Express API.

Express handles:

- Authentication
- Authorization
- Business logic
- Validation
- Repository permissions
- Database operations
- File operations

Prisma handles database access.

Supabase PostgreSQL provides the persistent database.

Supabase Storage provides file storage.

## Authentication

Authentication will initially be handled by our backend.

Passwords will be securely hashed.

JWT-based authentication will be used.

## V1 Storage

Supabase Storage will be used for repository file storage.

## V2

Possible future additions:

- Socket.IO
- Monaco Editor
- Realtime collaboration
- Advanced search
- Analytics
- AI features