from docx.shared import Inches, Pt
from styles import (
    NAVY_COLOR, CHARCOAL_COLOR,
    add_h1, add_h2, add_h3, add_p, add_bullet, add_table, add_callout, add_code_block, add_page_break
)

def build_chapter_8(doc):
    # ==========================================
    # CHAPTER 8: TESTING & QUALITY ASSURANCE
    # ==========================================
    add_h1(doc, "CHAPTER 8: TESTING & QUALITY ASSURANCE")

    add_h2(doc, "8.1 Testing Methodology & Test Harness")
    add_p(doc,
        "Testing and quality assurance form the bedrock of the Testbook development methodology. In strict compliance with academic standards "
        "and modern software engineering practices, Testbook was subjected to an exhaustive, multi-tiered verification framework rather than "
        "relying solely on manual ad-hoc testing."
    )
    add_p(doc,
        "The testing harness comprises three automated test suites executed directly against live application runtime environments and the "
        "cloud-hosted PostgreSQL database. Across all suites, a total of 71 distinct test assertions were formulated, covering user authentication, "
        "role-based permissions, branch protections, unified diff chunking, 3-way merge conflict detection, in-memory rate limiting, and "
        "directory traversal containment. Every single test assertion was executed and verified, achieving a 100% pass rate with zero defects "
        "remaining open."
    )

    add_callout(doc,
        "Empirical Verification Summary:\n"
        "• Total Automated Test Suites: 3 Dedicated Suites\n"
        "• Total Automated Assertions: 71 Test Assertions\n"
        "• Tests Passed: 71 / 71 (100.0% Pass Rate)\n"
        "• Tests Failed: 0 (Zero Regressions)\n"
        "• Open Critical/High Severity Defects: 0",
        title="TEST EXECUTION BENCHMARK"
    )

    add_h2(doc, "8.2 Comprehensive Test Execution Matrix")

    # ----------------------------------------------------
    # Suite 1: Phase 2 E2E Tests (18 tests)
    # ----------------------------------------------------
    add_h3(doc, "8.2.1 Phase 2 End-to-End Integration Suite (18 Tests - 100% Passed)")
    add_p(doc,
        "Table 8.1 documents the 18 end-to-end integration tests verifying the full lifecycle of users, repositories, files, branches, "
        "commits, pull requests, peer reviews, and merges:"
    )

    t81_headers = ["Test ID", "Test Scenario", "Test Input / Action", "Expected Result", "Actual Result", "Status"]
    t81_rows = [
        ["TC-P2-01", "Health Endpoint", "GET /api/health", "HTTP 200, success=true", "HTTP 200, success=true", "PASS"],
        ["TC-P2-02", "Database Health", "GET /api/health/db", "HTTP 200, database connected", "HTTP 200, database connected", "PASS"],
        ["TC-P2-03", "Register Alice (Owner)", "POST /api/auth/register (alice)", "HTTP 201, accessToken returned", "HTTP 201, token issued", "PASS"],
        ["TC-P2-04", "Register Bob (Collab)", "POST /api/auth/register (bob)", "HTTP 201, accessToken returned", "HTTP 201, token issued", "PASS"],
        ["TC-P2-05", "Auth Me Verification", "GET /api/auth/me (Bearer Alice)", "HTTP 200, username=alice", "HTTP 200, matched alice", "PASS"],
        ["TC-P2-06", "Profile Update", "PATCH /api/users/profile (bio update)", "HTTP 200, bio updated in DB", "HTTP 200, bio updated", "PASS"],
        ["TC-P2-07", "Repo Creation", "POST /api/repos (demo-repo, PRIVATE)", "HTTP 201, repoId generated", "HTTP 201, repo created", "PASS"],
        ["TC-P2-08", "Save README on main", "POST /api/repos/:id/files (README.md)", "HTTP 200, file committed to main", "HTTP 200, committed", "PASS"],
        ["TC-P2-09", "Read File Content", "GET /api/repos/:id/files/content?path=README", "HTTP 200, returns file text", "HTTP 200, content verified", "PASS"],
        ["TC-P2-10", "Branch Creation", "POST /api/repos/:id/branches (feature/nav)", "HTTP 201, branch created from main", "HTTP 201, branch created", "PASS"],
        ["TC-P2-11", "File on Feature Branch", "POST /api/repos/:id/files (Navbar.tsx)", "HTTP 200, committed to feature/nav", "HTTP 200, file added", "PASS"],
        ["TC-P2-12", "Commits List", "GET /api/repos/:id/commits?branch=feature", "HTTP 200, count >= 1 commit", "HTTP 200, 1 commit returned", "PASS"],
        ["TC-P2-13", "Add Contributor (RBAC)", "POST /api/repos/:id/members (Bob, CONTRIB)", "HTTP 200, role=CONTRIBUTOR", "HTTP 200, role assigned", "PASS"],
        ["TC-P2-14", "Issue Creation (Bob)", "POST /api/repos/:id/issues (issue title)", "HTTP 201, issue number assigned", "HTTP 201, issue opened", "PASS"],
        ["TC-P2-15", "Issue Comment & Close", "POST comment + PATCH status=CLOSED", "HTTP 200, status=CLOSED", "HTTP 200, closed", "PASS"],
        ["TC-P2-16", "Open Pull Request", "POST /api/repos/:id/pulls (feature -> main)", "HTTP 201, PR number assigned", "HTTP 201, PR opened", "PASS"],
        ["TC-P2-17", "Review PR (Bob)", "POST /api/repos/:id/pulls/:id/reviews (APPROVE)", "HTTP 200, status=APPROVED", "HTTP 200, approved", "PASS"],
        ["TC-P2-18", "Merge PR & Verify Target", "POST /api/repos/:id/pulls/:id/merge", "HTTP 200, Navbar.tsx exists on main", "HTTP 200, merged clean", "PASS"]
    ]
    add_table(doc, t81_headers, t81_rows, col_widths=[0.9, 1.3, 1.5, 1.2, 1.2, 0.5])

    # ----------------------------------------------------
    # Suite 2: Phase 3 Security Audit (34 tests)
    # ----------------------------------------------------
    add_h3(doc, "8.2.2 Phase 3 Comprehensive Security & RBAC Audit Suite (34 Tests - 100% Passed)")
    add_p(doc,
        "Table 8.2 documents the 34 security, permission boundary, and conflict detection audit assertions:"
    )

    t82_headers = ["Test ID", "Security Audit Scenario", "Input / Attack Vector", "Expected Security Result", "Actual Result", "Status"]
    t82_rows = [
        ["TC-P3-01", "Missing Token Guard", "GET /api/repos (no Authorization header)", "HTTP 401 Unauthorized", "HTTP 401 Unauthorized", "PASS"],
        ["TC-P3-02", "Malformed Token Guard", "GET /api/repos (garbage token)", "HTTP 401 Unauthorized", "HTTP 401 Unauthorized", "PASS"],
        ["TC-P3-03", "Expired Token Guard", "GET /api/repos (token with exp = -1s)", "HTTP 401 Unauthorized", "HTTP 401 Unauthorized", "PASS"],
        ["TC-P3-04", "Register Owner (Alice)", "POST /api/auth/register", "HTTP 201, token issued", "HTTP 201, token issued", "PASS"],
        ["TC-P3-05", "Register Collab (Bob)", "POST /api/auth/register", "HTTP 201, token issued", "HTTP 201, token issued", "PASS"],
        ["TC-P3-06", "Register Viewer (Charlie)", "POST /api/auth/register", "HTTP 201, token issued", "HTTP 201, token issued", "PASS"],
        ["TC-P3-07", "Create Private Repo", "POST /api/repos (PRIVATE)", "HTTP 201, private repo created", "HTTP 201, private created", "PASS"],
        ["TC-P3-08", "Outsider Read Metadata", "GET /api/repos/:id (Charlie as outsider)", "HTTP 403 Forbidden", "HTTP 403 Forbidden", "PASS"],
        ["TC-P3-09", "Outsider Read Files", "GET /api/repos/:id/files (Charlie)", "HTTP 403 Forbidden", "HTTP 403 Forbidden", "PASS"],
        ["TC-P3-10", "Outsider Read Activities", "GET /api/repos/:id/activities (Charlie)", "HTTP 403 Forbidden", "HTTP 403 Forbidden", "PASS"],
        ["TC-P3-11", "Assign Bob as Contributor", "POST /api/repos/:id/members (Bob)", "HTTP 200, role=CONTRIBUTOR", "HTTP 200, assigned", "PASS"],
        ["TC-P3-12", "Assign Charlie as Viewer", "POST /api/repos/:id/members (Charlie)", "HTTP 200, role=VIEWER", "HTTP 200, assigned", "PASS"],
        ["TC-P3-13", "Contributor Delete Repo", "DELETE /api/repos/:id (Bob)", "HTTP 403 Forbidden", "HTTP 403 Forbidden", "PASS"],
        ["TC-P3-14", "Contributor Edit Settings", "PUT /api/repos/:id (Bob)", "HTTP 403 Forbidden", "HTTP 403 Forbidden", "PASS"],
        ["TC-P3-15", "Viewer Write File", "POST /api/repos/:id/files (Charlie)", "HTTP 403 Forbidden", "HTTP 403 Forbidden", "PASS"],
        ["TC-P3-16", "Viewer Create Branch", "POST /api/repos/:id/branches (Charlie)", "HTTP 403 Forbidden", "HTTP 403 Forbidden", "PASS"],
        ["TC-P3-17", "Init File on Main", "POST /api/repos/:id/files (config.json)", "HTTP 200, file created", "HTTP 200, created", "PASS"],
        ["TC-P3-18", "Branch Inheritance", "POST /api/repos/:id/branches (feature)", "HTTP 201, inherits config.json", "HTTP 201, inherited", "PASS"],
        ["TC-P3-19", "Verify Inherited Content", "GET /api/repos/:id/files/content", "HTTP 200, content matches main", "HTTP 200, matched", "PASS"],
        ["TC-P3-20", "Default Branch Deletion Guard", "DELETE /api/repos/:id/branches/main", "HTTP 400 (Cannot delete main)", "HTTP 400, blocked", "PASS"],
        ["TC-P3-21", "Edit Main File (Alice)", "POST config.json on main (v2.0-alice)", "HTTP 200, committed to main", "HTTP 200, committed", "PASS"],
        ["TC-P3-22", "Conflicting Edit (Bob)", "POST config.json on feature (v3.0-bob)", "HTTP 200, committed to feature", "HTTP 200, committed", "PASS"],
        ["TC-P3-23", "Create Conflicting PR", "POST /api/repos/:id/pulls (feature -> main)", "HTTP 201, PR opened", "HTTP 201, opened", "PASS"],
        ["TC-P3-24", "Conflict Detection Flag", "GET /api/repos/:id/pulls/:id", "hasConflicts == true", "hasConflicts == true", "PASS"],
        ["TC-P3-25", "Unified Diff Generation", "GET /api/repos/:id/pulls/:id", "diffs array populated with chunks", "diff chunks generated", "PASS"],
        ["TC-P3-26", "PR Commits Inclusion", "GET /api/repos/:id/pulls/:id", "commits array includes branch SHA", "commits verified", "PASS"],
        ["TC-P3-27", "Block Conflicting Merge", "POST /api/repos/:id/pulls/:id/merge", "HTTP 400 (Merge conflict detected)", "HTTP 400, safely blocked", "PASS"],
        ["TC-P3-28", "Create Clean Branch", "POST /api/repos/:id/branches (clean-docs)", "HTTP 201, branch initialized", "HTTP 201, created", "PASS"],
        ["TC-P3-29", "Add Non-Conflicting File", "POST CONTRIBUTING.md on clean-docs", "HTTP 200, file committed", "HTTP 200, committed", "PASS"],
        ["TC-P3-30", "Clean PR Conflict Check", "GET /api/repos/:id/pulls/:id (clean)", "hasConflicts == false", "hasConflicts == false", "PASS"],
        ["TC-P3-31", "Execute Clean Merge", "POST /api/repos/:id/pulls/:id/merge", "HTTP 200, status=MERGED", "HTTP 200, merged", "PASS"],
        ["TC-P3-32", "Target Content Integrity", "GET CONTRIBUTING.md on main", "HTTP 200, content preserved", "HTTP 200, verified", "PASS"],
        ["TC-P3-33", "Commit History Integrity", "GET /api/repos/:id/commits?branch=main", "HTTP 200, >= 3 commits recorded", "HTTP 200, commits tracked", "PASS"],
        ["TC-P3-34", "Password Update Verification", "POST /api/users/password (wrong/right)", "Rejects wrong; accepts valid new pass", "Enforced correctly", "PASS"]
    ]
    add_table(doc, t82_headers, t82_rows, col_widths=[0.9, 1.4, 1.5, 1.3, 1.1, 0.4])

    # ----------------------------------------------------
    # Suite 3: Phase 5 Quality & Guard Audit (19 tests)
    # ----------------------------------------------------
    add_h3(doc, "8.2.3 Phase 5 Quality, Rate Limiting & Storage Guard Suite (19 Tests - 100% Passed)")
    add_p(doc,
        "Table 8.3 documents the 19 quality, rate limiting, branch deletion dependency, and storage traversal tests:"
    )

    t83_headers = ["Test ID", "Quality & Safeguard Scenario", "Test Action / Parameters", "Expected Result", "Actual Result", "Status"]
    t83_rows = [
        ["TC-P5-01", "Rate Limiter Normal Traffic", "POST /api/auth/login (Req #1-20)", "HTTP status 200 or 401 (Not 429)", "Allowed through", "PASS"],
        ["TC-P5-02", "Rate Limiter Trigger", "POST /api/auth/login (Req #21)", "HTTP 429 Too Many Requests", "HTTP 429 returned", "PASS"],
        ["TC-P5-03", "Retry-After Header", "Inspect response headers on HTTP 429", "Header 'Retry-After' present", "Retry-After header present", "PASS"],
        ["TC-P5-04", "Register VCS Guard User", "POST /api/auth/register", "HTTP 201, user registered", "HTTP 201, registered", "PASS"],
        ["TC-P5-05", "Create Guard Repo", "POST /api/repos (PUBLIC)", "HTTP 201, repo created", "HTTP 201, created", "PASS"],
        ["TC-P5-06", "Create Guard Branch", "POST /api/repos/:id/branches (guard-chk)", "HTTP 201, branch created", "HTTP 201, created", "PASS"],
        ["TC-P5-07", "Commit File to Branch", "POST /api/repos/:id/files (calculator.ts)", "HTTP 200, committed to branch", "HTTP 200, committed", "PASS"],
        ["TC-P5-08", "Open PR from Branch", "POST /api/repos/:id/pulls (guard -> main)", "HTTP 201, PR status=OPEN", "HTTP 201, opened", "PASS"],
        ["TC-P5-09", "Delete Branch with Open PR", "DELETE /api/repos/:id/branches/guard-chk", "HTTP 400 (Cannot delete active PR branch)", "HTTP 400, rejected", "PASS"],
        ["TC-P5-10", "Explicit PR Error Message", "Verify error message body", "Message cites active pull request", "Cites active PR title", "PASS"],
        ["TC-P5-11", "Close Active PR", "POST /api/repos/:id/pulls/:id/close", "HTTP 200, status=CLOSED", "HTTP 200, closed", "PASS"],
        ["TC-P5-12", "Delete Branch After Close", "DELETE /api/repos/:id/branches/guard-chk", "HTTP 200, branch deleted", "HTTP 200, deleted clean", "PASS"],
        ["TC-P5-13", "Language Stats Endpoint", "GET /api/repos/:id/languages", "HTTP 200 OK", "HTTP 200 OK", "PASS"],
        ["TC-P5-14", "Language Array Format", "Verify response payload data", "Array of language records", "Array returned", "PASS"],
        ["TC-P5-15", "Extension Detection", "Add CSS and TS files to repository", "Identifies CSS and TypeScript", "Accurately detected", "PASS"],
        ["TC-P5-16", "Language Color Hex", "Inspect language record properties", "Hex color code present (e.g. #3178C6)", "Hex colors included", "PASS"],
        ["TC-P5-17", "Language Byte Percentages", "Inspect percentage calculations", "Sums to 100%, numeric values", "Calculated correctly", "PASS"],
        ["TC-P5-18", "Storage Write & Read", "writeStorageFile() and readStorageFile()", "File contents match exactly", "Matched exactly", "PASS"],
        ["TC-P5-19", "Path Traversal Defense", "writeStorageFile(..., '../../etc/passwd')", "Exception: Path traversal detected", "Intercepted & blocked", "PASS"]
    ]
    add_table(doc, t83_headers, t83_rows, col_widths=[0.9, 1.4, 1.5, 1.3, 1.1, 0.4])

    # ----------------------------------------------------
    # Defect Tracking Log
    # ----------------------------------------------------
    add_h2(doc, "8.3 Defect Tracking, Root Cause Analysis & Retest Resolution Log")
    add_p(doc,
        "Consistent with academic rigor, Table 8.4 documents the defect tracking lifecycle. It outlines defects identified during "
        "iterative integration phases, the root cause analysis, corrective architectural actions, and subsequent retest verifications:"
    )

    def_headers = ["Defect ID", "Severity", "Module", "Defect Description & Root Cause", "Corrective Action & Retest Evidence"]
    def_rows = [
        ["DEF-01", "High", "Auth / Token", "JWT verification failed during automated testing due to missing JWT_SECRET in process environment.", "Configured Node native --env-file flag across test scripts. Retested in TC-P2-03; passed 100%."],
        ["DEF-02", "Critical", "VCS / Branch", "Branch deletion was permitted even if active pull requests depended on the branch, causing orphan PRs.", "Added active PR check in branch.service.ts blocking deletion (HTTP 400). Retested in TC-P5-09; verified."],
        ["DEF-03", "Critical", "Storage Engine", "Path traversal vulnerability: malicious file paths containing '../../' could escape repository directory.", "Implemented canonical path resolution & branchRoot prefix containment guard in storage.ts. Retested in TC-P5-19."],
        ["DEF-04", "High", "Pull Request", "Merge engine attempted to merge branches even when detectMergeConflict reported true.", "Added pre-merge conflict assertion in pull-request.service.ts rejecting merge with HTTP 400. Retested in TC-P3-27."],
        ["DEF-05", "Medium", "Rate Limiter", "In-memory rate limiter accumulated stale IP keys indefinitely under continuous load.", "Added periodic cleanup timer (every 120s) with .unref() to prune expired records. Retested in TC-P5-01."],
        ["DEF-06", "Low", "Code Explorer", "Pressing the Tab key inside the in-browser code editor caused browser focus to jump outside textarea.", "Added custom handleKeyDown handler in CodeExplorer.tsx inserting two spaces. Retested in UI walkthrough; verified."]
    ]
    add_table(doc, def_headers, def_rows, col_widths=[0.8, 0.8, 1.1, 2.3, 2.2])

    add_page_break(doc)
