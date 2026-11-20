from docx.shared import Inches, Pt
from styles import (
    NAVY_COLOR, CHARCOAL_COLOR,
    add_h1, add_h2, add_h3, add_p, add_bullet, add_table, add_callout, add_code_block, add_page_break
)

def build_chapters_9_to_13(doc):
    # ==========================================
    # CHAPTER 9: SYSTEM SECURITY MEASURES
    # ==========================================
    add_h1(doc, "CHAPTER 9: SYSTEM SECURITY MEASURES")

    add_h2(doc, "9.1 Stateless JWT Authentication & Verification")
    add_p(doc,
        "Testbook employs JSON Web Tokens (JWT) for stateless authentication. Upon successful authentication via `POST /api/auth/login` "
        "or `POST /api/auth/register`, the server signs a cryptographic token containing the subject (`userId`) using the HMAC SHA-256 algorithm "
        "and a high-entropy secret (`JWT_SECRET`). Tokens are configured with a standard expiration window. Client requests supply this token "
        "in the HTTP `Authorization: Bearer <token>` header. The `authMiddleware` validates token integrity and rejects expired, altered, "
        "or missing tokens with HTTP 401 Unauthorized."
    )

    add_h2(doc, "9.2 Cryptographic bcrypt Salt-and-Hash")
    add_p(doc,
        "In strict adherence to OWASP Password Storage Guidelines, plaintext passwords are never logged, transmitted in responses, or stored "
        "in the database. Testbook utilizes the `bcrypt` cryptographic hashing library with a work factor of 12 salt rounds. Each password "
        "hash incorporates a unique 128-bit random salt, rendering the database impervious to pre-computed rainbow table attacks."
    )

    add_h2(doc, "9.3 Role-Based Access Control (RBAC Hierarchy)")
    add_p(doc,
        "Authorization boundaries are strictly enforced on the server. Table 9.1 delineates the capability matrix across roles:"
    )

    rbac_headers = ["Action / Operation", "OWNER", "CONTRIBUTOR", "VIEWER", "Outsider (Non-Member)"]
    rbac_rows = [
        ["Read Public Repository Code & Diffs", "Allowed", "Allowed", "Allowed", "Allowed"],
        ["Read Private Repository Code & Diffs", "Allowed", "Allowed", "Allowed", "BLOCKED (HTTP 403)"],
        ["Create / Edit / Delete Files", "Allowed", "Allowed", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)"],
        ["Create Branches", "Allowed", "Allowed", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)"],
        ["Delete Feature Branches", "Allowed", "Allowed", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)"],
        ["Delete Default Branch ('main')", "BLOCKED (HTTP 400)", "BLOCKED (HTTP 400)", "BLOCKED (HTTP 400)", "BLOCKED (HTTP 400)"],
        ["Open Issues & Submit Comments", "Allowed", "Allowed", "Allowed", "BLOCKED (Private Repo)"],
        ["Submit Pull Requests & Peer Reviews", "Allowed", "Allowed", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)"],
        ["Merge Clean Pull Requests", "Allowed", "Allowed", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)"],
        ["Merge Conflicting Pull Requests", "BLOCKED (HTTP 400)", "BLOCKED (HTTP 400)", "BLOCKED (HTTP 400)", "BLOCKED (HTTP 400)"],
        ["Manage Collaborators (Add/Remove)", "Allowed", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)"],
        ["Update Repository Metadata / Delete Repo", "Allowed", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)", "BLOCKED (HTTP 403)"]
    ]
    add_table(doc, rbac_headers, rbac_rows, col_widths=[2.4, 1.0, 1.2, 1.3, 1.3])

    add_h2(doc, "9.4 Sliding-Window Rate Limiting Defense")
    add_p(doc,
        "To mitigate denial-of-service (DoS) and brute-force credential stuffing, authentication endpoints are protected by an in-memory "
        "sliding-window rate limiter. If a client IP exceeds 20 requests within a 15-minute window, subsequent requests are intercepted "
        "with HTTP 429 Too Many Requests, accompanied by a `Retry-After` header indicating the required cooldown in seconds."
    )

    add_h2(doc, "9.5 Storage Sandboxing & Path Traversal Mitigation")
    add_p(doc,
        "Repository storage directories are completely isolated under `server/storage/repos/{repoId}/{branch}/`. Path sanitization "
        "replaces dangerous special characters, normalizes directory separators, resolves canonical absolute paths, and asserts that "
        "`resolvedPath.startsWith(branchRoot)`. If an attacker attempts to inject `../../`, the operation is aborted with an explicit "
        "path traversal security exception."
    )

    add_h2(doc, "9.6 Injection Defenses: Prisma SQL & React XSS")
    add_bullet(doc, "All database queries utilize Prisma ORM 5, which prepares and executes parameterized SQL statements natively. User input is treated strictly as data, neutralizing SQL injection vectors.", bold_prefix="• SQL Injection Prevention: ")
    add_bullet(doc, "The React JSX compiler automatically escapes values before rendering to the DOM. User documentation rendered via `MarkdownRenderer` is sanitized through `DOMPurify` to neutralize script injections.", bold_prefix="• Cross-Site Scripting (XSS) Prevention: ")

    add_h2(doc, "9.7 Helmet HTTP Security Headers & CORS Policy")
    add_p(doc,
        "The Express gateway integrates `helmet` middleware, automatically applying security headers: Content-Security-Policy (CSP), "
        "X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN (clickjacking defense), and Strict-Transport-Security (HSTS). "
        "Cross-Origin Resource Sharing (CORS) is restricted to designated frontend origins."
    )

    add_page_break(doc)

    # ==========================================
    # CHAPTER 10: IMPLEMENTATION & MAINTENANCE
    # ==========================================
    add_h1(doc, "CHAPTER 10: IMPLEMENTATION, EVALUATION & MAINTENANCE")

    add_h2(doc, "10.1 Implementation Methodology & Milestones")
    add_p(doc,
        "Testbook was developed following an Agile incremental lifecycle over an 8-week timeframe. Bi-weekly review milestones ensured "
        "continuous alignment with requirements:"
    )
    add_bullet(doc, "Literature review, problem domain analysis, preliminary survey, technology stack finalization, Prisma schema design.", bold_prefix="• Phase 1 (Weeks 1–2): ")
    add_bullet(doc, "Express API foundation, JWT authentication, bcrypt password security, repository CRUD, and RBAC authorization middleware.", bold_prefix="• Phase 2 (Weeks 3–4): ")
    add_bullet(doc, "File sandboxed storage, branch management, default branch deletion guards, commit SHA creation, and unified line diffing.", bold_prefix="• Phase 3 (Weeks 5–6): ")
    add_bullet(doc, "Pull request lifecycle, peer review approval states, 3-way merge conflict detection engine, and moving infrastructure ticker.", bold_prefix="• Phase 4 (Week 7): ")
    add_bullet(doc, "Automated test execution (71 tests across 3 suites), dual-theme engine polish, security audit verification, and report compilation.", bold_prefix="• Phase 5 (Week 8): ")

    add_h2(doc, "10.2 Evaluation Against Primary & Educational Objectives")
    add_p(doc,
        "The implemented system was evaluated against the initial objectives formulated in Chapter 2. All 15 Primary Technical Objectives "
        "and all 10 Educational Learning Objectives were achieved with 100% completion, verified through working software demonstration "
        "and automated test passes."
    )

    add_h2(doc, "10.3 Cloud Deployment Architecture")
    add_p(doc,
        "Testbook is engineered for cloud-native deployment across resilient hosting providers:"
    )
    add_bullet(doc, "Built using Vite into static HTML/JS/CSS assets and deployed on Vercel's global Edge CDN, ensuring sub-50ms asset delivery.", bold_prefix="• Frontend Single Page Application: ")
    add_bullet(doc, "Compiled TypeScript server running Node.js 20 LTS hosted on Render/Railway container instances with automatic HTTPS.", bold_prefix="• Backend REST API Gateway: ")
    add_bullet(doc, "Hosted on Supabase Managed PostgreSQL with automatic daily backups, connection pooling, and multi-AZ failover.", bold_prefix="• Relational Database: ")

    add_h2(doc, "10.4 Maintenance & Disaster Recovery Plan")
    add_p(doc,
        "To guarantee operational longevity, a multi-stage maintenance plan was formulated:"
    )
    add_bullet(doc, "Supabase automatically captures daily snapshots of the PostgreSQL database with point-in-time recovery (PITR) enabled.", bold_prefix="1. Database Snapshots: ")
    add_bullet(doc, "Database schema modifications are managed exclusively through Prisma migrations (`prisma migrate deploy`), ensuring deterministic database schema versioning across all environments.", bold_prefix="2. Schema Migrations: ")
    add_bullet(doc, "All server exceptions are processed through centralized Express error-handling middleware, logging error stack traces without leaking internal paths to clients.", bold_prefix="3. Error Logging: ")
    add_bullet(doc, "Monthly audit of npm dependencies using `npm audit` to detect and patch upstream vulnerabilities.", bold_prefix="4. Dependency Auditing: ")

    add_h2(doc, "10.5 Final Project Completion Status Table")
    add_p(doc,
        "Table 10.1 summarizes the completion status of all project deliverables for the BCA Minor Project evaluation:"
    )

    stat_headers = ["Project Work Area", "Scope Documented", "Implementation Status", "Verification Method"]
    stat_rows = [
        ["Authentication & Session", "User register, login, profile update, JWT", "100% Complete", "Automated Tests TC-P2-03..06, TC-P3-01..06"],
        ["Repository Provisioning", "CRUD, visibility (public/private), search", "100% Complete", "Automated Tests TC-P2-07, TC-P3-07..10"],
        ["Role-Based Access (RBAC)", "OWNER, CONTRIBUTOR, VIEWER permission matrix", "100% Complete", "Automated Tests TC-P2-13, TC-P3-11..16"],
        ["Branch Management", "Branching, inheritance, default branch guard", "100% Complete", "Automated Tests TC-P2-10, TC-P3-18..20, TC-P5-06..12"],
        ["File Explorer & Editor", "In-browser editor, tab indent, path sandbox", "100% Complete", "Automated Tests TC-P2-08..11, TC-P5-18..19"],
        ["Commit Version Engine", "SHA generation, parent linkage, commit list", "100% Complete", "Automated Tests TC-P2-12, TC-P3-33"],
        ["Unified Diff Engine", "Line-by-line diff chunking (add/del/normal)", "100% Complete", "Automated Tests TC-P3-25, TC-P3-30"],
        ["Pull Request Workflow", "PR open, peer reviews, approve/reject states", "100% Complete", "Automated Tests TC-P2-14..17, TC-P3-23..26"],
        ["3-Way Conflict Engine", "Automated conflict detection; blocks merges", "100% Complete", "Automated Tests TC-P3-24, TC-P3-27"],
        ["Rate Limiting Defense", "Sliding window in-memory limiter (HTTP 429)", "100% Complete", "Automated Tests TC-P5-01..03"],
        ["Theme & UI Engine", "Developer Dark & Baby Pink modes, ticker", "100% Complete", "Browser UI Walkthrough & Verification"]
    ]
    add_table(doc, stat_headers, stat_rows, col_widths=[1.5, 2.2, 1.1, 2.4])

    add_page_break(doc)

    # ==========================================
    # CHAPTER 11: FUTURE SCOPE
    # ==========================================
    add_h1(doc, "CHAPTER 11: FUTURE SCOPE & V2 ENHANCEMENTS")

    add_p(doc,
        "While the V1 Minor Project successfully delivers all core collaborative version control workflows within a self-contained web environment, "
        "several advanced capabilities are planned for the upcoming V2 Major Project (additional 3-month development cycle):"
    )

    add_h2(doc, "11.1 Native Git Smart HTTP / SSH Protocol Support")
    add_p(doc,
        "V2 will implement a custom Git Smart Transfer Protocol handler (`/info/refs?service=git-upload-pack`, `git-receive-pack`). "
        "This will allow advanced students to execute standard Git CLI commands (`git clone`, `git push`, `git pull`) directly against "
        "their Testbook repositories using their terminal, seamlessly synchronizing local development with the Testbook web interface."
    )

    add_h2(doc, "11.2 Real-Time Collaborative WebSockets & Cursors")
    add_p(doc,
        "To foster deeper laboratory collaboration, V2 will integrate Socket.io WebSockets and Conflict-Free Replicated Data Types (CRDTs). "
        "Teammates will be able to edit files concurrently with real-time peer cursor visibility, similar to Google Docs or Figma, "
        "transforming Testbook into a live collaborative pair-programming studio."
    )

    add_h2(doc, "11.3 Interactive In-Browser 3-Way Merge Conflict Resolution Canvas")
    add_p(doc,
        "Currently, conflicting pull requests are safely blocked, and colliding files are identified. In V2, an interactive 3-column "
        "visual conflict editor will be introduced, allowing students to inspect Base, Target, and Source lines side-by-side and click "
        "to accept incoming, current, or combination edits directly within the browser."
    )

    add_h2(doc, "11.4 Cloud Object Blob Storage Integration")
    add_p(doc,
        "To enable multi-region horizontal scaling, the pluggable `IStorageProvider` architecture will be expanded to support AWS S3 and "
        "Supabase Storage. File contents will be stored as content-addressable blobs in cloud object storage, decoupling the backend API "
        "from container local disk storage."
    )

    add_h2(doc, "11.5 AI-Powered Automated Code Review Assistant")
    add_p(doc,
        "V2 will introduce an optional, local-first or API-driven AI code review assistant. When a pull request is opened, the AI assistant "
        "will analyze unified diffs to detect potential security bugs, check adherence to clean code principles, and generate plain-English "
        "explanations of code changes to help beginner developers learn from their reviews."
    )

    add_page_break(doc)

    # ==========================================
    # CHAPTER 12: CONCLUSION
    # ==========================================
    add_h1(doc, "CHAPTER 12: CONCLUSION")

    add_h2(doc, "12.1 Project Summary")
    add_p(doc,
        "The TESTBOOK project was conceived and successfully engineered to bridge the critical pedagogical divide between informal, "
        "error-prone code sharing and complex, intimidating enterprise version control platforms. Over an intensive two-month minor project "
        "development lifecycle, a full-stack, enterprise-grade web application was designed, implemented, and empirically verified."
    )
    add_p(doc,
        "Built upon a modern technology stack—React 18, TypeScript, Tailwind CSS, Node.js, Express 5, Prisma ORM 5, and PostgreSQL 15—Testbook "
        "provides collegiate students with a clean, structured environment to practice essential developer workflows. The system incorporates "
        "user authentication, repository management, file editing, isolated branch sandboxes, immutable default branch protection, parent-linked "
        "commit histories, unified line-by-line diffing, threaded issue discussions, pull request code reviews, and automated 3-way merge "
        "conflict detection."
    )

    add_h2(doc, "12.2 Academic & Practical Contributions")
    add_p(doc,
        "The project makes several noteworthy academic and practical contributions:"
    )
    add_bullet(doc, "Testbook successfully demystifies version control for novice computing students, replacing intimidating command-line syntax with intuitive visual mental models and contextual guidance.", bold_prefix="1. Pedagogical Advancement: ")
    add_bullet(doc, "By enforcing strict 5-tier separation across presentation, controllers, services, and persistence, the project serves as an exemplar of Clean Architecture and strict TypeScript development.", bold_prefix="2. Software Engineering Rigor: ")
    add_bullet(doc, "The comprehensive test harness comprising 71 automated test assertions across 3 dedicated suites demonstrates an empirical 100% pass rate, validating security, authorization, and data integrity.", bold_prefix="3. Empirical Quality Assurance: ")
    add_bullet(doc, "The dual-theme engine (Matte Black / Sage Green & Baby Pink) proves that developer tools can be visually delightful, inclusive, and accessible without sacrificing technical capability.", bold_prefix="4. Inclusive Design: ")

    add_h2(doc, "12.3 Concluding Remarks")
    add_p(doc,
        "In conclusion, Testbook fulfills all academic criteria prescribed for the Bachelor of Computer Applications (B.C.A.) minor project "
        "at Allenhouse Business School, Chhatrapati Shahu Ji Maharaj University, Kanpur. It stands as an operational, robust, and impactful "
        "software engineering artifact, ready to support student teams in transitioning into disciplined, professional software developers."
    )

    add_page_break(doc)

    # ==========================================
    # CHAPTER 13: BIBLIOGRAPHY & REFERENCES
    # ==========================================
    add_h1(doc, "CHAPTER 13: BIBLIOGRAPHY & REFERENCES")

    add_p(doc, "Textbooks & Academic Publications:", bold_prefix="1. ")
    add_bullet(doc, "Chacon, S., & Straub, B. (2014). Pro Git (2nd ed.). Apress. ISBN: 978-1484200773.")
    add_bullet(doc, "Fowler, M. (2002). Patterns of Enterprise Application Architecture. Addison-Wesley Professional. ISBN: 978-0321127426.")
    add_bullet(doc, "Martin, R. C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design. Prentice Hall. ISBN: 978-0134494166.")
    add_bullet(doc, "Sommerville, I. (2015). Software Engineering (10th ed.). Pearson. ISBN: 978-0133943030.")
    add_bullet(doc, "Pressman, R. S., & Maxim, B. R. (2019). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill.")

    add_p(doc, "Official Standards & Technical Documentation:", bold_prefix="2. ")
    add_bullet(doc, "React Core Documentation. (2026). React: The Library for Web and Native User Interfaces. Retrieved from https://react.dev/")
    add_bullet(doc, "TypeScript Language Specification. (2026). TypeScript: Typed JavaScript at Any Scale. Microsoft Corporation. Retrieved from https://www.typescriptlang.org/docs/")
    add_bullet(doc, "Express.js Documentation. (2026). Fast, Unopinionated, Minimalist Web Framework for Node.js. Retrieved from https://expressjs.com/")
    add_bullet(doc, "Prisma Documentation. (2026). Next-generation ORM for Node.js and TypeScript. Retrieved from https://www.prisma.io/docs/")
    add_bullet(doc, "PostgreSQL Global Development Group. (2026). PostgreSQL 15 Documentation. Retrieved from https://www.postgresql.org/docs/15/")
    add_bullet(doc, "Tailwind CSS Documentation. (2026). A Utility-First CSS Framework for Rapid UI Development. Retrieved from https://tailwindcss.com/docs")
    add_bullet(doc, "OWASP Foundation. (2026). OWASP Top Ten Web Application Security Risks. Retrieved from https://owasp.org/www-project-top-ten/")
    add_bullet(doc, "Internet Engineering Task Force (IETF). (2015). RFC 7519: JSON Web Token (JWT). Retrieved from https://datatracker.ietf.org/doc/html/rfc7519")

    add_page_break(doc)

    # ==========================================
    # APPENDIX: API SPECIFICATION & SETUP GUIDE
    # ==========================================
    add_h1(doc, "APPENDIX: API SPECIFICATION & SETUP GUIDE")

    add_h2(doc, "A.1 Complete RESTful API Endpoint Specification")
    add_p(doc,
        "Table A.1 specifies the primary RESTful HTTP routes exposed by the Testbook backend gateway:"
    )

    api_headers = ["HTTP Method", "Endpoint Route", "Auth Required", "Description & Request Payload"]
    api_rows = [
        ["GET", "/api/health", "No", "Basic server health status check"],
        ["GET", "/api/health/db", "No", "Database connection pool verification"],
        ["POST", "/api/auth/register", "No", "Registers user; payload: { username, email, password }"],
        ["POST", "/api/auth/login", "No", "Authenticates user; payload: { email, password }"],
        ["GET", "/api/auth/me", "Yes", "Returns authenticated user profile details"],
        ["GET", "/api/users/profile", "Yes", "Returns profile stats (repository & commit counts)"],
        ["PATCH", "/api/users/profile", "Yes", "Updates bio and avatar URL; payload: { bio?, avatarUrl? }"],
        ["POST", "/api/users/password", "Yes", "Updates credentials; payload: { currentPassword, newPassword }"],
        ["GET", "/api/repos", "Yes", "Lists accessible repositories for current user"],
        ["POST", "/api/repos", "Yes", "Creates new repository; payload: { name, description?, visibility }"],
        ["GET", "/api/repos/:id", "Optional", "Retrieves repository metadata and role"],
        ["PUT", "/api/repos/:id", "Yes (Owner)", "Updates repository name, description, visibility"],
        ["DELETE", "/api/repos/:id", "Yes (Owner)", "Deletes repository and cascades all associated records"],
        ["GET", "/api/repos/:id/languages", "Optional", "Calculates repository language percentages and colors"],
        ["GET", "/api/repos/:id/branches", "Optional", "Lists repository branches and commit counters"],
        ["POST", "/api/repos/:id/branches", "Yes (Collab)", "Creates branch; payload: { name, sourceBranch? }"],
        ["DELETE", "/api/repos/:id/branches/:name", "Yes (Collab)", "Deletes feature branch (blocks default and active PR branches)"],
        ["GET", "/api/repos/:id/files", "Optional", "Lists repository files and directory tree"],
        ["GET", "/api/repos/:id/files/content", "Optional", "Retrieves file text; query: ?branch=...&path=..."],
        ["POST", "/api/repos/:id/files", "Yes (Collab)", "Creates/edits file; payload: { branch, path, content, commitMessage }"],
        ["DELETE", "/api/repos/:id/files", "Yes (Collab)", "Deletes file; payload: { branch, path, commitMessage }"],
        ["GET", "/api/repos/:id/commits", "Optional", "Lists commits; query: ?branch=..."],
        ["GET", "/api/repos/:id/commits/:sha", "Optional", "Retrieves detailed commit SHA with file changes"],
        ["GET", "/api/repos/:id/pulls", "Optional", "Lists PRs; query: ?status=ALL|OPEN|MERGED|CLOSED"],
        ["POST", "/api/repos/:id/pulls", "Yes (Collab)", "Opens PR; payload: { title, description?, sourceBranch, targetBranch }"],
        ["GET", "/api/repos/:id/pulls/:num", "Optional", "Retrieves PR details, unified diffs, and conflict flag"],
        ["POST", "/api/repos/:id/pulls/:num/reviews", "Yes (Collab)", "Submits peer review; payload: { status, comment? }"],
        ["POST", "/api/repos/:id/pulls/:num/merge", "Yes (Collab)", "Executes 3-way merge and applies changes to target branch"],
        ["GET", "/api/activities", "Yes", "Returns chronological global activity audit feed"]
    ]
    add_table(doc, api_headers, api_rows, col_widths=[1.1, 2.3, 1.1, 2.6])

    add_h2(doc, "A.2 Development & Deployment Installation Guide")
    add_p(doc,
        "To set up and run Testbook in a local development or laboratory testing environment, execute the following commands:"
    )
    add_code_block(doc,
        "# 1. Clone the repository\n"
        "git clone https://github.com/tanmayhitech/testbook.git\n"
        "cd testbook\n"
        "\n"
        "# 2. Configure Backend Environment\n"
        "cd server\n"
        "cp .env.example .env\n"
        "# Ensure DATABASE_URL, DIRECT_URL, and JWT_SECRET are populated\n"
        "npm install\n"
        "npx prisma generate\n"
        "npx prisma migrate deploy\n"
        "npm run build\n"
        "node --env-file=.env dist/server.js   # Server starts on port 5000\n"
        "\n"
        "# 3. Configure Frontend Client\n"
        "cd ../client\n"
        "npm install\n"
        "npm run dev                           # Client starts on port 5173\n"
        "\n"
        "# 4. Execute Automated Test Suites\n"
        "cd ../server\n"
        "node --env-file=.env scripts/test-phase2-e2e.js     # 18 Tests\n"
        "node --env-file=.env scripts/test-phase3-audit.js   # 34 Tests\n"
        "node --env-file=.env scripts/test-phase5-audit.js   # 19 Tests",
        title="Listing A.1: Local Setup & Test Suite Execution Commands"
    )
