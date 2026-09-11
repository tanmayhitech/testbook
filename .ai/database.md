# TESTBOOK DATABASE

## Database Technology

PostgreSQL

Provider:

Supabase

ORM:

Prisma

---

# CORE ENTITIES

## User

Stores application users.

Important fields:

- id
- username
- email
- passwordHash
- avatar
- bio
- createdAt
- updatedAt

---

## Repository

Represents a project repository.

Important fields:

- id
- name
- description
- visibility
- ownerId
- createdAt
- updatedAt

---

## RepositoryMember

Connects users with repositories.

Important fields:

- id
- repositoryId
- userId
- role
- createdAt

Roles:

- OWNER
- CONTRIBUTOR
- VIEWER

---

## Branch

Represents a repository branch.

Important fields:

- id
- repositoryId
- name
- createdAt

---

## Commit

Represents a saved version of repository changes.

Important fields:

- id
- repositoryId
- branchId
- authorId
- message
- createdAt

---

## File

Represents a repository file.

Important fields:

- id
- repositoryId
- path
- storagePath
- size
- createdAt
- updatedAt

---

## CommitFile

Connects commits with affected files.

Stores information about:

- Added files
- Modified files
- Deleted files

---

## Issue

Represents a repository issue.

Examples:

- Bug
- Feature request
- Task

---

## IssueComment

Stores discussion related to an issue.

---

## PullRequest

Represents a proposed change from one branch to another.

Important fields:

- id
- repositoryId
- authorId
- sourceBranchId
- targetBranchId
- title
- description
- status
- createdAt
- updatedAt

---

## PullRequestReview

Stores code review decisions.

Possible states:

- APPROVED
- CHANGES_REQUESTED
- COMMENTED

---

## PullRequestComment

Stores discussion attached to a Pull Request.

---

## Activity

Stores important repository activities.

Examples:

- Repository created
- Commit created
- Branch created
- Issue opened
- Pull Request opened
- Pull Request merged

---

# RELATIONSHIPS

User
│
├── Repository ownership
│
├── Repository membership
│
├── Commits
│
├── Issues
│
├── Pull Requests
│
└── Activities

Repository
│
├── Members
├── Files
├── Branches
├── Commits
├── Issues
├── Pull Requests
└── Activities

Branch
│
└── Commits

Pull Request
│
├── Reviews
└── Comments

Issue
│
└── Comments

---

# DATABASE RULES

1. PostgreSQL is the source of truth.
2. Prisma is the ORM.
3. Database changes require Prisma migrations.
4. Foreign keys must be used where appropriate.
5. Important fields must have appropriate indexes.
6. Email and username must be unique.
7. Repository names must be validated.
8. Passwords must never be stored in plain text.
9. Database credentials must never be committed.
10. Do not create duplicate entities.