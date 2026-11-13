# Testbook System Design Documentation

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph Client["Presentation Tier (Browser)"]
        UI["React 18 SPA (Vite + Tailwind)"]
        Router["React Router v7"]
        Query["TanStack Query (Cache / Mutations)"]
        AxiosClient["Axios HTTP Client (Bearer JWT Interceptor)"]
        UI --> Router
        Router --> Query
        Query --> AxiosClient
    end

    subgraph Server["Application Tier (Node.js / Express 5)"]
        ExpressApp["Express API Server (CORS, Helmet)"]
        AuthMid["JWT Auth Middleware"]
        Controllers["Controllers (Zod Request Validation)"]
        Services["Domain Services (Business Logic)"]
        DiffEngine["VCS Engine (Diffs & 3-Way Merge)"]

        AxiosClient -->|"HTTPS / REST API"| ExpressApp
        ExpressApp --> AuthMid
        AuthMid --> Controllers
        Controllers --> Services
        Services --> DiffEngine
    end

    subgraph Data["Persistence & Storage Tier"]
        Prisma["Prisma ORM (@prisma/adapter-pg)"]
        Postgres[("Supabase PostgreSQL DB (13 Tables)")]
        DiskStorage[("Server Storage Disk (/storage/repos/)")]

        Services --> Prisma
        Services --> DiskStorage
        Prisma --> Postgres
    end
```

---

## 2. Use-Case Diagram

```mermaid
flowchart LR
    Student(("Developer / Student"))
    Owner(("Repository Owner"))
    Contributor(("Repository Contributor"))
    Viewer(("Repository Viewer"))

    Student --> Owner
    Student --> Contributor
    Student --> Viewer

    subgraph AuthUseCases["Authentication & Profile"]
        UC1["Register Account"]
        UC2["Login / Authenticate"]
        UC3["Update Profile & Password"]
    end

    subgraph RepoUseCases["Repository Management"]
        UC4["Create Repository"]
        UC5["Manage Collaborators & Roles"]
        UC6["Delete / Configure Repository"]
    end

    subgraph VCSUseCases["Version Control System"]
        UC7["Browse File Tree & Syntax Highlighting"]
        UC8["Edit / Commit Files"]
        UC9["Create / Switch / Delete Branches"]
        UC10["Inspect Commit Diffs"]
    end

    subgraph CollabUseCases["Collaboration & Code Review"]
        UC11["Open & Close Issues"]
        UC12["Comment on Discussions"]
        UC13["Open Pull Request"]
        UC14["Submit Peer Review (Approve/Request Changes)"]
        UC15["Execute Conflict-Safe Merge"]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4

    Owner --> UC5
    Owner --> UC6
    Owner --> UC8
    Owner --> UC9
    Owner --> UC15

    Contributor --> UC7
    Contributor --> UC8
    Contributor --> UC9
    Contributor --> UC10
    Contributor --> UC11
    Contributor --> UC12
    Contributor --> UC13
    Contributor --> UC14
    Contributor --> UC15

    Viewer --> UC7
    Viewer --> UC10
    Viewer --> UC12
```

---

## 3. Data Flow Diagrams (DFD)

### Data Flow Diagram — Level 0 (Context Level)

```mermaid
flowchart TD
    User(["Developer / Student"])
    System["[0.0] Testbook VCS Platform"]
    DB[("Supabase PostgreSQL")]
    Storage[("File Storage Disk")]

    User -->|"User Credentials, Code Changes, Issues, PRs"| System
    System -->|"Auth Tokens, File Content, Diffs, PR Status, Audit Logs"| User

    System -->|"ACID Relational Queries"| DB
    DB -->|"User Data, Metadata, Commit Records"| System

    System -->|"Read/Write Branch File Blobs"| Storage
    Storage -->|"Source Code Files"| System
