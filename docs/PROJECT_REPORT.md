# TESTBOOK: Collaborative Software Development Platform
## BCA Minor Project Final Report

---

### Candidate & Project Information
- **Project Title:** Testbook — A Collaborative Code Repository & Version Control Platform
- **Course:** Bachelor of Computer Applications (BCA)
- **Project Category:** Minor Project (Web Development / Systems Engineering)
- **Primary Domain:** Developer Tools, Version Control Systems, Cloud Applications
- **Target Audience:** College students, beginner developers, educational labs

---

## 1. Abstract

Modern software development relies heavily on version control systems (VCS) and collaborative repository hosting services such as GitHub, GitLab, and Bitbucket. However, commercial platforms are often overwhelmed by steep learning curves, intricate CLI commands, and complex feature sets that intimidate introductory computer science students.

**Testbook** is an accessible, web-first collaborative software development platform engineered specifically for students and academic teams. Testbook combines a clean, modern React Single Page Application (SPA) with a resilient Node.js/Express backend, Supabase-hosted PostgreSQL database, and an integrated version control engine. The system provides core developer workflow capabilities including user authentication, role-based access control (`OWNER`, `CONTRIBUTOR`, `VIEWER`), repository management, branch creation, file edition with commit tracking, unified line-by-line diff generation, issue tracking, and peer code reviews with automated 3-way merge conflict detection.

This report documents the end-to-end design, implementation, testing, and deployment preparation of Testbook as a functional minor project completed within a 2-month development cycle.

---

## 2. Introduction

Collaboration in academic software engineering projects has historically suffered from disorganized file sharing (e.g., zip archives over messaging apps) or mismanaged Git repositories where students inadvertently delete work or encounter unresolved merge conflicts.

Testbook bridges this gap by presenting a beginner-friendly visual interface backed by structured developer workflows:
- Visual repository explorer with file trees and syntax-aware viewing.
- In-browser code editing with automatic commit creation and message recording.
- Branch management with default branch (`main`) deletion protection.
- Unified diff viewer highlighting additions, deletions, and unchanged lines.
- Issue tracking and discussion threads for bug tracking and requirements.
- Pull request lifecycle with peer review approvals, comments, and automated merge execution.
- Automated 3-way merge conflict detection preventing corrupt branch overwrites.

---

## 3. Problem Statement

Beginner software developers and collegiate teams face several obstacles when adopting existing VCS tools:
1. **Command-Line Intimidation**: Complex Git commands (`git rebase`, `git cherry-pick`, detached HEAD states) often lead to accidental data loss.
2. **Lack of Structured Academic Workflows**: Students frequently skip branches and pull requests, making peer code reviews impossible.
3. **Complex Permission Models**: Commercial tools have complex organization management that is poorly suited for student peer projects.
4. **Poor Visibility into Code Changes**: Without simple visual diff tools, students struggle to understand how two versions of code diverge.

---

## 4. Objectives

The primary objectives of the Testbook project are:
1. To develop a full-stack, responsive web application for managing source code repositories.
2. To implement a custom version-control engine supporting branches, commits, unified diffs, and merge conflict detection.
3. To enforce rigorous Role-Based Access Control (`OWNER`, `CONTRIBUTOR`, `VIEWER`) across private and public repositories.
4. To provide a collaborative environment with issues, discussion comments, peer code reviews, and audit activity feeds.
5. To architect the application using clean, maintainable, layered principles (`React → REST API → Express → Controllers → Services → Prisma → PostgreSQL`).

---

## 5. Scope

### In Scope (V1 — Minor Project)
- User registration, login, and profile management with bcrypt password hashing and JWT sessions.
- Repository creation, metadata editing, deletion, and public/private visibility toggles.
- Branch listing, creation, and deletion with default branch (`main`) protection.
- In-browser file creation, editing, deletion, and content retrieval with automated commit generation.
- Commit history browsing with parent linkage and unified diff generation.
- Issue creation, status toggles (`OPEN` / `CLOSED`), and discussion threads.
- Pull request workflow with branch comparison, peer reviews (`APPROVED` / `CHANGES_REQUESTED`), and conflict-safe merge execution.
- Activity feed tracking user and repository events.
- Zero client mock fallback in production sessions to ensure genuine API errors are reported.

### Out of Scope (Planned for V2 Major Project)
- Git CLI protocol over SSH/HTTPS (`git clone`, `git push`).
- Automated CI/CD build pipelines and test runners.
- Conflict resolution interactive web UI.
- S3/Blob cloud object storage for multi-server horizontal scaling.
- Organization teams and real-time WebSocket chat.

