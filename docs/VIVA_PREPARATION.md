# Testbook — Final Viva & Presentation Guide
## BCA Minor Project Defense & Evaluation Handbook

---

## 1. 16-Slide Presentation Structure Outline

1. **Title Slide**: Project Name ("Testbook: Collaborative Code Repository & Version Control Platform"), Student Name, Roll Number, Guide Name, Institution.
2. **Introduction & Motivation**: Why code collaboration matters in computer science education.
3. **Problem Statement**: Complexity of existing commercial VCS tools, accidental code overwrites, lack of structured academic code reviews.
4. **Project Objectives**: Visual VCS, in-browser code editing, branch management, automated commit tracking, peer code reviews, merge-conflict safety.
5. **Proposed Solution**: Web-first, lightweight collaborative platform tailored for college students and academic teams.
6. **Technology Stack**: React 18, TypeScript, Tailwind CSS, Express 5, Prisma 7, Supabase PostgreSQL.
7. **System Architecture**: 4-Tier layered model (`React → REST API → Express → Controllers → Services → Prisma → PostgreSQL`).
8. **Database Design (ER Diagram)**: 13 relational tables, 8 enums, foreign keys, and indexes.
9. **Role-Based Access Control (RBAC)**: Permission matrix across `OWNER`, `CONTRIBUTOR`, and `VIEWER`.
10. **Version Control Engine**: How file tracking, disk storage, and commits work without the Git CLI.
11. **Diff Engine & Visualization**: Unified diff calculation algorithm (`add`, `delete`, `normal` chunks).
12. **Pull Requests & Code Reviews**: Peer review workflows with `APPROVED` and `CHANGES_REQUESTED` statuses.
13. **3-Way Merge Conflict Engine**: Detecting overlapping line edits and blocking corrupted merges.
14. **Testing & QA Results**: 100% pass rate across 52 automated end-to-end and security test cases.
15. **Limitations & Future Scope (V2 Major Project)**: Git CLI protocol, cloud blob storage, interactive web conflict resolution.
16. **Conclusion & Viva Defense**: Summary of project outcomes and engineering achievements.

---

## 2. 5–7 Minute Live Demonstration Sequence

### Step 1: User Registration & Authentication (1 minute)
- Open browser at `http://localhost:5173`.
- Register a new account (e.g. `alex_dev`).
- Inspect the generated JWT token in `localStorage` and view the user dashboard.

### Step 2: Repository Creation & RBAC Setup (1 minute)
- Click **"New Repository"**.
- Create a private repository: `sorting-visualizer`.
- Verify the repository auto-initializes with the default `main` branch.
- Navigate to the **Settings** tab and add a collaborator (e.g., `bob_dev`) as a `CONTRIBUTOR`.

### Step 3: In-Browser Code Editing & Commits (1.5 minutes)
- Navigate to the **Code** tab.
- Click **"New File"** and create `src/index.ts` with basic code.
- Provide commit message: `feat: add initial index.ts entrypoint`.
- Commit the file. Inspect the file tree and syntax-highlighted code viewer.
- Switch to the **Commits** tab to show the commit record, SHA, author, and timestamp.

### Step 4: Branching & Feature Development (1 minute)
- Switch to the **Branches** tab.
- Create a new branch: `feature/quick-sort` from `main`.
- Point out that the default branch `main` cannot be deleted (show the disabled delete action).
- Edit `src/index.ts` on `feature/quick-sort` to add sorting functions and commit.

### Step 5: Pull Request, Code Review & Merge (1.5 minutes)
- Navigate to **Pull Requests** and click **"New Pull Request"**.
- Select `feature/quick-sort` as source and `main` as target.
- Point out the unified diff tab highlighting green additions and red deletions.
- Submit a peer review verdict: `APPROVED`.
- Click **"Merge Pull Request"**.
- Show that the target branch `main` is cleanly updated with the new code, the PR status changes to `MERGED`, and the event is recorded on the **Activity** feed.

### Step 6: Merge Conflict Demonstration (1 minute)
- Show a pull request where both branches edited the same line of code.
- Show that the system flags `hasConflicts: true`.
- Attempt to click merge and show the system safety error: `"Merge conflict detected. Resolve conflicts before merging"`.

---

## 3. Technology Selection Justification

### Why PostgreSQL & Supabase?
- **Relational Integrity**: Version control data is inherently relational (Users → Repositories → Branches → Commits → Files). Relational constraints (cascading deletes, unique composite indexes like `[ownerId, name]`) prevent orphaned records.
- **ACID Transactions**: Financial-grade atomicity is critical when committing code (creating a commit, updating files, and logging activity must succeed or fail together).
- **Supabase Cloud Hosting**: Provides managed PostgreSQL with connection pooling without the operational overhead of self-hosting a database server.

### Why Prisma ORM?
- **Type-Safe Database Access**: Prisma auto-generates TypeScript types directly from `schema.prisma`. Any query typo or type mismatch is caught at compile-time.
- **Modern Connection Adapters**: Compatible with `@prisma/adapter-pg` for direct connection pooling and serverless scalability.
- **Declarative Migrations**: Schema updates are tracked as immutable SQL migration files.

