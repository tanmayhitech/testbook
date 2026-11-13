# Testbook Quality Assurance & Testing Documentation

This document records the testing strategy, test case catalog, execution logs, and verification results for the Testbook platform.

---

## 1. Testing Strategy

The QA pipeline verifies functionality across multiple abstraction tiers:
1. **Static Analysis & Type Integrity**: TypeScript compiler verification (`tsc --noEmit`, `tsc -b`).
2. **Integration Testing**: Automated multi-user scenarios executing against live Supabase PostgreSQL.
3. **Security & Boundary Auditing**: Token invalidation, permission escalation prevention, private repo data isolation, and directory traversal checks.
4. **VCS Reliability & Concurrency**: Simultaneous edits, branch isolation, unified diff chunks, and merge conflict blocking.

---

## 2. Automated Test Suite Results

| Test Suite | File Location | Executed Against | Cases | Passed | Failed |
|---|---|---|---|---|---|
| **Phase 2 Integration** | `server/scripts/test-phase2-e2e.js` | Express 5 + Supabase PostgreSQL | 18 | 18 | 0 |
| **Phase 3/4 Production Audit** | `server/scripts/test-phase3-audit.js` | Express 5 + Supabase PostgreSQL | 34 | 34 | 0 |
| **Total Automated Cases** | — | — | **52** | **52** | **0** |

---

## 3. Comprehensive Test Case Matrix

### Module 1: Authentication & Session Security

| ID | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| `AUTH-01` | Register new user with valid data | Server running, DB connected | `POST /api/auth/register` with valid email, username, and password | User created, password hashed with bcrypt, access token returned | `201 Created`, user object & JWT returned | **PASS** |
| `AUTH-02` | Reject duplicate registration | User with username already exists | `POST /api/auth/register` with duplicate username | Registration rejected with 400 error | `400 Bad Request`, "Username or email already exists" | **PASS** |
| `AUTH-03` | User login with valid credentials | User registered | `POST /api/auth/login` with correct email & password | Login successful, JWT token returned | `200 OK`, signed JWT returned | **PASS** |
| `AUTH-04` | Reject login with invalid password | User registered | `POST /api/auth/login` with wrong password | Authentication rejected with 401 | `401 Unauthorized`, "Invalid email or password" | **PASS** |
| `AUTH-05` | Protected route without token | None | `GET /api/repos` with no `Authorization` header | Request rejected with 401 | `401 Unauthorized`, "Authentication required" | **PASS** |
| `AUTH-06` | Protected route with malformed token | None | `GET /api/repos` with invalid string as token | Request rejected with 401 | `401 Unauthorized`, "Invalid or expired token" | **PASS** |
| `AUTH-07` | Protected route with expired token | Token signed with expired timestamp (`-1s`) | `GET /api/repos` with expired JWT | Request rejected with 401 | `401 Unauthorized`, "Invalid or expired token" | **PASS** |
| `AUTH-08` | Password change with correct current password | Authenticated user | `POST /api/users/password` with valid current & new password | Password hash updated in PostgreSQL | `200 OK`, "Password updated successfully" | **PASS** |
| `AUTH-09` | Reject password change with wrong current password | Authenticated user | `POST /api/users/password` with incorrect current password | Password change rejected | `400 Bad Request`, "Current password is incorrect" | **PASS** |

---

### Module 2: Repository Management & RBAC

| ID | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| `REPO-01` | Create private repository | Authenticated user | `POST /api/repos` with name and `visibility: PRIVATE` | Repository created, owner assigned `OWNER` role, default `main` branch created | `201 Created`, repo ID returned, owner role active | **PASS** |
| `REPO-02` | Restrict private repo metadata from non-members | Private repo created | Outsider calls `GET /api/repos/:id` | Request rejected with access denied error | `400/403/404`, "Access denied: You do not have permission..." | **PASS** |
| `REPO-03` | Restrict private repo files from non-members | Private repo created | Outsider calls `GET /api/repos/:id/files` | File listing rejected | `400/401/403 Access denied` | **PASS** |
| `REPO-04` | Restrict private repo activities from non-members | Private repo created | Outsider calls `GET /api/repos/:id/activities` | Audit trail rejected | `400/401/403 Access denied` | **PASS** |
| `REPO-05` | Add member as CONTRIBUTOR | Repo exists, caller is OWNER | `POST /api/repos/:id/members` with username and role `CONTRIBUTOR` | Member added to `RepositoryMember` table | `200 OK`, member role `CONTRIBUTOR` | **PASS** |
| `REPO-06` | Add member as VIEWER | Repo exists, caller is OWNER | `POST /api/repos/:id/members` with username and role `VIEWER` | Member added with `VIEWER` role | `200 OK`, member role `VIEWER` | **PASS** |
| `REPO-07` | CONTRIBUTOR cannot delete repository | Caller has `CONTRIBUTOR` role | `DELETE /api/repos/:id` | Action rejected; only OWNER can delete | `400/403 Unauthorized: Only OWNER can delete` | **PASS** |
| `REPO-08` | CONTRIBUTOR cannot update repo settings | Caller has `CONTRIBUTOR` role | `PUT /api/repos/:id` with new name | Settings update rejected | `400/403 Unauthorized: Only OWNER can update` | **PASS** |
| `REPO-09` | VIEWER cannot write files | Caller has `VIEWER` role | `POST /api/repos/:id/files` | File write rejected | `400/403 Unauthorized: Only OWNER/CONTRIBUTOR can write` | **PASS** |
| `REPO-10` | VIEWER cannot create branches | Caller has `VIEWER` role | `POST /api/repos/:id/branches` | Branch creation rejected | `400/403 Unauthorized: Only OWNER/CONTRIBUTOR can create` | **PASS** |

