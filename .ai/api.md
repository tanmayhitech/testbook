# TESTBOOK API

Base:

/api

## Health

GET /api/health

## Authentication

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

GET /api/auth/me

## Repositories

GET /api/repositories

POST /api/repositories

GET /api/repositories/:id

PATCH /api/repositories/:id

DELETE /api/repositories/:id

## Files

GET /api/repositories/:id/files

POST /api/repositories/:id/files

PATCH /api/repositories/:id/files/:fileId

DELETE /api/repositories/:id/files/:fileId

## Branches

GET /api/repositories/:id/branches

POST /api/repositories/:id/branches

DELETE /api/repositories/:id/branches/:branchId

## Pull Requests

GET /api/repositories/:id/pulls

POST /api/repositories/:id/pulls

GET /api/pulls/:id

POST /api/pulls/:id/reviews

POST /api/pulls/:id/merge