```

---

### Data Flow Diagram — Level 1 (Detailed Subsystems)

```mermaid
flowchart TD
    User(["User"])

    subgraph Subsystems["Application Subsystems"]
        P1["1.0 Authentication & User Profile"]
        P2["2.0 Repository & RBAC Controller"]
        P3["3.0 Version Control & In-Browser Editor"]
        P4["4.0 Issue Tracking & Discussions"]
        P5["5.0 Pull Requests & Merge Engine"]
        P6["6.0 Activity Audit Logger"]
    end

    DB[("PostgreSQL")]
    Disk[("Local Storage Disk")]

    User -->|"Credentials"| P1
    P1 -->|"JWT Token"| User
    P1 <-->|"Users Table"| DB

    User -->|"Repo CRUD, Roles"| P2
    P2 <-->|"Repositories & Members Tables"| DB
    P2 -->|"Trigger Activity"| P6

    User -->|"File Saves, Branch Ops"| P3
    P3 <-->|"Branches, Commits, Files Tables"| DB
    P3 <-->|"Raw Source Files"| Disk
    P3 -->|"Trigger Commit Activity"| P6

    User -->|"Issue Create, Status, Comments"| P4
    P4 <-->|"Issues, IssueComments Tables"| DB
    P4 -->|"Trigger Issue Activity"| P6

    User -->|"PR Create, Review, Merge"| P5
    P5 <-->|"PullRequests, Reviews Tables"| DB
    P5 <-->|"Read & Merge Branch Files"| Disk
    P5 -->|"Trigger PR Activity"| P6

    P6 -->|"Activities Table"| DB
    P6 -->|"Activity Feed"| User
```

---

## 4. Key Workflows & Flowcharts

### A. Authentication & JWT Validation Flow

```mermaid
flowchart TD
    Start(["User submits login form"]) --> Validate["Validate email & password with Zod"]
    Validate --> CheckInput{"Input valid?"}
    CheckInput -- No --> ErrInput["Return 400 Bad Request with field errors"]
    CheckInput -- Yes --> QueryUser["Query user by email from PostgreSQL"]
    QueryUser --> UserExists{"User exists?"}
    UserExists -- No --> ErrAuth["Return 401: Invalid email or password"]
    UserExists -- Yes --> CompareHash["bcrypt.compare(password, passwordHash)"]
    CompareHash --> PasswordMatches{"Password matches?"}
    PasswordMatches -- No --> ErrAuth
    PasswordMatches -- Yes --> SignJWT["Sign JWT token with userId payload (expires in 7d)"]
    SignJWT --> ReturnSuccess["Return 200 OK with accessToken & user summary"]
    ReturnSuccess --> End(["Client stores token in localStorage"])
```

---

### B. Pull Request 3-Way Merge Conflict Detection & Merge Flow

```mermaid
flowchart TD
    Start(["Contributor clicks 'Merge Pull Request'"]) --> VerifyAuth["Verify user has OWNER or CONTRIBUTOR role"]
    VerifyAuth --> CheckRole{"Authorized?"}
    CheckRole -- No --> RejectAuth["Return 403 Forbidden"]
    CheckRole -- Yes --> LoadPR["Load Pull Request from database"]
    LoadPR --> CheckStatus{"PR is OPEN?"}
    CheckStatus -- No --> RejectStatus["Return 400: Pull request already merged or closed"]
    CheckStatus -- Yes --> CompareFiles["Compare sourceBranch and targetBranch files"]

    CompareFiles --> DetectConflict["Run detectMergeConflict() 3-way analysis"]
    DetectConflict --> HasConflict{"Conflict detected?"}
    HasConflict -- Yes --> RejectConflict["Return 400: Merge conflict detected in conflicting files. Merge blocked!"]

    HasConflict -- No --> CopyFiles["Copy and synchronize updated files into target branch storage"]
    CopyFiles --> Transaction["Execute Prisma Transaction:"]
    Transaction --> Step1["1. Update PR status to MERGED and set mergedAt timestamp"]
    Transaction --> Step2["2. Create formal merge commit on target branch"]
    Transaction --> Step3["3. Create Activity audit record (PULL_REQUEST_MERGED)"]
    Transaction --> CommitTx["Commit transaction"]
    CommitTx --> ReturnSuccess["Return 200 OK with merged PR details"]
    ReturnSuccess --> End(["Target branch updated cleanly without corruption"])
```