---

### Module 3: Version Control & Branch Management

| ID | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| `VCS-01` | Save file and create initial commit | Repo exists | `POST /api/repos/:id/files` on branch `main` with content | File saved to disk, commit created, `CommitFile` linked, activity recorded | `200 OK`, file item and commit object returned | **PASS** |
| `VCS-02` | Fetch file content from branch | File committed | `GET /api/repos/:id/files/content?branch=main&path=config.json` | Correct raw file content returned | `200 OK`, matching file text returned | **PASS** |
| `VCS-03` | Create new branch and inherit files | File committed on `main` | `POST /api/repos/:id/branches` with `sourceBranch: main` | Branch created, storage files cloned into new branch directory | `201 Created`, new branch inherits content | **PASS** |
| `VCS-04` | Prevent deletion of default branch `main` | Repo has `main` branch | `DELETE /api/repos/:id/branches/main` | Deletion rejected | `400 Bad Request`, "Cannot delete default branch 'main'" | **PASS** |
| `VCS-05` | Prevent directory traversal attacks | Caller has write access | `POST /api/repos/:id/files` with path `../../../../etc/passwd` | Path traversal blocked by containment check | `400 Bad Request`, "Path traversal attempt detected" | **PASS** |
| `VCS-06` | Delete file from branch | File exists on branch | `DELETE /api/repos/:id/files` | File deleted from disk, `DELETED` commit recorded | `200 OK`, commit logged | **PASS** |

---

### Module 4: Pull Requests, Code Reviews & Merge Conflicts

| ID | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| `PR-01` | Create pull request between two branches | Source and target branches exist | `POST /api/repos/:id/pulls` with title, source, and target | Pull request created with status `OPEN` | `201 Created`, PR # returned | **PASS** |
| `PR-02` | Detect conflicting simultaneous edits | Same file modified on both branches with divergent content | `GET /api/repos/:id/pulls/:number` | PR inspector flags `hasConflicts: true` and lists conflicting file | `200 OK`, `hasConflicts: true`, conflict files identified | **PASS** |
| `PR-03` | Block merge operation on conflicting PR | PR has merge conflicts | `POST /api/repos/:id/pulls/:number/merge` | Merge operation blocked with informative conflict error | `400 Bad Request`, "Merge conflict detected... Resolve conflicts before merging" | **PASS** |
| `PR-04` | Submit peer code review | PR open, caller is CONTRIBUTOR | `POST /api/repos/:id/pulls/:number/reviews` with status `APPROVED` | Review recorded, PR status updated to `APPROVED` | `201 Created`, review attached | **PASS** |
| `PR-05` | Clean merge of non-conflicting PR | Clean PR created without conflicts | `POST /api/repos/:id/pulls/:number/merge` | Target branch files updated, merge commit created, PR marked `MERGED` | `200 OK`, PR status `MERGED`, target branch synchronized | **PASS** |
| `PR-06` | Target branch content integrity after merge | Clean PR merged | `GET /api/repos/:id/files/content?branch=main&path=CONTRIBUTING.md` | Target branch contains newly merged file | `200 OK`, content verified | **PASS** |

---

### Module 5: Activity Feed & Audit Logging

| ID | Test Scenario | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| `ACT-01` | Automatic activity logging across lifecycle | Actions performed on repo | `GET /api/activities` | Audit trail includes repository created, member added, branch created, commit created, issue opened/closed, PR opened/merged | `200 OK`, complete event stream returned | **PASS** |
