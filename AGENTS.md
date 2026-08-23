# TESTBOOK — AI DEVELOPMENT RULES

## PROJECT

Testbook is a beginner-friendly collaborative software development
platform designed primarily for college students.

V1:
Minor Project — 2 months

V2:
Major Project — additional 3 months

Total:
5 months.

---

## CORE PURPOSE

Testbook helps students practice structured software development
workflows.

Core capabilities:

- User authentication
- User profiles
- Repositories
- Files
- Commits
- Version history
- Branches
- Issues
- Pull Requests
- Code review
- Merge
- Role-based access control

---

## DEVELOPMENT PRINCIPLE

Build incrementally.

Never generate the entire application blindly.

Before changing code:

1. Read AGENTS.md.
2. Read relevant .ai documentation.
3. Inspect existing code.
4. Check existing components and services.
5. Check database schema.
6. Check API contracts.
7. Understand the requested feature.
8. Implement the smallest appropriate change.
9. Test it.

---

## TECHNOLOGY

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod

Backend:

- Node.js
- Express
- TypeScript

Database:

- PostgreSQL
- Prisma

---

## ARCHITECTURE

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
PostgreSQL

Do not bypass these layers without a clear reason.

---

## TYPESCRIPT

Use strict TypeScript.

Avoid `any`.

Do not use `as any` merely to silence errors.

Prefer explicit types.

---

## BACKEND

Use:

Routes
↓
Controllers
↓
Services
↓
Prisma

Routes must not contain business logic.

Controllers should remain thin.

Business logic belongs in services.

---

## DATABASE

PostgreSQL is the source of truth.

Prisma manages database access.

Database changes require migrations.

Never create duplicate models.

Never store plain-text passwords.

---

## AUTHORIZATION

Frontend permission checks are NOT security.

The backend must verify:

1. Authentication
2. Resource ownership
3. User permissions

Possible repository roles:

- Owner
- Contributor
- Viewer

---

## SECURITY

Never commit:

- .env
- Passwords
- API keys
- JWT secrets
- Database credentials

Always validate user input.

Never expose sensitive information in API responses.

---

## UI

Testbook visual identity:

- Matte black
- Off-white
- Neutral gray
- Sage green

Avoid excessive:

- Purple
- Blue
- Neon
- Gradients
- Glow effects

The interface should feel:

Professional
Minimal
Technical
Developer-focused

---

## V1 SCOPE

V1 includes:

- Authentication
- Profiles
- Repositories
- Files
- Commits
- Version history
- Branches
- RBAC
- Issues
- Pull Requests
- Code review
- Merge

Do not implement V2 functionality during V1 unless explicitly requested.

---

## V2 SCOPE

V2 may include:

- Beginner Mode
- Advanced Mode
- Conflict resolution
- Notifications
- Real-time updates
- Search
- Stars
- Watches
- Forks
- Projects
- Analytics
- Admin panel
- Online editor
- Optional AI functionality

---

## TWO-DEVELOPER RULE

Developer A:
Frontend / UI

Developer B:
Backend / Database

Both developers must understand the complete architecture.

Avoid modifying the same major feature simultaneously without
coordination.

---

## GIT

Branches:

main
develop
feature/*

Example:

feature/authentication
feature/repositories
feature/files
feature/branches

Never push unfinished work directly to main.

---

## COMMITS

Use:

feat: add repository creation
fix: validate repository name
refactor: simplify auth service
test: add repository tests
docs: update API documentation

Avoid:

update
changes
final
done

---

## NO DUPLICATION

Before creating a:

- Component
- Hook
- Service
- Utility
- API endpoint
- Database model

search the existing project.

Reuse existing functionality.

---

## NO UNNECESSARY REFACTORING

Do not rewrite unrelated systems while implementing a feature.

Make the smallest safe change.

---

## AI RULE

AI-generated code must be reviewed.

After implementation:

- Check TypeScript
- Check lint
- Run tests
- Check API compatibility
- Check database compatibility
- Check authorization
- Check existing functionality

Never assume generated code is correct.

---

## DOCUMENTATION

Architecture change:
.ai/architecture.md

Database change:
.ai/database.md

API change:
.ai/api.md

Project scope change:
.ai/project-context.md

Current task:
.ai/current-task.md

---

## DEFINITION OF DONE

A feature is complete only when:

- Code works
- TypeScript passes
- Tests pass where applicable
- API works
- Database works
- Authorization works
- UI works
- Errors are handled
- Existing functionality still works
- Documentation is updated when necessary

---

## CORE PRINCIPLE

Understand
↓
Plan
↓
Implement
↓
Test
↓
Review
↓
Document
↓
Commit