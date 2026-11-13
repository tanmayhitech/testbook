# TESTBOOK FEATURE & PAGE MAP

## Overview
This document maps each Testbook feature module directly to its frontend pages, backend routes, database models, and user navigation actions.

---

## 1. Authentication Module
- **Frontend Pages:**
  - `/login`: Email/Username + Password login
  - `/register`: Username, Email, Password account creation
- **Backend Routes:**
  - `POST /api/auth/register` $\rightarrow$ `auth.controller.ts` $\rightarrow$ `auth.service.ts`
  - `POST /api/auth/login` $\rightarrow$ `auth.controller.ts` $\rightarrow$ `auth.service.ts`
  - `GET /api/auth/me` $\rightarrow$ Token verification & profile fetch
- **Database Models:** `User`

---

## 2. Dashboard & User Profile Module
- **Frontend Pages:**
  - `/dashboard`: User overview, owned repositories, contributed repositories, recent activity stream
  - `/u/:username`: Public user profile, pinned repositories, contributions, bio
  - `/settings`: Profile details, avatar, security settings
- **Backend Routes:**
  - `GET /api/users/:username`
  - `PUT /api/users/me`
  - `GET /api/activities`
- **Database Models:** `User`, `Activity`, `RepositoryMember`

---

## 3. Repository & File System Module
- **Frontend Pages:**
  - `/new`: Create repository form (Name, Description, Public/Private)
  - `/repos/:owner/:repo`: Code viewer, file tree browser, README renderer
  - `/repos/:owner/:repo/blob/:branch/*`: Individual file viewer with line numbering and syntax highlighting
- **Backend Routes:**
  - `POST /api/repos`
  - `GET /api/repos/:owner/:repo`
  - `GET /api/repos/:owner/:repo/tree/:branch`
  - `GET /api/repos/:owner/:repo/files/*`
- **Database Models:** `Repository`, `File`, `CommitFile`, `RepositoryMember`

---

## 4. Version Control & History Module
- **Frontend Pages:**
  - `/repos/:owner/:repo/commits/:branch`: Branch commit timeline
  - `/repos/:owner/:repo/commit/:commitId`: Commit details, diff viewer (added/modified/deleted files)
  - `/repos/:owner/:repo/branches`: Branch list, create branch modal, delete branch
- **Backend Routes:**
  - `GET /api/repos/:owner/:repo/commits`
  - `GET /api/repos/:owner/:repo/commits/:commitId`
  - `GET /api/repos/:owner/:repo/branches`
  - `POST /api/repos/:owner/:repo/branches`
- **Database Models:** `Branch`, `Commit`, `CommitFile`, `File`

---

## 5. Issues Module
- **Frontend Pages:**
  - `/repos/:owner/:repo/issues`: Issue list (Open/Closed filters)
  - `/repos/:owner/:repo/issues/new`: Create issue form
  - `/repos/:owner/:repo/issues/:id`: Issue thread, markdown conversation, status toggle (Close/Reopen)
- **Backend Routes:**
  - `GET /api/repos/:owner/:repo/issues`
  - `POST /api/repos/:owner/:repo/issues`
  - `GET /api/repos/:owner/:repo/issues/:id`
  - `POST /api/repos/:owner/:repo/issues/:id/comments`
  - `PATCH /api/repos/:owner/:repo/issues/:id/status`
- **Database Models:** `Issue`, `IssueComment`, `Activity`

---

## 6. Pull Requests & Code Review Module
- **Frontend Pages:**
  - `/repos/:owner/:repo/pulls`: Pull Request list (Open/Merged/Closed filters)
  - `/repos/:owner/:repo/pulls/new`: Branch comparison view, difference preview, open PR form
  - `/repos/:owner/:repo/pulls/:id`: PR discussion thread, Review status (Approve / Request Changes), File diff viewer, Merge button
- **Backend Routes:**
  - `GET /api/repos/:owner/:repo/pulls`
  - `POST /api/repos/:owner/:repo/pulls`
  - `GET /api/repos/:owner/:repo/pulls/:id`
  - `POST /api/repos/:owner/:repo/pulls/:id/reviews`
  - `POST /api/repos/:owner/:repo/pulls/:id/comments`
  - `POST /api/repos/:owner/:repo/pulls/:id/merge`
- **Database Models:** `PullRequest`, `PullRequestReview`, `PullRequestComment`, `Branch`, `Commit`, `Activity`

---

## 7. Repository Settings & Access Control (RBAC)
- **Frontend Pages:**
  - `/repos/:owner/:repo/settings`: Repository metadata, collaborator permissions (`OWNER`, `CONTRIBUTOR`, `VIEWER`), danger zone (Delete repository)
- **Backend Routes:**
  - `PUT /api/repos/:owner/:repo`
  - `DELETE /api/repos/:owner/:repo`
  - `POST /api/repos/:owner/:repo/members`
  - `DELETE /api/repos/:owner/:repo/members/:userId`
- **Database Models:** `Repository`, `RepositoryMember`, `User`
