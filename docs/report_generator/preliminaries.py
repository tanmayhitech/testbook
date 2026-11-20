from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from styles import (
    NAVY_COLOR, CHARCOAL_COLOR, MUTED_COLOR, TEXT_COLOR,
    add_h1, add_h2, add_h3, add_p, add_bullet, add_table, add_callout, add_page_break
)

def build_preliminaries(doc):
    # ==========================================
    # 1. COVER PAGE
    # ==========================================
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_top.paragraph_format.space_before = Pt(30)
    p_top.paragraph_format.space_after = Pt(8)
    run_rpt = p_top.add_run("A MINOR PROJECT REPORT ON")
    run_rpt.font.name = "Calibri"
    run_rpt.font.size = Pt(13)
    run_rpt.font.bold = True
    run_rpt.font.color.rgb = MUTED_COLOR

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("TESTBOOK")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(32)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY_COLOR

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(28)
    run_sub = p_sub.add_run("A Beginner-Friendly Repository and Collaborative Version Control Platform")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.italic = True
    run_sub.font.color.rgb = CHARCOAL_COLOR

    p_mid = doc.add_paragraph()
    p_mid.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_mid.paragraph_format.space_after = Pt(24)
    run_mid = p_mid.add_run(
        "Submitted in partial fulfillment of the requirements\n"
        "for the award of the degree of\n"
        "BACHELOR OF COMPUTER APPLICATIONS (B.C.A.)\n"
        "Academic Session: 2026–2027"
    )
    run_mid.font.name = "Calibri"
    run_mid.font.size = Pt(12)
    run_mid.font.bold = True
    run_mid.font.color.rgb = TEXT_COLOR

    # Student & Guide Table on Cover
    headers = ["Submitted By:", "Under the Guidance of:"]
    rows = [
        [
            "1. Alina Mansoori  (B.C.A. Final Year)\n2. Tanmay Yadav    (B.C.A. Final Year)",
            "Faculty Project Guide\nDepartment of Computer Applications\nAllenhouse Business School, Kanpur"
        ]
    ]
    add_table(doc, headers, rows, col_widths=[3.1, 3.1])

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(36)
    p_inst.paragraph_format.space_after = Pt(4)
    run_dept = p_inst.add_run(
        "DEPARTMENT OF COMPUTER APPLICATIONS\n"
        "ALLENHOUSE BUSINESS SCHOOL, ROOMA, KANPUR (KN161)\n"
        "Affiliated to Chhatrapati Shahu Ji Maharaj University, Kanpur\n"
        "Uttar Pradesh, India"
    )
    run_dept.font.name = "Calibri"
    run_dept.font.size = Pt(11)
    run_dept.font.bold = True
    run_dept.font.color.rgb = NAVY_COLOR

    add_page_break(doc)

    # ==========================================
    # 2. CERTIFICATE
    # ==========================================
    p_inst_hdr = doc.add_paragraph()
    p_inst_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst_hdr.paragraph_format.space_after = Pt(2)
    r_inst = p_inst_hdr.add_run("ALLENHOUSE BUSINESS SCHOOL, ROOMA, KANPUR\n(College Code: KN161)")
    r_inst.font.name = "Calibri"
    r_inst.font.size = Pt(13)
    r_inst.font.bold = True
    r_inst.font.color.rgb = NAVY_COLOR

    p_dept_hdr = doc.add_paragraph()
    p_dept_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept_hdr.paragraph_format.space_after = Pt(18)
    r_dept = p_dept_hdr.add_run("DEPARTMENT OF COMPUTER APPLICATIONS\nAcademic Session: 2026–2027")
    r_dept.font.name = "Calibri"
    r_dept.font.size = Pt(11)
    r_dept.font.color.rgb = MUTED_COLOR

    add_h1(doc, "CERTIFICATE OF ORIGINAL WORK")
    
    add_p(doc, 
        "This is to certify that Ms. Alina Mansoori and Mr. Tanmay Yadav, students of Bachelor of Computer Applications (B.C.A.) "
        "at Allenhouse Business School, Rooma, Kanpur, have successfully undertaken, designed, and developed the minor project entitled "
        "“TESTBOOK – A Beginner-Friendly Repository and Collaboration Platform” during the academic session 2026–2027.",
        bold_prefix="TO WHOMSOEVER IT MAY CONCERN:\n\n"
    )

    add_p(doc,
        "The project report is submitted in partial fulfillment of the academic requirements for the Bachelor of Computer Applications "
        "(B.C.A.) programme of Chhatrapati Shahu Ji Maharaj University, Kanpur. The project represents a fully implemented, operational, "
        "and rigorously tested software application. Exhaustive verification, including unit testing, full-stack integration testing, "
        "and security audits (comprising 71 automated test assertions across 3 dedicated test suites with a 100% pass rate), has been "
        "executed and validated against real application behavior."
    )

    add_p(doc,
        "The design, development, documentation, and validation work have been completed under our direct supervision and guidance. "
        "To the best of our knowledge, this work reflects the original and sincere efforts of the candidates."
    )

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(40)
    p_sig.paragraph_format.space_after = Pt(10)
    r_sig = p_sig.add_run(
        "Date: ________________________\t\t\t_____________________________________\n"
        "Place: Kanpur, Uttar Pradesh\t\t\tProject Guide (Signature & Seal)\n\n\n"
        "Countersigned by:\n\n"
        "_____________________________________\n"
        "Dr. Bharat Tripathi\n"
        "Head of Department\n"
        "Department of Computer Applications\n"
        "Allenhouse Business School, Kanpur"
    )
    r_sig.font.name = "Calibri"
    r_sig.font.size = Pt(11)
    r_sig.font.color.rgb = CHARCOAL_COLOR

    add_page_break(doc)

    # ==========================================
    # 3. ACKNOWLEDGEMENT
    # ==========================================
    add_h1(doc, "ACKNOWLEDGEMENT")

    add_p(doc,
        "We wish to express our profound gratitude and indebtedness to Allenhouse Business School, Rooma, Kanpur, and its administration "
        "for granting us the academic platform, state-of-the-art laboratory facilities, and resources indispensable to the completion of "
        "this minor project."
    )

    add_p(doc,
        "We express our heartfelt gratitude to Dr. Bharat Tripathi, Head of Department of Computer Applications, for his visionary leadership, "
        "continuous academic encouragement, and constructive critique throughout the developmental lifecycle of Testbook. His valuable "
        "insights into software engineering principles and structured software delivery were instrumental in maintaining technical rigor."
    )

    add_p(doc,
        "We also extend our earnest appreciation to our esteemed project guide and all respected faculty members of the Department of "
        "Computer Applications for their patient guidance, technical recommendations, and periodic reviews. Their constructive feedback "
        "greatly enhanced our understanding of full-stack TypeScript architectures, RESTful API design, database normalization, and version "
        "control internal algorithms."
    )

    add_p(doc,
        "Special thanks are due to our classmates, laboratory peers, and friends who participated in user feedback sessions, evaluated the "
        "accessibility of the dual-theme interface, and helped discover boundary conditions during integration testing. Finally, we remain "
        "forever indebted to our families for their endless patience, sacrifices, and moral support that inspired us to persevere."
    )

    p_ack_sig = doc.add_paragraph()
    p_ack_sig.paragraph_format.space_before = Pt(30)
    r_ack_sig = p_ack_sig.add_run(
        "1. Alina Mansoori  (B.C.A. 2026–2027)\n"
        "2. Tanmay Yadav    (B.C.A. 2026–2027)\n\n"
        "Department of Computer Applications\n"
        "Allenhouse Business School, Rooma, Kanpur"
    )
    r_ack_sig.font.name = "Calibri"
    r_ack_sig.font.size = Pt(11)
    r_ack_sig.font.bold = True
    r_ack_sig.font.color.rgb = CHARCOAL_COLOR

    add_page_break(doc)

    # ==========================================
    # 4. DECLARATION
    # ==========================================
    add_h1(doc, "CANDIDATE DECLARATION")

    add_p(doc,
        "We, Alina Mansoori and Tanmay Yadav, bona fide students of Bachelor of Computer Applications (B.C.A.) at Allenhouse Business School, "
        "Rooma, Kanpur, hereby solemnly declare that the minor project report entitled “TESTBOOK – A Beginner-Friendly Repository and "
        "Collaboration Platform” is an authentic record of our own original work completed during the academic session 2026–2027.",
        bold_prefix="DECLARATION:\n\n"
    )

    add_p(doc,
        "This project report is being submitted in partial fulfillment of the requirements for the award of the Bachelor of Computer "
        "Applications (B.C.A.) degree of Chhatrapati Shahu Ji Maharaj University, Kanpur. The results embodied in this report have not been "
        "submitted to any other University, Institute, or Examining Body for the award of any diploma, degree, or certificate."
    )

    add_p(doc,
        "We further confirm that the software system described herein has been fully implemented using modern enterprise technologies—React 18, "
        "TypeScript, Express, PostgreSQL, and Prisma ORM—and has undergone rigorous empirical testing. All 71 automated test assertions across "
        "end-to-end user workflows, role-based authorization hierarchies, version control branching rules, path traversal defenses, and merge "
        "conflict detections have been executed against live databases with zero defects remaining open."
    )

    p_dec_sig = doc.add_paragraph()
    p_dec_sig.paragraph_format.space_before = Pt(40)
    r_dec_sig = p_dec_sig.add_run(
        "Date: ________________________\n"
        "Place: Kanpur, Uttar Pradesh\n\n\n"
        "1. _____________________________________\t\t2. _____________________________________\n"
        "   Alina Mansoori\t\t\t\t\t   Tanmay Yadav\n"
        "   B.C.A. Final Year\t\t\t\t   B.C.A. Final Year\n"
        "   Allenhouse Business School\t\t\t   Allenhouse Business School"
    )
    r_dec_sig.font.name = "Calibri"
    r_dec_sig.font.size = Pt(11)
    r_dec_sig.font.color.rgb = CHARCOAL_COLOR

    add_page_break(doc)

    # ==========================================
    # 5. ABSTRACT / EXECUTIVE SUMMARY
    # ==========================================
    add_h1(doc, "ABSTRACT")

    add_p(doc,
        "Modern professional software engineering relies unconditionally upon distributed version control systems (VCS) and collaborative "
        "code hosting platforms such as GitHub, GitLab, and Bitbucket. However, introductory computer science and application students "
        "consistently encounter severe cognitive friction when introduced to these platforms. Commercial VCS tools present overwhelming "
        "command-line syntax (e.g., detached HEAD states, rebase workflows, interactive stashing), intricate permission management, and "
        "interfaces cluttered with advanced enterprise features. Consequently, collegiate student teams frequently abandon structured version "
        "control in favor of precarious ad-hoc practices—such as sharing zip archives over instant messaging apps, emailing code snippets, "
        "or overwriting teammates' files on shared cloud drives—resulting in catastrophic merge collisions, lost project history, and a lack "
        "of collaborative code review skills."
    )

    add_p(doc,
        "To decisively solve this academic dilemma, we developed TESTBOOK: a web-first, beginner-friendly collaborative software development "
        "and version control platform tailored specifically for undergraduate students and academic laboratory environments. Testbook provides "
        "a visual, self-explanatory abstraction over fundamental VCS workflows, bridging the pedagogical gap between chaotic informal code "
        "sharing and complex enterprise tooling."
    )

    add_p(doc,
        "Testbook is engineered following a strict 5-tier layered architecture: a React 18 Single Page Application (SPA) styled with Tailwind CSS, "
        "a centralized RESTful API gateway powered by Node.js and Express 5 with TypeScript, an encapsulated domain service layer enforcing "
        "business logic, and a persistence layer utilizing Prisma ORM 5 with direct connection pooling to a cloud-hosted PostgreSQL 15 database. "
        "Core functional modules include: stateless JWT authentication with bcrypt password hashing; strict Role-Based Access Control (RBAC) "
        "enforcing OWNER, CONTRIBUTOR, and VIEWER privilege boundaries; in-browser code editing with real-time syntax line numbers and find-and-replace; "
        "isolated branch workspaces with immutable protection for default branches; automated commit generation linked to parent hash trees; "
        "an algorithmic unified line-by-line diff engine; issue tracking with threaded discussions; and a complete pull request lifecycle featuring "
        "peer code reviews and an automated 3-way merge conflict detection engine."
    )

    add_p(doc,
        "In addition to developer capabilities, Testbook incorporates innovative educational affordances: a Beginner Mode engine providing contextual "
        "technical explanations, a real-time system status ticker, and a dual-theme aesthetic engine (featuring Developer Matte Black with Sage Green "
        "accents, as well as an accessible Baby Pink / Soft Rose palette designed to maximize visual comfort and reduce cognitive strain). "
        "The system has been empirically validated through three automated testing and audit suites totaling 71 test assertions with a 100% pass "
        "rate, confirming enterprise-grade security, resilience against directory traversal attacks, and zero data corruption during branch merges."
    )

    add_page_break(doc)

    # ==========================================
    # 6. TABLE OF CONTENTS
    # ==========================================
    add_h1(doc, "TABLE OF CONTENTS")

    toc_headers = ["Chapter", "Particulars / Section Heading", "Page Range"]
    toc_rows = [
        ["—", "Certificate of Original Work", "2"],
        ["—", "Acknowledgement", "3"],
        ["—", "Candidate Declaration", "4"],
        ["—", "Abstract / Executive Summary", "5"],
        ["—", "List of Figures", "7"],
        ["—", "List of Tables", "8"],
        ["1", "INTRODUCTION\n  1.1 Background and Academic Motivation\n  1.2 Problem Statement & Student Workflow Analysis\n  1.3 Scope of the Project (V1 vs. V2)\n  1.4 Beginner-Mode Philosophy & Educational Scaffolding\n  1.5 Dual-Theme Engine (Matte Black & Baby Pink)\n  1.6 Organization of the Report", "9 – 13"],
        ["2", "OBJECTIVES\n  2.1 Primary Technical Objectives (15 Objectives)\n  2.2 Educational Learning Objectives (10 Competencies)\n  2.3 Performance Benchmarks & Quality Metrics", "14 – 17"],
        ["3", "PRELIMINARY SYSTEM ANALYSIS\n  3.1 Preliminary Investigation & Field Survey\n  3.2 Present Informal Systems in Academic Use\n  3.3 Flaws & Inherent Risks in Present Systems\n  3.4 Need for the New System: The Testbook Vision\n  3.5 Four-Dimensional Feasibility Study (Technical, Economic, Operational, Schedule)", "18 – 22"],
        ["4", "PROJECT CATEGORY & ARCHITECTURE\n  4.1 Project Classification & Domain\n  4.2 5-Tier Layered System Architecture\n  4.3 Separation of Concerns & Clean Architecture Principles\n  4.4 RESTful Communication Protocols & API Standards", "23 – 26"],
        ["5", "SOFTWARE & HARDWARE REQUIREMENT SPECIFICATION (SRS)\n  5.1 Software Requirements (Client, Server, Database, Tooling)\n  5.2 Hardware Requirements (Development, Server, Client)\n  5.3 Non-Functional Requirements (Security, Reliability, Latency)\n  5.4 User Characteristics and Pedagogical Assumptions", "27 – 30"],
        ["6", "DETAILED SYSTEM ANALYSIS\n  6.1 Data Flow Diagrams (Context Level 0, Level 1 Processes, Level 2 Detailed Flows)\n  6.2 Algorithmic Logic & Flowcharts (Diff Engine, 3-Way Merge, Sliding Window Limiter, Storage Guard)\n  6.3 Complete Database Schema & Data Dictionary (13 Models, 8 Enums, Tables)\n  6.4 Entity Relationship Diagram (ERD) & Relational Cardinality", "31 – 42"],
        ["7", "SYSTEM DESIGN & IMPLEMENTATION\n  7.1 Form Design & User Interface Layouts\n  7.2 Core Source Code Listings (Auth, Limiter, Storage, Branch Guard, PR Merge, Diff, Code Editor, Theme Engine)\n  7.3 Project Output Screenshots & Interface Walkthroughs (Figures 7.1 to 7.10)", "43 – 57"],
        ["8", "TESTING & QUALITY ASSURANCE\n  8.1 Testing Methodology & Test Harness\n  8.2 Comprehensive Test Execution Matrix (71 Automated Tests Across 3 Suites)\n  8.3 Defect Tracking, Root Cause Analysis & Retest Resolution Log", "58 – 65"],
        ["9", "SYSTEM SECURITY MEASURES\n  9.1 Stateless JWT Authentication & Verification\n  9.2 Cryptographic bcrypt Salt-and-Hash (12 Rounds)\n  9.3 Role-Based Access Control (RBAC Hierarchy)\n  9.4 Sliding-Window Rate Limiting Defense\n  9.5 Path Traversal Sandbox & Storage Isolation\n  9.6 Injection Defenses (Prisma SQL & React XSS)", "66 – 69"],
        ["10", "IMPLEMENTATION, EVALUATION & MAINTENANCE\n  10.1 Implementation Methodology & Milestones\n  10.2 Evaluation Against Primary & Educational Objectives\n  10.3 Cloud Deployment Architecture\n  10.4 Maintenance, Backup & Disaster Recovery Plan\n  10.5 Current Project Completion Status Table", "70 – 74"],
        ["11", "FUTURE SCOPE & V2 ENHANCEMENTS\n  11.1 Native Git Smart HTTP / SSH Protocol Support\n  11.2 Real-Time Collaborative WebSockets & Cursors\n  11.3 Interactive In-Browser 3-Way Merge Conflict Canvas\n  11.4 Cloud Object Blob Storage Integration\n  11.5 AI-Powered Automated Code Review Assistant", "75 – 77"],
        ["12", "CONCLUSION\n  12.1 Project Summary\n  12.2 Academic & Practical Contributions\n  12.3 Concluding Remarks", "78 – 79"],
        ["13", "BIBLIOGRAPHY & REFERENCES", "80 – 81"],
        ["App", "APPENDIX: API SPECIFICATION & SETUP GUIDE\n  A.1 Complete REST API Route Reference\n  A.2 Development & Deployment Installation Guide", "82 – 84"]
    ]
    add_table(doc, toc_headers, toc_rows, col_widths=[1.0, 4.4, 1.0])

    add_page_break(doc)

    # ==========================================
    # 7. LIST OF FIGURES & LIST OF TABLES
    # ==========================================
    add_h1(doc, "LIST OF FIGURES")
    fig_headers = ["Figure No.", "Figure Title / Caption", "Page"]
    fig_rows = [
        ["Figure 4.1", "Five-Tier Layered System Architecture of Testbook", "24"],
        ["Figure 6.1", "Level 0 Context Data Flow Diagram (DFD 0)", "31"],
        ["Figure 6.2", "Level 1 Process Data Flow Diagram across 6 Core Subsystems", "32"],
        ["Figure 6.3", "Level 2 DFD: Repository Creation and Workspace Initialization", "33"],
        ["Figure 6.4", "Level 2 DFD: Branch Creation and Default Branch Protection Guard", "34"],
        ["Figure 6.5", "Level 2 DFD: Pull Request 3-Way Merge Conflict Evaluation Flow", "35"],
        ["Figure 6.6", "Algorithmic Flowchart: Unified Line-by-Line Diff Engine", "36"],
        ["Figure 6.7", "Algorithmic Flowchart: 3-Way Merge and Conflict Detection", "37"],
        ["Figure 6.8", "Entity-Relationship Diagram (ERD) of Testbook PostgreSQL Database", "42"],
        ["Figure 7.1", "Testbook Landing Page & Feature Showcase", "52"],
        ["Figure 7.2", "User Registration Interface with Real-Time Validation", "52"],
        ["Figure 7.3", "User Login & Secure JWT Session Initiation", "53"],
        ["Figure 7.4", "Developer Dashboard (Matte Black Theme)", "53"],
        ["Figure 7.5", "Developer Dashboard (Baby Pink Theme - Active Lab Infrastructure)", "54"],
        ["Figure 7.6", "Repository Creation Modal with Visibility Selection", "54"],
        ["Figure 7.7", "Repository Overview, File Browser & Language Distribution Bar", "55"],
        ["Figure 7.8", "In-Browser Code Explorer with Line Numbers & Tab Indentation", "55"],
        ["Figure 7.9", "Branch Management Tab with Active PR Safeguards", "56"],
        ["Figure 7.10", "Pull Request Review, Unified Diff Chunks & Automated Merge", "56"]
    ]
    add_table(doc, fig_headers, fig_rows, col_widths=[1.2, 4.4, 0.8])

    doc.add_paragraph().paragraph_format.space_before = Pt(12)
    add_h1(doc, "LIST OF TABLES")
    tbl_headers = ["Table No.", "Table Title / Description", "Page"]
    tbl_rows = [
        ["Table 2.1", "Evaluation Matrix: 15 Primary Technical Objectives Implementation Status", "15"],
        ["Table 2.2", "Pedagogical Competency Mapping: 10 Educational Learning Objectives", "17"],
        ["Table 3.1", "Comparative Analysis: Informal Ad-hoc Methods vs. Commercial Git vs. Testbook", "20"],
        ["Table 3.2", "Technical Feasibility Analysis of the Chosen Technology Stack", "21"],
        ["Table 4.1", "Layered Architectural Responsibilities and Inter-Tier Contracts", "25"],
        ["Table 5.1", "Software Technology Specifications and Version Dependencies", "27"],
        ["Table 5.2", "Hardware Specifications for Development Workstations and Servers", "29"],
        ["Table 6.1", "Data Dictionary: User Model Specification", "38"],
        ["Table 6.2", "Data Dictionary: Repository and RepositoryMember Model Specifications", "39"],
        ["Table 6.3", "Data Dictionary: Branch, Commit, File, and CommitFile Specifications", "40"],
        ["Table 6.4", "Data Dictionary: Issue, IssueComment, PullRequest, Review, and Activity Specifications", "41"],
        ["Table 8.1", "Phase 2 End-to-End Integration Test Suite Execution Log (18 Tests - 100% Passed)", "59"],
        ["Table 8.2", "Phase 3 Comprehensive Security & RBAC Audit Suite Execution Log (34 Tests - 100% Passed)", "61"],
        ["Table 8.3", "Phase 5 Quality, Rate Limiting & Storage Guard Suite Execution Log (19 Tests - 100% Passed)", "63"],
        ["Table 8.4", "Defect Tracking, Root Cause Analysis & Retest Resolution Log", "65"],
        ["Table 9.1", "Role-Based Access Control (RBAC) Permission Matrix across Modules", "67"],
        ["Table 10.1", "Final Project Milestone Completion Status Table", "74"],
        ["Table A.1", "Complete RESTful API Endpoint Specification", "82"]
    ]
    add_table(doc, tbl_headers, tbl_rows, col_widths=[1.2, 4.4, 0.8])

    add_page_break(doc)
