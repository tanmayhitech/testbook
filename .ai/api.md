# TESTBOOK API

Base URL:

/api

---

# HEALTH

GET /api/health

Purpose:

Check whether the backend is running.

Response:

{
  "success": true,
  "message": "Testbook API is running"
}

---

# AUTHENTICATION

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

---

# USERS

GET /api/users/:username

PATCH /api/users/me

---

# REPOSITORIES

GET /api/repositories

POST /api/repositories

GET /api/repositories/:id

PATCH /api/repositories/:id

DELETE /api/repositories/:id

---

# FILES

GET /api/repositories/:id/files

POST /api/repositories/:id/files

GET /api/repositories/:id/files/:fileId

PATCH /api/repositories/:id/files/:fileId

DELETE /api/repositories/:id/files/:fileId

---

# BRANCHES

GET /api/repositories/:id/branches

POST /api/repositories/:id/branches

DELETE /api/repositories/:id/branches/:branchId

---

# COMMITS

GET /api/repositories/:id/commits

POST /api/repositories/:id/commits

GET /api/repositories/:id/commits/:commitId

---

# ISSUES

GET /api/repositories/:id/issues

POST /api/repositories/:id/issues

GET /api/issues/:id

PATCH /api/issues/:id

DELETE /api/issues/:id

---

# PULL REQUESTS

GET /api/repositories/:id/pulls

POST /api/repositories/:id/pulls

GET /api/pulls/:id

POST /api/pulls/:id/reviews

POST /api/pulls/:id/merge