---

## 6. System Requirements

### Hardware Requirements
- **Development Workstation**: Intel Core i5 or AMD Ryzen 5, 8 GB RAM, 10 GB free disk space.
- **Server Deployment**: 512 MB RAM, 1 vCPU (compatible with Render, Railway, or AWS EC2 t3.micro).

### Software Requirements
- **Operating System**: Windows 10/11, macOS, or Linux.
- **Runtime Environment**: Node.js v20.x or v22.x LTS.
- **Database Engine**: PostgreSQL 15+ (hosted on Supabase).
- **Package Manager**: npm v10+.
- **Web Browser**: Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.

---

## 7. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | ^18.3.1 | Component-based interactive user interface |
| **Frontend Language** | TypeScript | ^5.6.2 | Strict type safety and compilation |
| **Build Tool** | Vite | ^6.0.0 | High-performance bundling and HMR |
| **Styling** | Tailwind CSS | ^3.4.17 | Minimalist developer dark theme (matte black, sage green) |
| **Routing** | React Router | ^7.1.3 | Client-side Single Page Application routing |
| **Server State** | TanStack Query | ^5.66.0 | Async data fetching, caching, and mutation management |
| **HTTP Client** | Axios | ^1.7.9 | Centralized REST API communication and JWT interceptors |
| **Backend Framework** | Express | ^5.2.1 | HTTP routing, middleware, and controller dispatch |
| **Backend Language** | TypeScript | ^5.8.0 | Server-side type safety |
| **Database ORM** | Prisma | ^7.9.1 | Database schema migrations, queries, and transactions |
| **Database Driver** | `@prisma/adapter-pg` | ^7.9.1 | Direct PostgreSQL connection pooling adapter |
| **Database Host** | Supabase PostgreSQL | 15.x | Cloud-hosted relational database |
| **Authentication** | JWT (`jsonwebtoken`) | ^9.0.3 | Stateless token-based user sessions |
| **Password Security** | `bcrypt` | ^6.0.0 | Cryptographic salt-and-hash with 12 rounds |
| **Validation** | Zod | ^3.24.2 / ^4.4.3 | Runtime schema validation for requests and forms |

---

## 8. System Architecture

Testbook implements a strict 4-tier layered architecture:

```
[ Client Browser ]
       │
  React + Vite (Tailwind UI)
       │ Axios (Bearer JWT)
       ▼
[ REST API Gateway ]
       │
  Express 5 App (Helmet, CORS, JSON Parser)
       ▼
[ Application Layer ]
  Routes → Controllers → Services (Business Logic)
       ▼
[ Data Layer ]
  Prisma Client + @prisma/adapter-pg
       ▼
[ Database & Storage ]
  Supabase PostgreSQL (13 Tables) + Server Storage Disk
```

### Layer Responsibilities
1. **Presentation Layer (React)**: Renders UI components, manages local state, executes queries via TanStack Query, and attaches Bearer tokens via Axios interceptors.
2. **API & Route Layer (Express)**: Manages HTTP methods, route mapping, and middleware execution (authentication and error handling).
3. **Controller Layer**: Parses request parameters, validates input bodies using Zod schemas, delegates business operations to services, and formats JSON responses.
4. **Service Layer**: Houses all domain business logic: password hashing, role checks, branch duplication, file versioning, diff calculations, 3-way merge conflict detection, and activity auditing.
5. **Persistence Layer (Prisma + PostgreSQL)**: Executes parameterized relational SQL queries inside transactions to guarantee ACID compliance.

---

## 9. Module Descriptions

### 1. Authentication & Session Module
- **Registration**: Validates uniqueness of email and username; hashes password using bcrypt with 12 salt rounds; creates database record.
- **Login**: Compares supplied password against stored bcrypt hash; generates signed JWT token with user ID payload.
- **Token Middleware**: Verifies token validity and expiration on protected routes; injects `req.userId` into Express request.
- **Profile & Password**: Allows bio and avatar customization; requires verification of existing password before updating credentials.

### 2. Repository & Access Control (RBAC) Module
- **CRUD Operations**: Enforces repository uniqueness per owner (`[ownerId, name]`); manages public/private access.
- **Permission Hierarchy**:
  - `OWNER`: Full administrative control, collaborator management, repository deletion, metadata updates.
  - `CONTRIBUTOR`: Read/write files, create branches, open/comment on issues, submit pull requests, perform code reviews, merge non-conflicting pull requests.
  - `VIEWER`: Read-only access to code, commits, and discussions; all write actions blocked.

