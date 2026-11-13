# Testbook REST API Documentation

Base URL: `http://localhost:5000/api` (Development) / `https://[your-api-domain]/api` (Production)

---

## Standard Response Envelopes

### Success Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Envelope
```json
{
  "success": false,
  "message": "Error description message",
  "errors": [ ... ]
}
```

---

## 1. System Health Checks

### `GET /api/health`
Check if the API server is online.
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Testbook API is running"
}
```

### `GET /api/health/db`
Check connectivity to Supabase PostgreSQL database.
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Database connection is working"
}
```

---

## 2. Authentication

### `POST /api/auth/register`
Register a new developer account.
- **Auth**: None
- **Request Body**:
```json
{
  "username": "student_dev",
  "email": "student@testbook.dev",
  "password": "Password123!"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cm7...",
      "username": "student_dev",
      "email": "student@testbook.dev",
      "avatarUrl": null,
      "bio": null,
      "createdAt": "2026-11-10T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

### `POST /api/auth/login`
Authenticate with email and password.
- **Auth**: None
- **Request Body**:
```json
{
  "email": "student@testbook.dev",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOi..."
  }
}
```

### `GET /api/auth/me`
Inspect current user session from JWT bearer token.
- **Auth**: Required (`Authorization: Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm7...",
      "username": "student_dev",
      "email": "student@testbook.dev",
      "avatarUrl": null,
      "bio": null
    }
  }
}
```

---

## 3. User Profiles & Settings

### `GET /api/users/profile`
Retrieve the current authenticated user's profile with calculated metrics.
- **Auth**: Required
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "cm7...",
    "username": "student_dev",
    "email": "student@testbook.dev",
    "headline": "Full-Stack Developer",
    "skills": ["TypeScript", "React", "Node.js", "PostgreSQL", "Git"],
    "repositoriesCount": 3,
    "contributionsThisYear": 18
  }
}
```

### `PATCH /api/users/profile`
Update user bio or avatar URL.
- **Auth**: Required
- **Request Body**:
```json
{
  "bio": "BCA student building Testbook.",
  "avatarUrl": "https://avatars.githubusercontent.com/u/1"
}
```
- **Response `200 OK`**: Updated profile object.

### `POST /api/users/password`
Change current user password.
- **Auth**: Required
- **Request Body**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```
- **Response `200 OK`**: `{"success": true, "message": "Password updated successfully"}`

---

## 4. Repositories

### `GET /api/repos`
List all repositories accessible to the current user (owned, contributor, or public).
- **Auth**: Required
- **Response `200 OK`**: Array of repository objects with counts and current user role.

### `POST /api/repos`
Create a new code repository.
- **Auth**: Required
- **Request Body**:
```json
{
  "name": "algo-visualizer",
  "description": "Visualizing sorting algorithms in React",
  "visibility": "PUBLIC"
}
```
- **Response `201 Created`**: Returns created repository with `currentUserRole: "OWNER"`.

### `GET /api/repos/:id`
Get repository details by ID.
- **Auth**: Optional (Required if private)
- **Response `200 OK`**: Detailed repository object with branches and member counts.

### `PUT /api/repos/:id`
Update repository metadata. Restricted to `OWNER`.
- **Auth**: Required (`OWNER` only)
- **Request Body**: `{"name": "new-name", "description": "new description", "visibility": "PRIVATE"}`
- **Response `200 OK`**: Updated repository object.

### `DELETE /api/repos/:id`
Delete a repository. Restricted to `OWNER`.
- **Auth**: Required (`OWNER` only)
- **Response `200 OK`**: `{"success": true, "message": "Repository deleted successfully"}`

---

## 5. Collaborators (RBAC)

### `GET /api/repos/:id/members`
List collaborators and their assigned roles.
- **Auth**: Optional (Required if private)

### `POST /api/repos/:id/members`
Add a collaborator or update their role.
- **Auth**: Required (`OWNER` only)
- **Request Body**:
```json
{
  "username": "peer_dev",
  "role": "CONTRIBUTOR"
}
```
- **Response `200 OK`**: Collaborator record.

### `DELETE /api/repos/:id/members/:userId`
Remove a collaborator from the repository.
- **Auth**: Required (`OWNER` or self-removal)

---

## 6. Branches

### `GET /api/repos/:id/branches`
List all branches in the repository with commit counts and default status.
- **Auth**: Optional (Required if private)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cm7...",
      "name": "main",
      "isDefault": true,
      "commitCount": 4,
      "lastCommitSha": "cm7..."
    }
  ]
}
```

### `POST /api/repos/:id/branches`
Create a new branch from a base branch.
- **Auth**: Required (`OWNER` or `CONTRIBUTOR`)
- **Request Body**:
```json
{
  "name": "feature/quick-sort",
  "sourceBranch": "main"
}
```
- **Response `201 Created`**: Created branch record.

### `DELETE /api/repos/:id/branches/:branchName`
Delete a branch (cannot delete `main`).
- **Auth**: Required (`OWNER` or `CONTRIBUTOR`)

