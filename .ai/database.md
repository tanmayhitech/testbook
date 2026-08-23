# TESTBOOK DATABASE

## Planned Core Entities

User
Repository
RepositoryMember
File
Branch
Commit
CommitFile
Issue
IssueComment
PullRequest
PullRequestReview
PullRequestComment
Activity

## Main Relationship

User
↓
Repository
↓
RepositoryMember

Repository
↓
Branch
↓
Commit

Repository
↓
File

Repository
↓
Issue

Repository
↓
PullRequest
↓
Review

## Rules

- PostgreSQL is the source of truth.
- Prisma manages database access.
- Schema changes require migrations.
- Relationships must be explicit.
- Never duplicate entities.
- Passwords must be securely hashed.