### 3. Version Control System (VCS) Module
- **Branch Management**: Creates isolated branch workspaces; ensures default branch (`main`) cannot be deleted.
- **File Management**: Stores file contents on disk; prevents path traversal vulnerabilities using absolute root containment checks.
- **Commit History**: Records commit author, message, timestamp, and affected files; links to parent commit SHA.
- **Unified Diff Engine**: Computes line-level additions, deletions, and unchanged chunks for any two versions of a file.
- **3-Way Merge Conflict Engine**: Compares target and source files against base content. If overlapping line modifications exist, conflicts are flagged and merge operations are blocked.

### 4. Collaboration Module
- **Issues & Discussions**: Supports task and bug tracking with status toggles (`OPEN` / `CLOSED`) and timestamped comment threads.
- **Pull Requests**: Visual comparison between source and target branches; displays commit lists and unified file diffs.
- **Code Reviews**: Allows contributors to review pull requests with verdicts (`APPROVED`, `CHANGES_REQUESTED`, `COMMENTED`) and constructive review notes.
- **Merge Engine**: Performs safe merges of non-conflicting files, writes merged contents to the target branch, creates a formal merge commit, and logs an activity event.
- **Activity Audit Trail**: Automatically logs repository creation, collaborator additions, branch creation, commits, issues, and pull request milestones.

---

## 10. Testing & Quality Assurance

### Testing Methodology
The application underwent a rigorous 3-tier testing strategy:
1. **Static Analysis & Typechecking**: Strict TypeScript compilation (`tsc --noEmit` and `tsc -b`) on both client and server with zero errors and zero `any` assertions.
2. **End-to-End Integration Testing**: An automated 18-step integration test script (`test-phase2-e2e.js`) executing a multi-user developer workflow against live Supabase PostgreSQL.
3. **Comprehensive Security & Production Audit**: An automated 34-step test suite (`test-phase3-audit.js`) verifying JWT expiration, invalid token rejection, RBAC permission guards, private repo isolation, directory traversal prevention, and merge conflict blocking.

### Test Summary
- **Phase 2 Integration Test Suite**: 18 / 18 Tests Passed (100%).
- **Phase 3 Production Audit Suite**: 34 / 34 Tests Passed (100%).
- **Total Automated Test Assertions**: 52 / 52 Passed.

---

## 11. Limitations & Future Scope

### Known Limitations (V1 Minor Project)
1. **Git CLI Compatibility**: Testbook currently operates exclusively through its web UI and REST API. It does not provide a Git SSH/HTTP smart transfer protocol for `git clone` or `git push`.
2. **Ephemeral Disk Storage on Serverless Hosts**: The V1 engine stores file contents in `server/storage/repos/`. On free container hosts with ephemeral filesystems (e.g., standard Render free tier without persistent disk), container restarts wipe local storage files, though PostgreSQL metadata remains intact.
3. **In-Browser Interactive Conflict Resolution**: When a merge conflict is detected, the merge is safely blocked and conflicting files are reported; however, an in-browser 3-way visual resolution tool is reserved for V2.

### Future Scope (V2 Major Project)
- Integration with Supabase Storage / AWS S3 for cloud-native file blob storage.
- Custom Git Smart HTTP transfer protocol to enable standard Git CLI support.
- Real-time collaborative code editor using WebSockets and Operational Transformation / CRDTs.
- Interactive side-by-side merge conflict resolution UI.
- Integrated AI coding assistant for code explanations, automated code reviews, and documentation generation.

---

## 12. Conclusion

Testbook successfully accomplishes all objectives defined for the BCA minor project. The system provides an intuitive, robust, and visually clean developer platform that simplifies version control concepts for students while enforcing industry-standard software engineering practices. Through strict TypeScript implementation, layered architecture, parameterized Prisma queries, and comprehensive automated testing, Testbook demonstrates production readiness and serves as an exemplary academic project.

---

## 13. References

1. Chacon, S., & Straub, B. (2014). *Pro Git*. Apress.
2. Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
3. React Documentation: https://react.dev/
4. Express.js API Reference: https://expressjs.com/
5. Prisma ORM Documentation: https://www.prisma.io/docs/
6. Supabase Documentation: https://supabase.com/docs
7. OWASP Top Ten Web Application Security Risks: https://owasp.org/www-project-top-ten/
