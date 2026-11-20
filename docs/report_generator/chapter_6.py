from docx.shared import Inches, Pt
from styles import (
    NAVY_COLOR, CHARCOAL_COLOR,
    add_h1, add_h2, add_h3, add_p, add_bullet, add_table, add_callout, add_code_block, add_page_break
)

def build_chapter_6(doc):
    # ==========================================
    # CHAPTER 6: DETAILED SYSTEM ANALYSIS
    # ==========================================
    add_h1(doc, "CHAPTER 6: DETAILED SYSTEM ANALYSIS")

    add_h2(doc, "6.1 Data Flow Diagrams (DFDs)")
    add_p(doc,
        "Data Flow Diagrams (DFDs) model the functional decomposition of Testbook, mapping how user input transitions through "
        "authentication gates, validation middleware, business logic controllers, and database persistence layers."
    )

    add_h3(doc, "6.1.1 Level 0 Context Diagram (DFD 0)")
    add_p(doc,
        "The Context Diagram (Level 0) defines the overall system boundary, depicting external entities (Registered Student, Guest User, "
        "and System Administrator) interacting with the unified Testbook Platform."
    )

    add_code_block(doc,
        "  +---------------------+                                   +-----------------------+\n"
        "  |  GUEST / VISITOR    | -- (1) Registration Details ----> |                       |\n"
        "  |  (Unauthenticated)  | <-- (2) JWT Session Token ------- |                       |\n"
        "  +---------------------+                                   |                       |\n"
        "                                                            |                       |\n"
        "  +---------------------+ -- (3) Repo CRUD & Visibility --> |                       |\n"
        "  |                     | -- (4) File Create / Edit / Del ->|       TESTBOOK        |\n"
        "  |  STUDENT DEVELOPER  | -- (5) Branch & Commit Actions -> |       CORE VCS        |\n"
        "  |  (Owner/Contributor | -- (6) Open PR & Peer Reviews --> |       PLATFORM        |\n"
        "  |   /Viewer Roles)    | <-- (7) Diffs, Commits & Status - |                       |\n"
        "  |                     | <-- (8) Real-Time Audit Feed ---- |                       |\n"
        "  +---------------------+                                   |                       |\n"
        "                                                            |                       |\n"
        "  +---------------------+                                   |                       |\n"
        "  | CLOUD INFRASTRUCTURE| <== (9) Relational Queries ====> |                       |\n"
        "  | (Supabase Postgres) | <== (10) Sandboxed File Storage =>|                       |\n"
        "  +---------------------+                                   +-----------------------+",
        title="Figure 6.1: Level 0 Context Data Flow Diagram (DFD 0)"
    )

    add_h3(doc, "6.1.2 Level 1 Process Data Flow Diagram")
    add_p(doc,
        "The Level 1 DFD decomposes the system into six core functional subsystems, mapping inter-process data transformations:"
    )

    add_code_block(doc,
        "  [User Input] ===> (1.0 AUTHENTICATION & SESSION ENGINE) <===> [DB: User]\n"
        "                                | (Issues Bearer JWT)\n"
        "                                v\n"
        "                    (2.0 REPOSITORY & RBAC MANAGER) <=========> [DB: Repository, Member]\n"
        "                                |\n"
        "        +-----------------------+-----------------------+\n"
        "        |                                               |\n"
        "        v                                               v\n"
        "  (3.0 FILE OPERATIONS) <==> [Storage Disk]      (4.0 BRANCH & VCS ENGINE) <==> [DB: Branch]\n"
        "        |                                               |\n"
        "        +-----------------------+-----------------------+\n"
        "                                |\n"
        "                                v\n"
        "                    (5.0 COMMIT & DIFF ENGINE) <==============> [DB: Commit, CommitFile]\n"
        "                                |\n"
        "                                v\n"
        "                    (6.0 PULL REQUEST & MERGE ENGINE) <=======> [DB: PullRequest, Review]\n"
        "                                |\n"
        "                                v\n"
        "                    (7.0 AUDIT & ACTIVITY LOGGER) <===========> [DB: Activity]",
        title="Figure 6.2: Level 1 Process Data Flow Diagram across 6 Core Subsystems"
    )

    add_h3(doc, "6.1.3 Level 2 Detailed Process Data Flow Diagrams")
    add_p(doc,
        "Level 2 DFDs drill down into critical transactional workflows to expose low-level data exchanges:"
    )

    add_p(doc,
        "1. Process 2.1: Repository Creation & Workspace Initialization\n"
        "When a user submits the repository creation form, the request passes through `authMiddleware` to verify the JWT token and "
        "extract `userId`. The `repositoryController` validates the schema (name, description, visibility) via Zod. The `repositoryService` "
        "checks uniqueness against the compound index `[ownerId, name]`. Within a Prisma transaction, the `Repository` record is created, "
        "an `OWNER` membership is assigned to the creator, the default branch `'main'` is created in the `Branch` table, a sandboxed disk "
        "workspace directory `storage/repos/{repoId}/main/` is initialized, and a `REPOSITORY_CREATED` event is logged to the `Activity` table.",
        bold_prefix="• Level 2 Flow A: "
    )

    add_p(doc,
        "2. Process 4.1: Branch Creation & Deletion Safeguard Flow\n"
        "Branch creation requests specify a `name` and optional `sourceBranch` (defaulting to `'main'`). The system verifies the user has "
        "at least `CONTRIBUTOR` permissions. The `branchService` clones existing file references from the source branch to the target branch "
        "directory. Conversely, when a branch deletion request arrives, the `branchService` executes two strict checks: first, if the requested "
        "branch is the default branch (`'main'`), the operation is rejected with HTTP 400 ('Cannot delete default branch'); second, the system "
        "queries the `PullRequest` table for any open pull requests referencing the branch as source or target. If active PRs exist, deletion "
        "is strictly blocked with HTTP 400 ('Cannot delete branch with active pull requests').",
        bold_prefix="• Level 2 Flow B: "
    )

    add_p(doc,
        "3. Process 6.1: Pull Request 3-Way Merge Conflict Evaluation Flow\n"
        "When a pull request is opened, `pullRequestService` identifies all files differing between `sourceBranch` and `targetBranch`. "
        "For each file, the system reads both contents and executes `detectMergeConflict(targetContent, sourceContent, baseContent)`. "
        "If both branches modified the same line regions, `hasConflicts` is set to `true` and conflicting filenames are recorded. "
        "When a user clicks 'Merge', the system re-validates conflict status. If `hasConflicts == true`, the merge attempt is rejected "
        "with HTTP 400. If clean, the merged files are written to the target branch directory, a merge commit is recorded, the PR status is "
        "updated to `MERGED`, and an activity log is written.",
        bold_prefix="• Level 2 Flow C: "
    )

    add_h2(doc, "6.2 Algorithmic Logic & Algorithmic Specifications")
    add_p(doc,
        "The core innovation of Testbook lies in its self-contained version control algorithms, implemented in TypeScript without "
        "external git binary dependencies:"
    )

    add_h3(doc, "6.2.1 Unified Line-by-Line Diff Generation Algorithm")
    add_p(doc,
        "The diff engine (`server/src/utils/diff.ts`) computes the exact line-by-line differences between two versions of a file "
        "using a unified chunking algorithm. It accepts `oldText` and `newText`, returning an array of `DiffChunk` objects with "
        "types `add`, `delete`, or `normal`:"
    )

    add_code_block(doc,
        "ALGORITHM: ComputeUnifiedDiff(path, oldText, newText)\n"
        "INPUT: path (string), oldText (string or null), newText (string or null)\n"
        "OUTPUT: FileDiff { changeType, additions, deletions, chunks }\n"
        "\n"
        "1. IF oldText is NULL THEN\n"
        "     // Entirely new file added\n"
        "     newLines = SplitLines(newText)\n"
        "     chunks = MapToDiffChunks(newLines, type='add')\n"
        "     RETURN { changeType: 'ADDED', additions: Length(newLines), deletions: 0, chunks }\n"
        "2. IF newText is NULL THEN\n"
        "     // File deleted\n"
        "     oldLines = SplitLines(oldText)\n"
        "     chunks = MapToDiffChunks(oldLines, type='delete')\n"
        "     RETURN { changeType: 'DELETED', additions: 0, deletions: Length(oldLines), chunks }\n"
        "3. oldLines = SplitLines(oldText); newLines = SplitLines(newText)\n"
        "   maxLines = Max(Length(oldLines), Length(newLines))\n"
        "   oldIdx = 0; newIdx = 0; chunks = []\n"
        "4. WHILE oldIdx < Length(oldLines) OR newIdx < Length(newLines) DO\n"
        "     IF oldIdx < Length(oldLines) AND newIdx < Length(newLines) THEN\n"
        "       IF oldLines[oldIdx] == newLines[newIdx] THEN\n"
        "         chunks.Append({ oldLine: oldIdx+1, newLine: newIdx+1, type: 'normal', content: oldLines[oldIdx] })\n"
        "         oldIdx++; newIdx++\n"
        "       ELSE\n"
        "         // Detect line modification\n"
        "         chunks.Append({ oldLine: oldIdx+1, type: 'delete', content: oldLines[oldIdx] })\n"
        "         chunks.Append({ newLine: newIdx+1, type: 'add', content: newLines[newIdx] })\n"
        "         deletions++; additions++; oldIdx++; newIdx++\n"
        "       END IF\n"
        "     ELSE IF oldIdx < Length(oldLines) THEN\n"
        "       chunks.Append({ oldLine: oldIdx+1, type: 'delete', content: oldLines[oldIdx] })\n"
        "       deletions++; oldIdx++\n"
        "     ELSE\n"
        "       chunks.Append({ newLine: newIdx+1, type: 'add', content: newLines[newIdx] })\n"
        "       additions++; newIdx++\n"
        "     END IF\n"
        "   END WHILE\n"
        "5. RETURN { path, changeType: 'MODIFIED', additions, deletions, chunks }",
        title="Algorithm 6.1: Unified Line-by-Line Diff Generation"
    )

    add_h3(doc, "6.2.2 Three-Way Merge Conflict Detection Algorithm")
    add_p(doc,
        "To prevent accidental data loss during multi-branch collaboration, Testbook implements a 3-way merge conflict detection engine "
        "comparing target, source, and base contents:"
    )

    add_code_block(doc,
        "ALGORITHM: DetectMergeConflict(targetContent, sourceContent, baseContent)\n"
        "INPUT: targetContent (string), sourceContent (string), baseContent (optional string)\n"
        "OUTPUT: MergeResult { hasConflict: boolean, mergedContent: string, conflictDetails?: string }\n"
        "\n"
        "1. IF targetContent == sourceContent THEN\n"
        "     // Identical branch states: trivial merge\n"
        "     RETURN { hasConflict: false, mergedContent: targetContent }\n"
        "2. IF baseContent is provided THEN\n"
        "     IF targetContent == baseContent AND sourceContent != baseContent THEN\n"
        "       // Target has no changes; fast-forward source changes\n"
        "       RETURN { hasConflict: false, mergedContent: sourceContent }\n"
        "     IF sourceContent == baseContent AND targetContent != baseContent THEN\n"
        "       // Source has no changes; keep existing target\n"
        "       RETURN { hasConflict: false, mergedContent: targetContent }\n"
        "   END IF\n"
        "3. // Both branches modified content from base: line-by-line inspection\n"
        "   targetLines = SplitLines(targetContent); sourceLines = SplitLines(sourceContent)\n"
        "   FOR idx = 0 TO Min(Length(targetLines), Length(sourceLines)) - 1 DO\n"
        "     IF targetLines[idx] != sourceLines[idx] THEN\n"
        "       // Simultaneous divergent edit on same line region!\n"
        "       RETURN {\n"
        "         hasConflict: true,\n"
        "         mergedContent: '',\n"
        "         conflictDetails: 'Collision detected at line ' + (idx + 1)\n"
        "       }\n"
        "     END IF\n"
        "   END FOR\n"
        "4. RETURN { hasConflict: false, mergedContent: sourceContent }",
        title="Algorithm 6.2: Three-Way Merge Conflict Detection Engine"
    )

    add_h3(doc, "6.2.3 Sliding-Window Rate Limiting Algorithm")
    add_p(doc,
        "To protect authentication endpoints against credential stuffing and brute-force attacks, a sliding-window rate limiter "
        "is implemented in `server/src/middleware/rate-limit.middleware.ts`. It maintains an in-memory hash map of client IP records, "
        "automatically expiring windows and sending `Retry-After` headers when the limit (20 requests per window) is exceeded."
    )

    add_h3(doc, "6.2.4 Path Traversal Sandbox Containment Guard")
    add_p(doc,
        "To safeguard the hosting operating system from directory traversal attacks (such as `../../etc/passwd`), `server/src/utils/storage.ts` "
        "normalizes all repository and branch paths. It computes `path.resolve(branchRoot, normalizedPath)` and strictly verifies that "
        "`resolved.startsWith(branchRoot)`. Any escape attempt throws an explicit security exception."
    )

    add_page_break(doc)

    # ==========================================
    # 6.3 DATABASE SCHEMA & DATA DICTIONARY
    # ==========================================
    add_h2(doc, "6.3 Complete Database Schema & Data Dictionary")
    add_p(doc,
        "The Testbook database is managed through Prisma ORM 5 and hosted on PostgreSQL 15. The schema comprises 13 relational models "
        "and 8 enumerations, normalized to Third Normal Form (3NF) to ensure zero data redundancy and full referential integrity."
    )

    add_h3(doc, "6.3.1 Database Enumerations")
    add_bullet(doc, "PUBLIC (Accessible read-only to all authenticated users), PRIVATE (Restricted to repository members).", bold_prefix="• RepositoryVisibility: ")
    add_bullet(doc, "OWNER (Full admin, delete, collaborator rights), CONTRIBUTOR (Read/write, branch, commit, PR), VIEWER (Read-only).", bold_prefix="• MemberRole: ")
    add_bullet(doc, "ACTIVE (Live commit), REVERTED (Soft-reverted historical commit).", bold_prefix="• CommitStatus: ")
    add_bullet(doc, "OPEN (Active issue awaiting resolution), CLOSED (Resolved issue).", bold_prefix="• IssueStatus: ")
    add_bullet(doc, "OPEN (Pending review), APPROVED (Review passed), CHANGES_REQUESTED (Modifications required), MERGED (Integrated), CLOSED (Rejected).", bold_prefix="• PullRequestStatus: ")
    add_bullet(doc, "APPROVED (Approved), CHANGES_REQUESTED (Changes required), COMMENTED (General review notes).", bold_prefix="• ReviewStatus: ")
    add_bullet(doc, "ADDED (New file), MODIFIED (Updated file), DELETED (Removed file).", bold_prefix="• FileChangeType: ")
    add_bullet(doc, "REPOSITORY_CREATED, MEMBER_ADDED, BRANCH_CREATED, COMMIT_CREATED, ISSUE_CREATED, ISSUE_CLOSED, PULL_REQUEST_CREATED, PULL_REQUEST_MERGED, PULL_REQUEST_CLOSED.", bold_prefix="• ActivityType: ")

    add_h3(doc, "6.3.2 Data Dictionary Tables")

    # Table 6.1: User Model
    add_p(doc, "Table 6.1 specifies the `User` table storing registered developers and authentication credentials:")
    u_headers = ["Field Name", "Data Type", "Null?", "Default", "Key / Index", "Description"]
    u_rows = [
        ["id", "String (CUID)", "No", "cuid()", "PK", "Unique collision-resistant user identifier"],
        ["username", "String", "No", "None", "Unique Index", "Unique alphanumeric user handle (e.g. @alina)"],
        ["email", "String", "No", "None", "Unique Index", "User email address used for login authentication"],
        ["passwordHash", "String", "No", "None", "None", "bcrypt salt-and-hash with 12 computational rounds"],
        ["avatarUrl", "String", "Yes", "Null", "None", "Optional URL pointing to user profile avatar image"],
        ["bio", "String", "Yes", "Null", "None", "Optional text bio describing user developer background"],
        ["createdAt", "DateTime", "No", "now()", "None", "Timestamp recording account registration"],
        ["updatedAt", "DateTime", "No", "now()", "None", "Timestamp automatically updated on profile changes"]
    ]
    add_table(doc, u_headers, u_rows, col_widths=[1.2, 1.1, 0.6, 0.9, 1.0, 1.8])

    # Table 6.2: Repository & RepositoryMember Models
    add_p(doc, "Table 6.2 specifies the `Repository` and `RepositoryMember` tables governing workspaces and RBAC memberships:")
    repo_headers = ["Field Name", "Data Type", "Null?", "Default", "Key / Index", "Description"]
    repo_rows = [
        ["id", "String (CUID)", "No", "cuid()", "PK", "Unique repository identifier"],
        ["name", "String", "No", "None", "Compound Unique", "Repository name; unique per owner via @@unique([ownerId, name])"],
        ["description", "String", "Yes", "Null", "None", "Optional repository summary description"],
        ["visibility", "RepositoryVisibility", "No", "PRIVATE", "None", "PUBLIC or PRIVATE access level"],
        ["ownerId", "String", "No", "None", "FK -> User.id", "User ID of repository creator (Cascade delete)"],
        ["createdAt", "DateTime", "No", "now()", "None", "Timestamp of repository initialization"],
        ["updatedAt", "DateTime", "No", "now()", "None", "Timestamp of most recent repository update"],
        ["---", "---", "---", "---", "---", "--- [RepositoryMember Table] ---"],
        ["id", "String (CUID)", "No", "cuid()", "PK", "Unique collaborator membership record ID"],
        ["repositoryId", "String", "No", "None", "FK -> Repo.id", "Repository ID (Cascade delete on repo removal)"],
        ["userId", "String", "No", "None", "FK -> User.id", "Collaborator User ID (Cascade delete on user removal)"],
        ["role", "MemberRole", "No", "CONTRIBUTOR", "None", "Assigned RBAC role: OWNER, CONTRIBUTOR, or VIEWER"],
        ["createdAt", "DateTime", "No", "now()", "Compound Unique", "Membership timestamp; @@unique([repositoryId, userId])"]
    ]
    add_table(doc, repo_headers, repo_rows, col_widths=[1.2, 1.3, 0.6, 1.0, 1.1, 1.4])

    # Table 6.3: Branch, Commit, File, CommitFile
    add_p(doc, "Table 6.3 specifies the version control entities managing branches, commits, and tracked file trees:")
    vcs_headers = ["Field Name", "Data Type", "Null?", "Default", "Key / Index", "Description"]
    vcs_rows = [
        ["Branch.id", "String (CUID)", "No", "cuid()", "PK", "Unique branch record identifier"],
        ["Branch.repositoryId", "String", "No", "None", "FK -> Repo.id", "Parent repository ID (Cascade delete)"],
        ["Branch.name", "String", "No", "None", "Compound Unique", "Branch name (e.g. 'main', 'feature/ui'); @@unique([repoId, name])"],
        ["Branch.createdAt", "DateTime", "No", "now()", "None", "Timestamp of branch initialization"],
        ["Commit.id", "String (CUID)", "No", "cuid()", "PK", "Unique SHA-like commit identifier"],
        ["Commit.repositoryId", "String", "No", "None", "FK -> Repo.id", "Associated repository ID"],
        ["Commit.branchId", "String", "No", "None", "FK -> Branch.id", "Branch on which commit was recorded"],
        ["Commit.authorId", "String", "No", "None", "FK -> User.id", "User ID of commit author"],
        ["Commit.message", "String", "No", "None", "None", "Commit message describing modifications"],
        ["Commit.status", "CommitStatus", "No", "ACTIVE", "None", "ACTIVE or REVERTED status marker"],
        ["File.id", "String (CUID)", "No", "cuid()", "PK", "Unique tracked file record identifier"],
        ["File.repositoryId", "String", "No", "None", "FK -> Repo.id", "Parent repository ID"],
        ["File.path", "String", "No", "None", "Compound Unique", "Relative file path; @@unique([repositoryId, path])"],
        ["File.storagePath", "String", "No", "None", "None", "Internal sandboxed disk storage path"],
        ["File.size", "Int", "No", "0", "None", "File size in bytes"],
        ["CommitFile.id", "String (CUID)", "No", "cuid()", "PK", "Join table record linking Commit and File"],
        ["CommitFile.changeType", "FileChangeType", "No", "None", "None", "ADDED, MODIFIED, or DELETED change marker"]
    ]
    add_table(doc, vcs_headers, vcs_rows, col_widths=[1.4, 1.2, 0.6, 0.8, 1.2, 1.4])

    # Table 6.4: Collaboration & Audit Entities
    add_p(doc, "Table 6.4 specifies collaboration models: Issues, Discussions, Pull Requests, Reviews, and Activity feeds:")
    collab_headers = ["Field Name", "Data Type", "Null?", "Default", "Key / Index", "Description"]
    collab_rows = [
        ["Issue.id", "String (CUID)", "No", "cuid()", "PK", "Unique issue tracking record identifier"],
        ["Issue.repositoryId", "String", "No", "None", "FK -> Repo.id", "Associated repository ID"],
        ["Issue.authorId", "String", "No", "None", "FK -> User.id", "User ID of issue creator"],
        ["Issue.title", "String", "No", "None", "None", "Issue title summary"],
        ["Issue.status", "IssueStatus", "No", "OPEN", "Index", "OPEN or CLOSED resolution state"],
        ["PullRequest.id", "String (CUID)", "No", "cuid()", "PK", "Unique pull request identifier"],
        ["PullRequest.sourceBranchId", "String", "No", "None", "FK -> Branch.id", "Source feature branch containing changes"],
        ["PullRequest.targetBranchId", "String", "No", "None", "FK -> Branch.id", "Target destination branch (typically 'main')"],
        ["PullRequest.status", "PullRequestStatus", "No", "OPEN", "Index", "OPEN, APPROVED, CHANGES_REQUESTED, MERGED, CLOSED"],
        ["PullRequest.mergedAt", "DateTime", "Yes", "Null", "None", "Timestamp when PR was merged into target branch"],
        ["PRReview.id", "String (CUID)", "No", "cuid()", "PK", "Peer review record on pull request"],
        ["PRReview.status", "ReviewStatus", "No", "None", "None", "Verdict: APPROVED, CHANGES_REQUESTED, or COMMENTED"],
        ["Activity.id", "String (CUID)", "No", "cuid()", "PK", "System audit event log record"],
        ["Activity.type", "ActivityType", "No", "None", "None", "Event type enum (e.g. PULL_REQUEST_MERGED)"],
        ["Activity.message", "String", "Yes", "Null", "Index", "Human-readable activity summary for feed"]
    ]
    add_table(doc, collab_headers, collab_rows, col_widths=[1.5, 1.2, 0.6, 0.7, 1.2, 1.4])

    add_h2(doc, "6.4 Entity Relationship Diagram (ERD)")
    add_p(doc,
        "Figure 6.8 illustrates the Entity-Relationship Diagram of the Testbook relational database, highlighting primary keys (PK), "
        "foreign keys (FK), and cardinality mappings (1-to-Many and Many-to-Many via join tables):"
    )

    add_code_block(doc,
        "   +--------------+                 +--------------------+                 +---------------+ \n"
        "   |     USER     | 1 ------------ N|  REPOSITORY_MEMBER |N ------------- 1|   REPOSITORY  | \n"
        "   |--------------|                 |--------------------|                 |---------------| \n"
        "   | PK id        |                 | PK id              |                 | PK id         | \n"
        "   |    username  |                 | FK repositoryId    |                 | FK ownerId    | \n"
        "   |    email     |                 | FK userId          |                 |    name       | \n"
        "   | passwordHash |                 |    role (RBAC)     |                 |    visibility | \n"
        "   +--------------+                 +--------------------+                 +---------------+ \n"
        "         | 1                                                                       | 1       \n"
        "         |                                                                         |         \n"
        "         | N                                                                       | N       \n"
        "   +--------------+        +--------------+        +---------------+       +---------------+ \n"
        "   |    COMMIT    | N --- 1|    BRANCH    | 1 --- N|  PULL_REQUEST | 1 -- N|   ACTIVITY    | \n"
        "   |--------------|        |--------------|        |---------------|       |---------------| \n"
        "   | PK id        |        | PK id        |        | PK id         |       | PK id         | \n"
        "   | FK branchId  |        | FK repoId    |        | FK sourceBrId |       | FK repoId     | \n"
        "   | FK authorId  |        |    name      |        | FK targetBrId |       | FK userId     | \n"
        "   |    message   |        +--------------+        |    status     |       |    type       | \n"
        "   +--------------+                                +---------------+       +---------------+ \n"
        "         | 1                                               | 1                               \n"
        "         |                                                 |                                 \n"
        "         | N                                               | N                               \n"
        "   +--------------+                                +---------------+                         \n"
        "   |  COMMIT_FILE |                                |   PR_REVIEW   |                         \n"
        "   |--------------|                                |---------------|                         \n"
        "   | PK id        |                                | PK id         |                         \n"
        "   | FK commitId  |                                | FK prId       |                         \n"
        "   | FK fileId    |                                | FK reviewerId |                         \n"
        "   | changeType   |                                | status/comment|                         \n"
        "   +--------------+                                +---------------+                         ",
        title="Figure 6.8: Entity Relationship Diagram (ERD) of Testbook Database"
    )

    add_page_break(doc)