---

## 7. Files & In-Browser VCS

### `GET /api/repos/:id/files?branch=main`
List files in a given branch.
- **Auth**: Optional (Required if private)

### `GET /api/repos/:id/files/content?branch=main&path=src/index.ts`
Retrieve raw content of a specific file.
- **Auth**: Optional (Required if private)

### `POST /api/repos/:id/files`
Save and commit a file to a branch.
- **Auth**: Required (`OWNER` or `CONTRIBUTOR`)
- **Request Body**:
```json
{
  "branch": "main",
  "path": "src/App.tsx",
  "content": "export const App = () => <h1>Hello Testbook</h1>;",
  "commitMessage": "feat: add root App component"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "File saved and committed successfully",
  "data": {
    "file": { ... },
    "commit": { ... }
  }
}
```

### `DELETE /api/repos/:id/files`
Delete a file and record a deletion commit.
- **Auth**: Required (`OWNER` or `CONTRIBUTOR`)
- **Request Body**:
```json
{
  "branch": "main",
  "path": "old-file.txt",
  "commitMessage": "chore: remove unused file"
}
```

---

## 8. Commits & Diffs

### `GET /api/repos/:id/commits?branch=main`
List commit log chronologically.
- **Auth**: Optional (Required if private)

### `GET /api/repos/:id/commits/:sha`
Retrieve complete commit details, statistics, and line-by-line diff chunks.
- **Auth**: Optional (Required if private)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "cm7...",
    "sha": "cm7...",
    "message": "feat: add root App component",
    "diffs": [
      {
        "path": "src/App.tsx",
        "changeType": "ADDED",
        "additions": 1,
        "deletions": 0,
        "chunks": [
          { "newLineNumber": 1, "type": "add", "content": "export const App = () => <h1>Hello Testbook</h1>;" }
        ]
      }
    ]
  }
}
```

---

## 9. Issues & Discussions

### `GET /api/repos/:id/issues?status=OPEN`
List repository issues filtered by `ALL`, `OPEN`, or `CLOSED`.
- **Auth**: Optional (Required if private)

### `POST /api/repos/:id/issues`
Open a new issue.
- **Auth**: Required
- **Request Body**:
```json
{
  "title": "Fix navbar alignment on mobile screens",
  "description": "The hamburger menu is overlapping the logo."
}
```

### `PATCH /api/repos/:id/issues/:number/status`
Toggle issue status between `OPEN` and `CLOSED`.
- **Auth**: Required (Author, `OWNER`, or `CONTRIBUTOR`)
- **Request Body**: `{"status": "CLOSED"}`

### `POST /api/repos/:id/issues/:number/comments`
Add a discussion reply on an issue.
- **Auth**: Required
- **Request Body**: `{"content": "Working on this now in feature/nav-fix"}`

---

## 10. Pull Requests & Code Reviews

### `GET /api/repos/:id/pulls?status=OPEN`
List pull requests filtered by status.
- **Auth**: Optional (Required if private)

### `POST /api/repos/:id/pulls`
Create a pull request between two branches.
- **Auth**: Required (`OWNER` or `CONTRIBUTOR`)
- **Request Body**:
```json
{
  "title": "feat: implement responsive navbar",
  "description": "Fixes mobile hamburger toggle and adds animations.",
  "sourceBranch": "feature/navbar",
  "targetBranch": "main"
}
```

### `GET /api/repos/:id/pulls/:number`
Get PR details including diffs, commits, reviews, and conflict status.
- **Auth**: Optional (Required if private)
- **Response `200 OK`**: Includes `hasConflicts: boolean` and `conflictFiles: string[]`.

### `POST /api/repos/:id/pulls/:number/reviews`
Submit a formal peer code review.
- **Auth**: Required (`OWNER` or `CONTRIBUTOR`)
- **Request Body**:
```json
{
  "status": "APPROVED",
  "comment": "Verified on mobile. Looks great!"
}
```

### `POST /api/repos/:id/pulls/:number/comments`
Post a general discussion comment on the PR.
- **Auth**: Required
- **Request Body**: `{"content": "Please verify Tailwind breakpoint styles."}`

### `POST /api/repos/:id/pulls/:number/merge`
Execute conflict-safe merge of proposed changes into target branch.
- **Auth**: Required (`OWNER` or `CONTRIBUTOR`)
- **Error Response `400 Bad Request` (on conflict)**:
```json
{
  "success": false,
  "message": "Cannot merge pull request: Merge conflict detected in 'src/App.tsx'. Resolve conflicts before merging."
}
```
- **Success Response `200 OK`**: Pull request status updated to `MERGED` with target branch synchronized.

---

## 11. Activity Feed

### `GET /api/activities`
Global activity stream for all accessible repositories.
- **Auth**: Optional

### `GET /api/repos/:id/activities`
Repository-scoped activity audit trail.
- **Auth**: Optional (Required if private)
