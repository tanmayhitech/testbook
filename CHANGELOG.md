# Changelog

All notable changes to the Testbook project will be documented in this file.

## [v1.1.0] - 2026-11-10

### Added
- **Phase 5: Product Quality, Performance & Professional Improvement**:
  - **In-Browser Pro Code Editor Overhaul** (`client/src/components/repository/CodeExplorer.tsx`):
    - Tab indentation interception (`Tab` inserts 2 spaces; `Shift+Tab` outdents without losing caret position).
    - Synchronized line numbers gutter that scrolls smoothly alongside the code textarea.
    - Dirty / unsaved changes indicator (`Unsaved` badge and pulsing indicator).
    - Floating Find & Replace bar with match counter, next/previous match navigation, single replace, and replace all.
    - Keyboard shortcuts: `Ctrl+S` / `Cmd+S` to commit changes, `Ctrl+F` to toggle find bar, `Esc` to close modal.
    - Direct "Download File" button for single-click file exports.
  - **Repository Documentation & Language Statistics** (`client/src/components/repository/` & `server/src/services/`):
    - GitHub-style README auto-rendering on the root directory view (`MarkdownRenderer.tsx`).
    - Markdown preview toggle (`Preview` vs `Raw Code`) for `.md` files.
    - Automated repository language calculation endpoint (`GET /api/repos/:id/languages`) analyzing file extensions and byte weights.
    - Multi-colored Language Statistics Bar in repository detail header with exact percentages.
  - **Pluggable Storage Architecture & Security** (`server/src/utils/storage.ts`):
    - Implemented `IStorageProvider` interface enabling seamless transitions between `LocalStorageProvider` and `SupabaseStorageProvider`.
    - Strict path traversal defense enforcing root containment checks against directory escape attacks.
  - **VCS Engine Safeguards** (`server/src/services/branch.service.ts`):
    - Branch deletion protection preventing deletion of branches associated with active open pull requests (`OPEN`, `APPROVED`, `CHANGES_REQUESTED`).
  - **API Rate Limiting & Sensitive Endpoint Hardening** (`server/src/middleware/rate-limit.middleware.ts`):
    - Sliding-window in-memory rate limiter with automatic expired entry pruning.
    - Protected `/api/auth/login`, `/api/auth/register`, and `/api/users/password` against brute-force attacks (HTTP 429 with `Retry-After`).
  - **Route-Level Code Splitting & Performance Optimization** (`client/src/routes/AppRoutes.tsx`):
    - Converted all 8 top-level routes to dynamic `React.lazy()` imports with `<Suspense>` fallback.
    - Reduced main bundle from >620 kB to 349 kB, resolving Rollup 500 kB chunk warning.
  - **Dashboard & Accessibility Polish** (`client/src/pages/DashboardPage.tsx`):
    - Recently active repositories spotlight with quick links to code and pull requests.
    - Enhanced empty and filtered search states with quick-clear and onboarding prompts.
    - Accessible modal dialogs with `role="dialog"`, `aria-modal="true"`, and `Escape` key dismissal.
  - **Phase 5 Verification Suite** (`server/scripts/test-phase5-audit.js`):
    - 19 automated tests covering rate limiting, branch deletion guards, language statistics, and pluggable storage (19/19 passed).

## [v1.0.0] - 2026-11-10

### Added
- **Phase 4: Final Deployment, Production Validation & College Submission**:
  - **Graceful Shutdown**: Added clean `SIGTERM`/`SIGINT` listeners to Express server closing HTTP connections and disconnecting Prisma.
  - **Single Page Application (SPA) Routing**: Added `client/vercel.json` and `client/public/_redirects` to ensure direct route navigation and browser refreshes work on Vercel and Netlify.
  - **Path Traversal Protection**: Hardened `getFilePath` in `server/src/utils/storage.ts` with root containment validation to block directory traversal attacks.
  - **Multi-Origin Production CORS**: Configured flexible comma-separated origin parsing via `CLIENT_URL`.
  - **Comprehensive College Project Documentation** (`docs/`):
    - `docs/PROJECT_REPORT.md`: Comprehensive 13-section BCA minor project report.
    - `docs/DATABASE.md`: Full entity-relationship schema documentation with Mermaid ER diagram and table specs.
    - `docs/SYSTEM_DESIGN.md`: System architecture, use-case models, DFD Level 0 & 1, and workflow flowcharts.
    - `docs/API_DOCUMENTATION.md`: Complete REST API endpoint reference with request/response envelopes.
    - `docs/TESTING.md`: 52-case testing matrix and execution logs across all modules.
    - `docs/VIVA_PREPARATION.md`: 16-slide viva structure, 5-7 min demonstration script, tech stack justifications, and 25 viva questions with answers.
    - `README.md`: Modern developer README with quickstart, architecture, and deployment instructions.
  - **Phase 3: Production Readiness & Quality Audit**:
    - **Merge Conflict Engine** (`server/src/utils/diff.ts`): Implemented 3-way merge conflict detection comparing base, source, and target versions.
    - **Merge Conflict Safety Guard** (`server/src/services/pull-request.service.ts`): Pull requests now detect overlapping line edits, compute unified diff chunks, list branch commits, and block merges if conflicts are detected.
    - **Branch Storage Inheritance** (`server/src/services/branch.service.ts`): Creating a branch now clones source files into an isolated branch directory.
    - **Private Repository Activity Authorization** (`server/src/services/activity.service.ts`): Enforced access control on repository-scoped audit streams.
    - **Disabled Mock Fallbacks in Real Sessions**: Updated client services (`auth.service.ts`, `repository.service.ts`, `vcs.service.ts`) so real authenticated sessions propagate actual network and backend errors to React Query instead of masking them with mock data.
    - **Automated Production Audit Suite** (`server/scripts/test-phase3-audit.js`): 34 automated test scenarios covering tokens, RBAC, VCS reliability, merge conflicts, and password security (34/34 passed).
  - **Phase 2: Complete Backend Development & Frontend Integration**:
    - **User Profile & Password Management** (`server/src/services/user.service.ts`): Profile stats aggregation, bio/avatar editing, and bcrypt password verification.
    - **Branch Management API** (`server/src/services/branch.service.ts`): Branch listing, creation, and deletion with default branch (`main`) protection.
    - **File Management & In-Browser Editor API** (`server/src/services/file.service.ts`): File tree navigation, raw content retrieval, file creation/updates with automatic commit generation, and file deletion.
    - **Commit History & Diffs API** (`server/src/services/commit.service.ts`): Branch-filtered commit log and unified line-by-line diff chunks (`add`, `delete`, `normal`).
    - **Issue Tracking & Discussions API** (`server/src/services/issue.service.ts`): Issue creation, open/closed lifecycle, and comment threads.
    - **Pull Requests, Peer Reviews & Merge Engine API** (`server/src/services/pull-request.service.ts`): Pull request creation, reviews (`APPROVED`, `CHANGES_REQUESTED`), comments, and atomic merge execution.
    - **Activity Audit Trail API** (`server/src/services/activity.service.ts`): Global and repo-scoped activity stream.
    - **Automated Integration Test Suite** (`server/scripts/test-phase2-e2e.js`): 18-step end-to-end multi-user workflow test (18/18 passed).
  - **Phase 1: Full Interactive Frontend Platform** (`client/`):
    - React 18 + TypeScript + Vite 6 + Tailwind CSS.
    - Code Explorer, File Viewer, In-Browser Editor, Branch Manager, Commit History, Issues View, Pull Requests View, Profile Page, Settings Page, and Dashboard.