### Why React & Vite?
- **Component-Driven SPA**: Version control interfaces require rich, responsive, interactive tab switching (Code Explorer, Editor, Commits, Issues, PRs) without full-page reloads.
- **Vite Performance**: Sub-second Hot Module Replacement (HMR) and optimized Rollup production builds.

### Why Node.js & Express?
- **Non-Blocking I/O**: Efficient handling of concurrent HTTP requests and filesystem read/write operations for file contents and diffs.
- **Unified TypeScript Ecosystem**: Shared TypeScript mental model across frontend and backend.

---

## 4. How the Custom VCS Engine Works

Unlike traditional Git, which relies on a hidden `.git` folder containing C-based blob/tree/commit objects and packfiles:
1. **Repository Files**: Stored on disk under `server/storage/repos/{repositoryId}/{branch}/{path}`.
2. **Branch Workspaces**: Each branch has an isolated storage directory. Creating a branch clones the source branch's filesystem snapshot into the target branch directory.
3. **Commit Snapshots**: When a file is saved:
   - File content is written to disk.
   - A `Commit` row is inserted into PostgreSQL with author ID, message, timestamp, and branch ID.
   - A `CommitFile` entry records whether the file was `ADDED`, `MODIFIED`, or `DELETED`.
   - An `Activity` record is inserted for the repository audit trail.
4. **Diff Engine**: Computes line-by-line differences between two file versions:
   - New lines are tagged as `add` (`+`).
   - Missing lines are tagged as `delete` (`-`).
   - Identical lines are tagged as `normal`.
5. **3-Way Merge Conflict Engine**: When merging `sourceBranch` into `targetBranch`:
   - It compares `targetContent` and `sourceContent` against `baseContent`.
   - If both branches modified the same file on overlapping lines, a conflict is detected and the merge is blocked.
   - If changes are independent, files are cleanly copied into the target branch and a merge commit is recorded.

---

## 5. Difference Between Testbook and Git / GitHub

| Feature | Standard Git / GitHub | Testbook (V1) |
|---|---|---|
| **Primary Interface** | Command-Line Interface (`git commit`, `git push`) + Web UI | Visual, web-first browser interface + REST API |
| **Storage Architecture** | Distributed Content-Addressable DAG (`.git/objects`) | Client-Server Architecture (PostgreSQL metadata + Isolated disk directories) |
| **Networking** | Git Smart HTTP / SSH transfer protocols (packfiles) | Standard REST API over HTTPS with JSON payloads |
| **Target Audience** | Commercial enterprise engineering teams | Students, beginners, and academic collaborative teams |
| **Learning Curve** | High (commands like rebase, reflog, cherry-pick) | Low (intuitive visual tabs, in-browser editor) |
| **Merge Conflicts** | Resolved locally via CLI conflict markers | Detected automatically; corrupted merges blocked by backend |

---

## 6. 25 Viva Questions and Answers

### Architecture & Engineering
**Q1: What architecture pattern does Testbook follow?**  
*Answer:* Testbook follows a 4-tier layered architecture: Presentation Layer (React SPA), API Gateway Layer (Express HTTP server), Application Service Layer (business logic, diff engine, conflict detection), and Persistence Layer (Prisma ORM + PostgreSQL).

**Q2: Why use a layered architecture instead of writing queries directly in route handlers?**  
*Answer:* Separation of concerns. Route handlers should only parse inputs and dispatch responses. Placing business logic in services ensures modularity, testability, reusability, and prevents tight coupling with HTTP protocols.

**Q3: How are passwords stored securely?**  
*Answer:* Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` with 12 computational rounds before being saved to PostgreSQL.

**Q4: How does JWT authentication work in Testbook?**  
*Answer:* Upon successful login, the server signs a JSON Web Token containing the user's ID using a secure 256-bit secret. The client attaches this token as a `Bearer` header in subsequent Axios requests. The Express `authenticate` middleware verifies the token and populates `req.userId`.

**Q5: What happens when a JWT token expires?**  
*Answer:* The backend verification rejects the token with a `401 Unauthorized` status. The frontend Axios response interceptor catches the 401, clears the stored token from `localStorage`, and redirects the user to the login screen.

---

### Database & Prisma ORM
**Q6: Why did you choose PostgreSQL over MongoDB?**  
*Answer:* Version control systems are fundamentally relational. Relationships between users, repositories, branches, commits, files, and pull requests require strict referential integrity, foreign key constraints, and multi-table ACID transactions. NoSQL document stores lack native foreign key enforcement.

**Q7: How does Prisma handle database connection pooling?**  
*Answer:* Testbook configures `@prisma/adapter-pg` with a pooled PostgreSQL client, reusing database connections across HTTP requests to prevent connection exhaustion on Supabase.

**Q8: Explain the `[ownerId, name]` composite unique index on the Repository table.**  
*Answer:* It prevents a single user from creating two repositories with the same name, while allowing two different users to create repositories with identical names (e.g., `alice/algo` and `bob/algo`), mirroring GitHub's namespacing model.

**Q9: What happens in the database when a repository is deleted?**  
*Answer:* The Prisma schema defines `onDelete: Cascade` on repository foreign keys. Deleting a repository automatically removes its branches, commits, files, issues, pull requests, and activity logs cleanly without leaving orphaned records.

**Q10: What is the purpose of the `CommitFile` table?**  
*Answer:* It serves as a join table between `Commit` and `File`, recording the specific mutation type (`ADDED`, `MODIFIED`, or `DELETED`) for each file touched by a commit.

---

### Version Control & Algorithms
**Q11: How does Testbook generate line-by-line diffs?**  
*Answer:* The `computeFileDiff` utility splits the old and new text into lines, iteratively compares them, and generates categorized chunks: `add` (green), `delete` (red), and `normal` (unchanged), along with total addition and deletion statistics.

**Q12: How does merge conflict detection work in Testbook?**  
*Answer:* The `detectMergeConflict` engine performs 3-way analysis comparing the target branch and source branch against the base snapshot. If both branches modified overlapping lines with differing text, the pull request flags `hasConflicts: true` and blocks the merge.

**Q13: How does Testbook prevent directory traversal attacks?**  
*Answer:* In `server/src/utils/storage.ts`, the `getFilePath` function normalizes the input path and resolves it against the branch root directory. If the resolved path does not start with the branch's root directory (e.g. `../../etc/passwd`), an error is thrown, blocking unauthorized access.

**Q14: Why can't a user delete the `main` branch?**  
*Answer:* The `main` branch is designated as the default production branch. Deleting it would orphan repository history. The backend strictly throws an error if any user attempts `DELETE /api/repos/:id/branches/main`.

**Q15: How does Testbook maintain branch isolation?**  
*Answer:* Each branch is mapped to an isolated directory on disk (`storage/repos/{repoId}/{branch}`). Creating a branch copies the parent branch's files into the new branch folder, ensuring subsequent commits on either branch do not overwrite each other.

---

### Collaboration & RBAC
**Q16: Explain the difference between `OWNER`, `CONTRIBUTOR`, and `VIEWER`.**  
*Answer:*
- `OWNER`: Can edit repo settings, add/remove collaborators, delete the repo, and commit/merge.
- `CONTRIBUTOR`: Can create branches, commit files, open issues, review PRs, and merge non-conflicting PRs. Cannot delete the repo or manage members.
- `VIEWER`: Read-only access to code, commits, issues, and PRs. Cannot write files, create branches, or review/merge code.

**Q17: How is authorization enforced on private repositories?**  
*Answer:* On every repository endpoint, the backend checks whether the repository is private. If private, it verifies that the requesting user's ID matches the repository owner or an approved `RepositoryMember`. If neither, a `403 Forbidden` / `401 Unauthorized` status is returned.

**Q18: What is the lifecycle of a Pull Request in Testbook?**  
*Answer:* `OPEN` → Peer Review (`APPROVED` / `CHANGES_REQUESTED`) → Merge execution (`MERGED`) or Closure (`CLOSED`).

**Q19: Can a repository owner merge a pull request with merge conflicts?**  
*Answer:* No. The merge engine automatically runs conflict detection before executing the merge. If conflicts exist, the backend blocks the operation with an informative error, protecting the codebase from corruption.

**Q20: How are activities tracked across the platform?**  
*Answer:* Whenever key domain actions occur (repo creation, member added, commit created, issue opened/closed, PR opened/merged), an `Activity` record is inserted within the same database transaction, ensuring the audit feed is always accurate.

---

### Frontend & Production
**Q21: Why does Testbook use TanStack Query?**  
*Answer:* TanStack Query manages asynchronous server state, automatic caching, background re-fetching, and optimistic mutations. It eliminates the need for manual `useEffect` data fetching and handles loading and error states out of the box.

**Q22: How is Single Page Application (SPA) routing handled in production?**  
*Answer:* In SPAs, direct browser refreshes on routes like `/repositories/123` can cause 404 errors on static hosts. We configured `client/vercel.json` and `client/public/_redirects` to rewrite all route requests back to `/index.html`, allowing React Router to resolve routes on the client.

**Q23: How does Testbook handle mock data in production?**  
*Answer:* Mock data is strictly restricted to explicit demo sessions (`mock_token`). In real authenticated sessions, mock fallbacks are completely disabled, ensuring that genuine network or API errors propagate to the UI alert components.

**Q24: What security headers are implemented on the backend?**  
*Answer:* The Express server implements `helmet()`, which sets HTTP headers including Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and Strict-Transport-Security to protect against XSS and clickjacking attacks.

**Q25: What is the main future enhancement planned for V2 (Major Project)?**  
*Answer:* Migrating local disk storage to cloud-native Supabase Storage / S3 buckets and implementing a custom Git Smart HTTP server protocol so students can optionally clone repositories using standard `git clone` from their terminal.
