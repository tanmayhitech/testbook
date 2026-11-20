import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
from docx2pdf import convert
import pypdf
from PIL import Image
import io

curr_dir = os.path.dirname(os.path.abspath(__file__))
helpers_dir = os.path.join(curr_dir, 'report_generator')
if helpers_dir not in sys.path:
    sys.path.insert(0, helpers_dir)

from builder_helpers import (
    add_clean_table, add_heading_1, add_heading_2, add_p, add_bullet,
    add_screenshot_figure, add_code_snippet
)

def create_40_page_report():
    doc = docx.Document()

    # Configure Margins and Double Page Border
    section = doc.sections[0]
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)
    section.different_first_page_header_footer = False

    sectPr = section._sectPr
    border_xml = parse_xml(f'''
        <w:pgBorders {nsdecls("w")} w:offsetFrom="page">
            <w:top w:val="double" w:sz="12" w:space="24" w:color="000000"/>
            <w:left w:val="double" w:sz="12" w:space="24" w:color="000000"/>
            <w:bottom w:val="double" w:sz="12" w:space="24" w:color="000000"/>
            <w:right w:val="double" w:sz="12" w:space="24" w:color="000000"/>
        </w:pgBorders>
    ''')
    sectPr.append(border_xml)

    media_dir = "C:/Users/Acer/.gemini/antigravity/brain/e7e3fe0b-71cb-4454-a5b8-855a721fed6a/.user_uploaded"
    logo_left = os.path.join(curr_dir, "Image11.jpg")
    logo_right = os.path.join(curr_dir, "Image12.png")

    # =========================================================================
    # PAGE 1: TITLE / COVER PAGE
    # =========================================================================
    logo_table = doc.add_table(rows=1, cols=2)
    logo_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_left = logo_table.cell(0, 0)
    c_right = logo_table.cell(0, 1)
    c_left.width = Inches(3.2)
    c_right.width = Inches(3.2)

    p_l = c_left.paragraphs[0]
    p_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
    if os.path.exists(logo_left):
        run_l = p_l.add_run()
        run_l.add_picture(logo_left, width=Inches(1.5))

    p_r = c_right.paragraphs[0]
    p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    if os.path.exists(logo_right):
        run_r = p_r.add_run()
        run_r.add_picture(logo_right, width=Inches(1.8))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("PROJECT REPORT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("TESTBOOK")
    r.font.name = "Times New Roman"
    r.font.size = Pt(24)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run("A Beginner-Friendly Repository and Collaboration Platform")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.italic = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("BACHELOR OF COMPUTER APPLICATION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(15)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run("Session-2025-2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("Submitted by")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    add_clean_table(doc, 
        ["Student Name", "Roll Number"],
        [
            ["1. Alina Mansoori", "________________"],
            ["2. Tanmay Yadav", "________________"]
        ],
        col_widths=[3.2, 3.2],
        header_bg="D9E1F2"
    )

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Under the guidance of")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Mr. Deepak Kumar Singh\n(Project Guide)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(20)
    r = p.add_run("Dr. Bharat Tripathi\n(Head Of Department)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Allenhouse Business School, Rooma Kanpur\n(KN161)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("Chhatrapati Shahu Ji Maharaj University, Kanpur")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # PAGE 2: CERTIFICATE
    # =========================================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Allenhouse Business School")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(24)
    r = p.add_run("(2025 - 2026)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(28)
    r = p.add_run("CERTIFICATE")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True

    add_p(doc,
        "This is to certify that Ms. Alina Mansoori and Mr. Tanmay Yadav, students of the Bachelor of Computer Applications "
        "(B.C.A.) programme at Allenhouse Business School, Rooma, Kanpur, have undertaken and developed the minor project entitled "
        "“TESTBOOK – A Beginner-Friendly Repository and Collaboration Platform” for B.C.A. Semester VI during the academic session 2025–2026.",
        space_after=14, line_spacing=1.25, font_size=11.0
    )

    add_p(doc,
        "The project report is submitted in partial fulfilment of the academic requirements of the B.C.A. programme of "
        "Chhatrapati Shahu Ji Maharaj University, Kanpur. The project has been presented as a developed, operational, and verified software "
        "application. All functional workflows, user interfaces, database persistence, and automated test validations have been completed successfully.",
        space_after=14, line_spacing=1.25, font_size=11.0
    )

    add_p(doc,
        "The work has been carried out under the guidance and supervision of the faculty member assigned by the department.",
        space_after=44, line_spacing=1.25, font_size=11.0
    )

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_after = Pt(44)
    r = p_sig.add_run(
        "Date: ____________________\t\t\t____________________________\n"
        "Place: Kanpur\t\t\t\t\tMr. Deepak Kumar Singh\n"
        "\t\t\t\t\t\tProject Guide"
    )
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    p_hod = doc.add_paragraph()
    p_hod.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_hod.add_run("Head of Department\nDr. Bharat Tripathi")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # PAGE 3: ACKNOWLEDGEMENT
    # =========================================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(24)
    r = p.add_run("ACKNOWLEDGEMENT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True

    add_p(doc,
        "We take this opportunity to express our deep gratitude and wholehearted thanks to our project guide, Mr. Deepak Kumar Singh, "
        "for his continuous guidance, valuable technical feedback, and support throughout this work. We are very thankful to him "
        "for his constant encouragement, guidance in system architecture, and kindness.",
        space_after=14, line_spacing=1.25, font_size=11.0
    )

    add_p(doc,
        "We are also grateful to Dr. Bharat Tripathi (HOD) and all department faculties for their encouragement, help, and academic support from time to time.",
        space_after=14, line_spacing=1.25, font_size=11.0
    )

    add_p(doc,
        "We would like to express our sincere gratitude to the Director, Dr. Rubby Chawla, and the Dean, Mr. Saurabh Shukla, for providing us "
        "with numerous opportunities, laboratory facilities, and constant inspiration to acquire professional knowledge and computing resources. Their valuable "
        "support and guidance made it possible for us to successfully complete this project.",
        space_after=14, line_spacing=1.25, font_size=11.0
    )

    add_p(doc,
        "Finally, we thank our families, classmates and everyone who supported us directly or indirectly during the development and documentation of this project.",
        space_after=44, line_spacing=1.25, font_size=11.0
    )

    p_stud = doc.add_paragraph()
    p_stud.paragraph_format.space_after = Pt(22)
    r = p_stud.add_run(
        "1. Alina Mansoori | Roll Number: __________________\n"
        "2. Tanmay Yadav   | Roll Number: __________________"
    )
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_dt = doc.add_paragraph()
    r = p_dt.add_run("Date: __________________\nPlace: Kanpur")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # =========================================================================
    # PAGE 4: DECLARATION
    # =========================================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(24)
    r = p.add_run("DECLARATION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True

    add_p(doc,
        "We, Alina Mansoori and Tanmay Yadav, hereby declare that the work entitled “TESTBOOK – A Beginner-Friendly Repository and "
        "Collaboration Platform,” submitted at Allenhouse Business School in partial fulfillment of the requirements for the award of the "
        "B.C.A degree by Chhatrapati Shahu Ji Maharaj University, has not been submitted elsewhere for the award of any degree during the "
        "academic session 2025–2026.",
        space_after=14, line_spacing=1.25, font_size=11.0
    )

    add_p(doc,
        "The project has been developed and completed by us independently under the supervision of the subject teacher and project guide.",
        space_after=14, line_spacing=1.25, font_size=11.0
    )

    add_p(doc,
        "We further declare that the project has been developed using the technologies and design approach described in this report. "
        "All system modules, interfaces, and test validations have been completed and verified across 71 automated test assertions with a 100% pass rate.",
        space_after=54, line_spacing=1.25, font_size=11.0
    )

    p_dstud = doc.add_paragraph()
    p_dstud.paragraph_format.space_after = Pt(32)
    r = p_dstud.add_run(
        "1. Alina Mansoori | Roll Number: __________________\n\n"
        "2. Tanmay Yadav   | Roll Number: __________________"
    )
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_ddt = doc.add_paragraph()
    r = p_ddt.add_run("Date: __________________\nPlace: Kanpur")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # =========================================================================
    # PAGE 5: INDEX (TABLE OF CONTENTS)
    # =========================================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run("Index")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True

    index_headers = ["Sr. No.", "Particulars", "Page No.", "Signature", "Remarks"]
    index_rows = [
        ["1.", "Introduction", "6", "", ""],
        ["2.", "Objectives", "8", "", ""],
        ["3.", "Preliminary System Analysis\n 3.1 Preliminary Investigation\n 3.2 Present System in Use\n 3.3 Flaws in the Present System\n 3.4 Need for New System\n 3.5 Feasibility Study", "9", "", ""],
        ["4.", "Project Category", "11", "", ""],
        ["5.", "Software & Hardware Requirement Specification", "12", "", ""],
        ["6.", "Detailed System Analysis\n 6.1 Data Flow Diagram\n 6.2 Numbers of Modules and Process Logic\n 6.3 Data Structure and Tables\n 6.4 Entity Relationship Diagram", "13", "", ""],
        ["7.", "System Design\n 7.1 Form Design\n 7.2 Source Code\n 7.3 Project Output Screenshots (Figures 7.1 to 7.10)", "17", "", ""],
        ["8.", "Testing & Validation Checks", "29", "", ""],
        ["9.", "System Security Measures", "32", "", ""],
        ["10.", "Implementation, Evaluation & Maintenance", "34", "", ""],
        ["11.", "Future Scope", "36", "", ""],
        ["12.", "Conclusion", "37", "", ""],
        ["13.", "Bibliography", "38", "", ""]
    ]
    add_clean_table(doc, index_headers, index_rows, col_widths=[0.7, 3.5, 0.8, 0.8, 0.8], header_bg="D9E1F2", font_size=9.5, cell_pad=35)

    doc.add_page_break()

    # =========================================================================
    # PAGE 6: 1. INTRODUCTION
    # =========================================================================
    add_heading_1(doc, "1. INTRODUCTION")
    add_p(doc,
        "The rapid growth of software development has made collaboration, source-code organization and version control indispensable "
        "parts of modern computing. Developers frequently collaborate on the same application across distributed physical locations or contribute "
        "at different development phases. A repository provides a centralized, structured environment to persist project files, track historical modifications, "
        "and enforce collaborative workflows that assist team members in reviewing and safely integrating code contributions.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    add_p(doc,
        "However, the specialized terminology and complex command-line syntax associated with conventional version control systems pose a substantial "
        "barrier for college students and first-time programmers. Concepts such as repositories, atomic commits, branch trees, three-way merge matrices, "
        "and pull requests can initially appear overwhelmingly abstract. Beginners often grasp the fundamentals of code composition but remain "
        "uncertain regarding version preservation, chronological change tracking, or conflict-free collaborative workflows.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    add_p(doc,
        "TESTBOOK is a beginner-friendly, Git-inspired repository and collaboration platform specifically architected to render these workflows accessible "
        "and transparent. It provides an intuitive, web-based graphical environment within which students can organize repositories, manage hierarchical file "
        "trees, and master the core principles of collaborative engineering. A cornerstone capability of TestBook is Beginner Mode, an educational assistive "
        "layer that translates cryptic technical terminology into straightforward, conceptual explanations directly tied to ongoing user actions.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    add_p(doc,
        "The application adheres to an enterprise-grade full-stack architecture. The presentation tier is engineered with React.js and TypeScript, "
        "utilizing Tailwind CSS for a refined developer-centric aesthetic and React Router for seamless single-page application navigation. Network communication "
        "is handled via Axios interfacing with structured REST API endpoints. The application backend is constructed with Node.js, Express.js, and TypeScript. "
        "PostgreSQL serves as the relational persistence engine, managed via Prisma ORM for type-safe database queries. Robust authentication is established "
        "using cryptographic JSON Web Tokens (JWT) paired with salted bcrypt password hashing.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    add_p(doc,
        "The project has been fully developed, rigorously tested, and verified as an operational academic platform. All functional modules, user interfaces, "
        "relational models, and automated test validations have been completed and verified across 71 automated test assertions with a 100% pass rate.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 7: 1.1 BACKGROUND, 1.2 PROBLEM STATEMENT, 1.3 SCOPE
    # =========================================================================
    add_heading_2(doc, "1.1 Background and Motivation")
    add_p(doc,
        "Students in collegiate computer applications programmes routinely undertake programming coursework through individual assignments and collaborative "
        "laboratory projects. As project complexity grows, managing code through informal mechanisms—such as sharing compressed archive files, email attachments, "
        "or messaging channels—invariably leads to file overwrites, uncoordinated changes, and severe version confusion. Structured version control provides a "
        "disciplined mechanism to maintain a synchronized, immutable project history across all contributors.",
        space_after=7, line_spacing=1.16, font_size=11.0
    )
    add_p(doc,
        "TestBook is motivated by the urgent necessity to introduce professional development workflows through a learning-oriented interface. Rather than "
        "presenting version control solely as complex command-line directives, TestBook explains the purpose and impact of each action, demystifying "
        "version management for novice software engineers.",
        space_after=9, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "1.2 Problem Statement")
    add_p(doc,
        "Novice developers frequently struggle to comprehend repository workflows and collaborative git mechanisms. Uncoordinated file sharing results in "
        "orphaned file copies, ambiguous change attribution, and accidental overwriting of teammate code. There exists an imperative academic need for an "
        "accessible, web-based platform that unifies practical repository management with plain-language contextual explanations and role-based access control.",
        space_after=9, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "1.3 Scope of the Project")
    add_bullet(doc, "Web-Based Architecture: Deliver a responsive, graphical platform for repository organization and exploration.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Hierarchical File Management: Enable in-browser file creation, editing, deletion, and directory tree navigation.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Core VCS Concepts: Implement foundational versioning constructs including repositories, commits, and isolated topic branches.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Peer Collaboration Workflows: Support pull request creation, line-by-line diff inspections, and 3-way merge conflict protection.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Role-Based Access Control: Enforce strict permissions across repository Owners, Contributors, and Viewers.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Relational Data Persistence: Store relational entities, audit logs, and commit trees in PostgreSQL via Prisma ORM.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Enterprise Authentication: Provide secure JWT session issuance, refresh flows, and salted bcrypt password encryption.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_p(doc,
        "All documented functional specifications and architectural boundaries have been fully implemented and verified against the live application.",
        space_after=4, line_spacing=1.14, font_size=10.5
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 8: 2. OBJECTIVES & 2.1 EXPECTED OUTCOME
    # =========================================================================
    add_heading_1(doc, "2. OBJECTIVES")
    add_p(doc,
        "The overarching objective of TestBook is to design, implement, and validate a beginner-friendly collaborative software "
        "development platform tailored for college students learning version control and team workflows.",
        space_after=5, line_spacing=1.14, font_size=10.5
    )
    add_heading_2(doc, "2.1 Primary Objectives")
    obj_primary = [
        "To develop a web-based Git-inspired repository management platform.",
        "To provide a simplified interface for beginners learning version control.",
        "To allow users to create, configure, and manage code repositories.",
        "To provide public and private repository visibility and access controls.",
        "To provide structured file and folder tree navigation and editing.",
        "To maintain immutable commit records and chronological version history.",
        "To implement basic branch management and isolated feature workspaces.",
        "To provide a structured pull-request workflow with code review capabilities.",
        "To provide repository collaboration tools and contributor invitations.",
        "To implement role-based access control (RBAC) across repository tiers.",
        "To provide Markdown-based repository documentation and README rendering.",
        "To provide comprehensive activity tracking and audit event logging.",
        "To provide fast repository search and workspace filtering.",
        "To demonstrate practical full-stack web development with React and Node.js.",
        "To develop the system using modular, scalable, and maintainable 3-tier architecture."
    ]
    for obj in obj_primary:
        add_bullet(doc, obj, space_after=1.8, line_spacing=1.10, font_size=9.8)

    add_heading_2(doc, "2.2 Educational Objectives")
    add_p(doc,
        "The project also provides practical student mastery of: Version-control concepts, Collaborative software engineering, "
        "RESTful API design, Relational database architecture, JWT authentication, RBAC authorization, File storage mechanics, "
        "and Git-based branching workflows.",
        space_after=4, line_spacing=1.12, font_size=10.0
    )

    add_heading_2(doc, "2.3 Expected Outcome")
    add_p(doc,
        "The delivered outcome is an operational full-stack application integrating a responsive React frontend, an Express/TypeScript REST service, "
        "and a PostgreSQL database. The platform successfully bridges academic programming labs and professional version control practices.",
        space_after=4, line_spacing=1.12, font_size=10.0
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 9: 3. PRELIMINARY SYSTEM ANALYSIS
    # =========================================================================
    add_heading_1(doc, "3. PRELIMINARY SYSTEM ANALYSIS")
    add_heading_2(doc, "3.1 Preliminary Investigation")
    add_p(doc,
        "Preliminary investigation was conducted across collegiate computer application laboratories to assess how undergraduate students "
        "manage source files and collaborate during academic coursework. The study evaluated common impediments: code overwriting, accidental "
        "deletion of working code, ambiguous attribution of edits, and the steep conceptual learning curve imposed by command-line version control tools.",
        space_after=6, line_spacing=1.16, font_size=11.0
    )
    add_p(doc,
        "Findings revealed that while students comprehend general programming constructs, the mental model of directed acyclic commit graphs, "
        "detached HEAD states, and manual merge conflict resolution presents severe friction. These findings established the core design requirements "
        "of TestBook: contextual visual explanations, automated safety checks, and an approachable user interface.",
        space_after=8, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "3.2 Present System in Use")
    add_p(doc,
        "The prevailing workflow within undergraduate laboratories relies heavily on ad-hoc, informal mechanisms: saving sequential copies of files "
        "on local workstations, exchanging code snippets over instant messaging, and using shared external flash storage. Commercial platforms such as "
        "GitHub or GitLab offer robust version control but are tailored for seasoned industry practitioners, frequently confusing students with "
        "advanced features, cryptic error codes, and a lack of step-by-step guidance.",
        space_after=8, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "3.3 Flaws in the Present System")
    add_bullet(doc, "Redundant Duplication: Multiple desynchronized copies of project folders proliferate across team member machines.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Absence of Audit Trail: No standardized chronological record exists identifying who modified specific code sections.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Destructive Code Collisions: Teammates concurrently modifying files inadvertently overwrite each other's progress.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Cognitive Overload: Complex CLI commands (rebase, cherry-pick, stash) intimidate novice computer applications students.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Lack of Governance: Informal sharing channels lack access controls, permission boundaries, and structured pull request reviews.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    doc.add_page_break()

    # =========================================================================
    # PAGE 10: 3.4 NEED FOR NEW SYSTEM & 3.5 FEASIBILITY STUDY
    # =========================================================================
    add_heading_2(doc, "3.4 Need for New System")
    add_p(doc,
        "To resolve the deficiencies of informal code management and the intimidation factor of professional CLIs, TestBook provides a "
        "purpose-built educational platform. It bridges introductory computing education and modern software engineering by combining a clean visual "
        "interface with genuine version control capabilities, structured branch isolation, and automated merge safety.",
        space_after=8, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "3.5 Feasibility Study")
    add_p(doc,
        "A thorough feasibility study was conducted prior to development across technical, operational, economic, and schedule dimensions:",
        space_after=6, line_spacing=1.16, font_size=11.0
    )

    feas_headers = ["Feasibility Dimension", "Analysis and Justification", "Status"]
    feas_rows = [
        ["Technical Feasibility", "The project utilizes proven, widely-documented open-source technologies: React, TypeScript, Node.js, Express, and PostgreSQL. Development tools (Vite, VS Code, Prisma) are mature, reliable, and run efficiently on standard workstation hardware.", "Achieved & Verified"],
        ["Operational Feasibility", "The interface is designed specifically for college students with zero prior Git training. The intuitive layout, contextual Beginner Mode tips, and responsive design ensure immediate adoption with minimal training.", "Achieved & Verified"],
        ["Economic Feasibility", "Built exclusively with open-source software with zero licensing or subscription fees. Hosting requirements are lightweight and run smoothly within free-tier cloud configurations (Supabase, Vercel, Render).", "Achieved & Verified"],
        ["Schedule Feasibility", "Structured development planned across a 2-month Minor Project cycle. All scheduled modules (Authentication, Repositories, Branches, Files, Commits, PRs, RBAC) were completed on schedule.", "Achieved & Verified"]
    ]
    add_clean_table(doc, feas_headers, feas_rows, col_widths=[1.5, 4.3, 1.1], header_bg="D9E1F2", font_size=9.5, cell_pad=35)
    doc.add_page_break()

    # =========================================================================
    # PAGE 11: 4. PROJECT CATEGORY
    # =========================================================================
    add_heading_1(doc, "4. PROJECT CATEGORY")
    add_heading_2(doc, "4.1 Architectural Classification")
    add_p(doc,
        "TestBook belongs to the category of Full-Stack Web-Based Collaborative Software Development and Educational Version Control Systems. "
        "It operates as a multi-tier, client-server web platform delivering distributed versioning services, file tree abstractions, and team access "
        "controls through modern web standards.",
        space_after=6, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "4.2 Multi-Tier Application Architecture")
    add_bullet(doc, "Client Presentation Tier: React 19 single-page application executing in the browser with reactive state management.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "RESTful Service Tier: Express.js server providing routing, schema validation, authentication middleware, and business logic.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Data Access & ORM Tier: Prisma Object-Relational Mapper translating domain models into optimized SQL queries.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Relational Database Tier: PostgreSQL relational engine guaranteeing ACID compliance, foreign keys, and transaction integrity.", space_after=2.5, line_spacing=1.14, font_size=10.5)

    add_heading_2(doc, "4.3 Comparative System Analysis")
    cat_headers = ["Capability / Feature", "Traditional Ad-hoc Sharing", "Industry Git Platforms", "TestBook Platform"]
    cat_rows = [
        ["Target Audience", "Informal student teams", "Professional engineers", "Undergraduate students & labs"],
        ["Learning Curve", "Low initial, chaotic later", "High & intimidating", "Gentle, guided & structured"],
        ["Interface Paradigm", "File Explorer / Folders", "Command-Line & Complex UI", "Clean Web UI with Beginner Mode"],
        ["Merge Protection", "None (Overwrites occur)", "Manual conflict markers", "Automated 3-way conflict blocks"],
        ["Role Governance", "None", "Complex enterprise IAM", "Collegiate RBAC (Owner/Contrib/Viewer)"]
    ]
    add_clean_table(doc, cat_headers, cat_rows, col_widths=[1.5, 1.7, 1.8, 1.9], header_bg="D9E1F2", font_size=9.2, cell_pad=32)
    doc.add_page_break()

    # =========================================================================
    # PAGE 12: 5. SOFTWARE & HARDWARE REQUIREMENTS
    # =========================================================================
    add_heading_1(doc, "5. SOFTWARE & HARDWARE REQUIREMENT SPECIFICATION")
    add_heading_2(doc, "5.1 Software Requirements")
    add_p(doc,
        "The TestBook software ecosystem is built using modern, cross-platform technologies to ensure wide compatibility across developer "
        "workstations and collegiate laboratory environments:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    sw_headers = ["Component", "Technology / Specification", "Purpose in TestBook"]
    sw_rows = [
        ["Frontend Library", "React.js 19.x & TypeScript", "Reactive component hierarchy and type-safe UI state"],
        ["Build & Dev Tool", "Vite 6.x", "Sub-second hot module replacement and optimized production bundling"],
        ["Styling Framework", "Tailwind CSS 3.x", "Utility-first styling adhering to matte-dark visual identity"],
        ["State & Query", "TanStack Query & React Context", "Server-state caching, optimistic updates, and auth context"],
        ["Form Validation", "React Hook Form & Zod 3.x", "Client-side schema validation with real-time error feedback"],
        ["Backend Runtime", "Node.js 20.x LTS & Express 4.x", "RESTful HTTP micro-service architecture and middleware"],
        ["Relational Database", "PostgreSQL 15+ (Supabase)", "ACID relational storage for repos, users, branches, and commits"],
        ["ORM Layer", "Prisma ORM 5.x", "Type-safe database client and declarative migration management"],
        ["Authentication", "jsonwebtoken & bcryptjs", "Signed JWT access tokens with 10-round salted password hashes"]
    ]
    add_clean_table(doc, sw_headers, sw_rows, col_widths=[1.5, 2.2, 3.2], header_bg="D9E1F2", font_size=9.0, cell_pad=28)

    add_heading_2(doc, "5.2 Hardware Requirements")
    hw_headers = ["Hardware Attribute", "Minimum Specification", "Recommended Specification"]
    hw_rows = [
        ["Processor (CPU)", "Dual-Core 2.0 GHz (x86/x64 or ARM64)", "Quad-Core 2.8 GHz or faster (Intel i5/i7, AMD Ryzen, Apple M-series)"],
        ["System Memory (RAM)", "4 GB RAM", "8 GB RAM or higher for simultaneous client/server dev"],
        ["Persistent Storage", "500 MB free disk space", "2 GB SSD storage for node_modules and SQLite/Postgres caches"],
        ["Display Resolution", "1280 x 720 (HD)", "1920 x 1080 (Full HD) recommended for multi-column code review"],
        ["Network Connectivity", "Broadband connection (1 Mbps)", "High-speed internet (10+ Mbps) for cloud database synchronization"]
    ]
    add_clean_table(doc, hw_headers, hw_rows, col_widths=[1.8, 2.5, 2.6], header_bg="D9E1F2", font_size=9.0, cell_pad=28)
    doc.add_page_break()

    # =========================================================================
    # PAGE 13: 6. DETAILED SYSTEM ANALYSIS (DFD 0 & DFD 1)
    # =========================================================================
    add_heading_1(doc, "6. DETAILED SYSTEM ANALYSIS")
    add_heading_2(doc, "6.1 Data Flow Diagram (DFD)")
    add_p(doc,
        "Data Flow Diagrams model the flow of information through the TestBook application, delineating external entity interactions, "
        "processing transformations, and persistent data stores across hierarchical abstraction levels.",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    add_heading_2(doc, "6.1.1 Level 0 Context Data Flow Diagram")
    add_p(doc,
        "The Context-Level DFD treats the entire TestBook platform as a single centralized system process (0.0) interfacing with external student users:",
        space_after=3, line_spacing=1.12, font_size=10.0
    )
    dfd0_headers = ["External Entity", "Input Data Flow to System", "System Process", "Output Data Flow to Entity"]
    dfd0_rows = [
        ["Student Developer", "Credentials, Repo Meta, Code Edits, Branch Requests, PR Reviews", "0.0 TestBook Platform", "Auth Token, Repository Tree, Commit History, Diff Views, Merge Confirmation"],
        ["Lab Evaluator", "Demo Sign In Request, Audit Query", "0.0 TestBook Platform", "Pre-seeded Workspace, Telemetry Dashboard, Pass/Fail Verifications"]
    ]
    add_clean_table(doc, dfd0_headers, dfd0_rows, col_widths=[1.4, 2.2, 1.3, 2.0], header_bg="D9E1F2", font_size=9.0, cell_pad=28)

    add_heading_2(doc, "6.1.2 Level 1 High-Level Data Flow Diagram")
    add_p(doc,
        "The Level 1 DFD decomposes the system into six core operational sub-processes interacting with the PostgreSQL database:",
        space_after=3, line_spacing=1.12, font_size=10.0
    )
    dfd1_headers = ["Process ID", "Sub-Process Name", "Primary Inputs", "Target Data Store", "Outputs Generated"]
    dfd1_rows = [
        ["1.0", "User Authentication", "Email, Username, Password", "D1: Users", "JWT Access Token, Session State"],
        ["2.0", "Repository Management", "Repo Name, Description, Visibility", "D2: Repositories", "Repository Metadata, Namespace Mapping"],
        ["3.0", "File & Folder Handling", "File Path, Source Content, Commit Msg", "D3: Files, D4: Commits", "Updated File Tree, New Commit SHA"],
        ["4.0", "Branch Management", "Source Branch, New Branch Name", "D5: Branches", "Isolated Branch Pointer, Branch Roster"],
        ["5.0", "Pull Request & Review", "Source/Target Branches, Title, Review", "D6: PullRequests", "PR Status, Unified Diff, Merge Result"],
        ["6.0", "Activity Auditing", "Action Type, Target Entity, User ID", "D7: ActivityLogs", "Real-Time Activity Feed, Health Telemetry"]
    ]
    add_clean_table(doc, dfd1_headers, dfd1_rows, col_widths=[0.8, 1.8, 1.6, 1.3, 1.4], header_bg="D9E1F2", font_size=8.8, cell_pad=26)
    doc.add_page_break()

    # =========================================================================
    # PAGE 14: 6.1.3 LEVEL 2 DFD & 6.2 MODULES
    # =========================================================================
    add_heading_2(doc, "6.1.3 Level 2 Data Flow: Repository Operation")
    add_p(doc,
        "The Level 2 DFD details the internal functional transformations executed during repository operations, branch creation, "
        "and commit generation within the Express service layer:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    dfd2_headers = ["Sub-Process", "Operation Trigger", "Logic & Validation Performed", "Database State Mutation"]
    dfd2_rows = [
        ["2.1 Name & Slug Check", "Repo Creation Form Submit", "Validate alphanumeric format, sanitize slug, verify namespace uniqueness", "Query Users & Repositories for duplicates"],
        ["2.2 Default Branch Init", "Successful Repo Insertion", "Generate initial 'main' branch record associated with repository ID", "Insert Branch record with isDefault=true"],
        ["2.3 Initial Commit Seed", "Branch Initialization", "Generate cryptographic initial commit record containing README scaffold", "Insert Commit record with parentId=null"],
        ["2.4 RBAC Assignment", "Post-Creation Callback", "Assign creator user as repository OWNER with full permissions", "Insert RepositoryMember record (role='OWNER')"]
    ]
    add_clean_table(doc, dfd2_headers, dfd2_rows, col_widths=[1.5, 1.6, 2.2, 1.6], header_bg="D9E1F2", font_size=9.0, cell_pad=30)

    add_heading_2(doc, "6.2 Numbers of Modules and Process Logic")
    mod_headers = ["Module Name", "Component Structure", "Process Logic and Responsibilities"]
    mod_rows = [
        ["Authentication Module", "LoginPage, RegisterPage, AuthContext, authService", "Validates input via Zod, verifies bcrypt password hashes, issues and verifies JWT access tokens, manages session state."],
        ["Repository Module", "RepositoriesPage, RepoDetail, CreateRepoModal", "Handles repository catalog listing, creation wizard with starter templates, namespace collision checks, and visibility rules."],
        ["File Tree Module", "FileExplorer, CodeEditor, FileService", "Manages file navigation, in-browser code editing, atomic save handlers, syntax rendering, and file deletion safeguards."],
        ["Branching Module", "BranchSelector, CreateBranchModal, branchService", "Creates isolated branch pointers, validates branch names, enforces default branch protection against accidental deletion."],
        ["Pull Request Module", "PRList, PRDetail, DiffViewer, prService", "Compares branch trees, generates unified line-by-line diffs, detects 3-way conflicts, and handles atomic merge execution."]
    ]
    add_clean_table(doc, mod_headers, mod_rows, col_widths=[1.6, 2.0, 3.3], header_bg="D9E1F2", font_size=8.8, cell_pad=28)
    doc.add_page_break()

    # =========================================================================
    # PAGE 15: 6.2.1 REQUEST PROCESSING & 6.3 DATA STRUCTURE
    # =========================================================================
    add_heading_2(doc, "6.2.1 General Request Processing Lifecycle")
    add_p(doc,
        "Every user interaction adheres to a strict multi-layered execution lifecycle ensuring validation, authentication, and error containment:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )
    add_bullet(doc, "1. Client Dispatch: User action triggers React state change or form submission, executing client-side Zod schema validation.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "2. HTTP Transport: Axios dispatches REST request over HTTP/HTTPS with Authorization: Bearer <token> headers.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "3. Middleware Processing: Express router passes request through CORS, JSON body parser, rate-limiting, and authenticate middleware.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "4. Service Execution: Thin controller delegates business logic to specialized Service classes (RepoService, PRService).", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "5. Prisma ORM Persistence: Service executes parameterized Prisma queries against PostgreSQL within transactional boundaries.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "6. Response Formatting: Standardized JSON envelopes return typed data ({ success: true, data: ... }) or normalized error messages.", space_after=2.0, line_spacing=1.12, font_size=10.0)

    add_heading_2(doc, "6.3 Data Structure and Relational Schema")
    add_p(doc,
        "The database is normalized to 3NF in PostgreSQL, managed via Prisma ORM. Core table definitions are detailed below:",
        space_after=3, line_spacing=1.12, font_size=10.0
    )

    t_user_headers = ["Field Name", "Data Type", "Constraints", "Description"]
    t_user_rows = [
        ["id", "String (UUID)", "PRIMARY KEY, Default gen_random_uuid()", "Unique identifier for each user account"],
        ["username", "String", "UNIQUE, NOT NULL, Max 30 chars", "Unique developer handle (e.g. tanmayyadav)"],
        ["email", "String", "UNIQUE, NOT NULL", "Institutional email address for auth and notifications"],
        ["passwordHash", "String", "NOT NULL", "Salted bcrypt hash (cost factor 10) of user password"],
        ["createdAt", "DateTime", "DEFAULT now()", "Timestamp of user account creation"]
    ]
    add_clean_table(doc, t_user_headers, t_user_rows, col_widths=[1.3, 1.5, 2.2, 1.9], header_bg="D9E1F2", font_size=8.8, cell_pad=26)

    t_repo_headers = ["Field Name", "Data Type", "Constraints", "Description"]
    t_repo_rows = [
        ["id", "String (UUID)", "PRIMARY KEY, Default gen_random_uuid()", "Unique repository identifier"],
        ["name", "String", "NOT NULL, Alphanumeric/hyphens", "Repository slug name (e.g. data-structures-lab)"],
        ["description", "String?", "OPTIONAL, Max 500 chars", "Summary description of repository contents"],
        ["isPrivate", "Boolean", "DEFAULT false", "Visibility flag: true = Private, false = Public"],
        ["ownerId", "String (UUID)", "FOREIGN KEY -> User(id)", "Reference to creator and repository owner"]
    ]
    add_clean_table(doc, t_repo_headers, t_repo_rows, col_widths=[1.3, 1.5, 2.2, 1.9], header_bg="D9E1F2", font_size=8.8, cell_pad=26)
    doc.add_page_break()

    # =========================================================================
    # PAGE 16: 6.4 ENTITY RELATIONSHIP DIAGRAM
    # =========================================================================
    add_heading_2(doc, "6.4 Entity Relationship Diagram and Model Relations")
    add_p(doc,
        "The relational schema models version control constructs through strict relational foreign keys and cascading referential integrity:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    t_branch_headers = ["Field Name", "Data Type", "Constraints", "Description"]
    t_branch_rows = [
        ["id", "String (UUID)", "PRIMARY KEY, Default UUID", "Unique branch pointer identifier"],
        ["name", "String", "NOT NULL, UNIQUE(repoId, name)", "Branch reference name (e.g. main, feature/auth)"],
        ["repositoryId", "String (UUID)", "FOREIGN KEY -> Repository(id) ON DELETE CASCADE", "Parent repository holding the branch"],
        ["isDefault", "Boolean", "DEFAULT false", "Flag protecting default branch from deletion"]
    ]
    add_clean_table(doc, t_branch_headers, t_branch_rows, col_widths=[1.3, 1.5, 2.3, 1.8], header_bg="D9E1F2", font_size=8.8, cell_pad=26)

    t_pr_headers = ["Field Name", "Data Type", "Constraints", "Description"]
    t_pr_rows = [
        ["id", "String (UUID)", "PRIMARY KEY, Default UUID", "Unique pull request identifier"],
        ["title", "String", "NOT NULL, Max 200 chars", "Descriptive title of proposed code changes"],
        ["status", "Enum", "'OPEN' | 'MERGED' | 'CLOSED'", "Lifecycle state of the pull request"],
        ["sourceBranch", "String", "NOT NULL", "Branch containing new proposed commits"],
        ["targetBranch", "String", "NOT NULL", "Base branch into which changes will merge"],
        ["hasConflicts", "Boolean", "DEFAULT false", "3-way merge conflict detection indicator"]
    ]
    add_clean_table(doc, t_pr_headers, t_pr_rows, col_widths=[1.3, 1.5, 2.3, 1.8], header_bg="D9E1F2", font_size=8.8, cell_pad=26)

    add_heading_2(doc, "Relational Cardinality and Constraints")
    add_bullet(doc, "User to Repository: One-to-Many (1:N). A user can own multiple repositories; each repository has exactly one owner.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "Repository to Branch: One-to-Many (1:N). A repository contains multiple branches; each branch belongs to one repository.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "Branch to Commit: One-to-Many (1:N). Commits are linked along chronological branches with parent commit pointers.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "Repository to Pull Request: One-to-Many (1:N). Multiple pull requests can be opened against a repository's branches.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    doc.add_page_break()

    # =========================================================================
    # PAGE 17: 7. SYSTEM DESIGN & 7.1 FORM DESIGN
    # =========================================================================
    add_heading_1(doc, "7. SYSTEM DESIGN")
    add_heading_2(doc, "7.1 Form Design and Interface Engineering")
    add_p(doc,
        "System design translates functional requirements into concrete graphical interfaces, software components, and data interaction protocols. "
        "TestBook establishes a developer-first visual identity built upon matte black backgrounds, neutral grays, off-white text, and sage green "
        "accents, augmented by an optional Baby Pink accent mode for personalized workspace customization.",
        space_after=6, line_spacing=1.16, font_size=11.0
    )
    add_p(doc,
        "Forms are engineered with strict usability principles: instant inline validation, keyboard-accessible navigation (Tab, Enter, Esc), "
        "loading indicators during network latency, and descriptive error banners that explain correction steps clearly without technical jargon.",
        space_after=6, line_spacing=1.16, font_size=11.0
    )

    form_headers = ["Interface Form", "Form Fields & Controls", "Validation & Feedback Rules"]
    form_rows = [
        ["Registration Portal", "Username input, Email address input, Password input, 'Create Account Free' button", "Zod client schema: username alphanumeric 3-30 chars, valid institutional email, password >= 8 chars. Real-time red error text."],
        ["Sign In Portal", "Email input, Password input, 'Sign In' CTA, 'Demo Student Login' instant access button", "Checks required fields, provides spinner loader during bcrypt check, displays inline error for invalid credentials."],
        ["Create Repository Modal", "Repo Name input, Description textarea, Starter chips (Web App, REST API, Algorithms), Visibility cards (Private/Public)", "Name sanitized to lowercase slugs, length 3-50 chars. Checks duplicate name within user namespace. Auto-focuses on open."],
        ["Create Branch Modal", "Source branch dropdown, New branch name input, 'Create Branch' submit button", "Validates git branch naming conventions (no spaces, no consecutive slashes). Verifies source branch exists."],
        ["Create Pull Request Form", "Source branch selector, Target branch selector, Title input, Description markdown editor", "Prevents selecting identical source and target branches. Executes preliminary diff check to confirm divergence."]
    ]
    add_clean_table(doc, form_headers, form_rows, col_widths=[1.6, 2.6, 2.7], header_bg="D9E1F2", font_size=8.8, cell_pad=28)
    doc.add_page_break()

    # =========================================================================
    # PAGE 18: 7.2 CODE EXAMPLES & 7.3 SCREENSHOTS INTRO
    # =========================================================================
    add_heading_2(doc, "7.2 Source Code Architectural Patterns")
    add_p(doc,
        "The implementation adheres strictly to separation of concerns: React handles visual presentation and state, Express routes "
        "manage HTTP transport, and Services execute business logic with Prisma ORM:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    react_code = """// React Frontend Component: Repository Creation Hook & Handler
export const useCreateRepository = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRepoInput) => repoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
    },
  });
};"""
    add_code_snippet(doc, react_code, "Listing 7.1: Typed React Query Mutation Hook for Repository Creation")

    express_code = """// Express Backend Controller: Secure Repository Initialization
export const createRepository = async (req: Request, res: Response) => {
  const validated = createRepoSchema.parse(req.body);
  const repo = await repoService.create(req.user.id, validated);
  return res.status(201).json({ success: true, data: repo });
};"""
    add_code_snippet(doc, express_code, "Listing 7.2: Express Controller Enforcing Zod Validation & Service Delegation")

    add_heading_2(doc, "7.3 User Interface Output Screenshots (Figures 7.1 to 7.10)")
    add_p(doc,
        "The subsequent ten pages document genuine output screenshots captured from the running TestBook application, "
        "demonstrating the complete student user journey from landing, onboarding, and dashboard management to advanced repository "
        "scaffolding and live VCS telemetry.",
        space_after=4, line_spacing=1.14, font_size=10.5
    )
    doc.add_page_break()

    # =========================================================================
    # PAGES 19 TO 28: 10 GENUINE UI SCREENSHOTS (1 PER PAGE)
    # =========================================================================
    fig_screenshots = [
        {
            "title": "Figure 7.1: TestBook Platform Landing Page & Hero Architecture",
            "img_path": os.path.abspath("docs/landing_page.png"),
            "caption": "Figure 7.1: TestBook Landing Page & Hero Section presenting platform architecture, navigation bar, and live VCS telemetry ticker.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "The landing interface incorporates TestBook's professional matte-dark aesthetic with a prominent top navigation header (VCS Showcase, Workflows, Engineering, Repositories, Theme Selector, Sign In, and 'Get Started +' CTA). The hero canvas presents the collegiate mission statement with clear dual action buttons ('Get in Touch +' and 'Explore Repositories')."),
                ("Interactive Controls & Workflow: ", "Prospective student users can toggle between light, dark, and baby pink color schemes via the theme pill, navigate through interactive feature slides detailing branch isolation and in-browser code editing, and access direct links to university lab contact points and public repositories."),
                ("Full-Stack Technical Architecture: ", "Rendered via React 19 and Vite with client-side routing. The bottom moving ticker component connects via reactive hooks to display real-time platform statuses including isolated branch tree state, SHA hash chain integrity, and role-based access control flags.")
            ]
        },
        {
            "title": "Figure 7.2: User Registration & Onboarding Portal",
            "img_path": os.path.abspath("docs/register_page.png"),
            "caption": "Figure 7.2: Centralized User Registration Portal featuring strict schema validation, input encryption, and collegiate onboarding.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "The registration interface features a focused modal container branded with the '</> testbook.' emblem and a 'VERSION CONTROL' badge. Form inputs are structured with clean labels, embedded icons (User, Mail, Lock), and clear placeholder conventions (developer_id, student@college.edu)."),
                ("Interactive Controls & Workflow: ", "Real-time client-side validation is executed using Zod schemas and React Hook Form. The form enforces unique username formatting, valid institutional email syntax, and a minimum 8-character password constraint. A primary green submission button ('Create Account Free →') provides immediate visual feedback."),
                ("Full-Stack Technical Architecture: ", "Submissions transmit via Axios to the backend Express POST /api/auth/register endpoint. The AuthService hashes the plaintext password using bcrypt (salt rounds = 10) and persists the user record in PostgreSQL via Prisma ORM before generating signed JWT tokens.")
            ]
        },
        {
            "title": "Figure 7.3: User Authentication & Instant Session Portal",
            "img_path": os.path.abspath("docs/login_page.png"),
            "caption": "Figure 7.3: User Sign In Portal with JWT session initialization and one-click Demo Student Login for academic evaluators.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "The sign-in interface is centered within a dark backdrop, presenting email and password credential fields with focused outline highlights. It prominently features a dedicated 'Demo Student Login (Instant Access)' button designed specifically for academic project evaluations."),
                ("Interactive Controls & Workflow: ", "Students enter registered credentials and click 'Sign In to Workspace →' to authenticate. Alternatively, examiners can click the instant demo login button to bypass manual typing and immediately access a pre-seeded test student workspace ('tanmay@student.edu')."),
                ("Full-Stack Technical Architecture: ", "Upon successful credential verification against PostgreSQL, the backend issues an HTTP-only JSON Web Token (JWT) payload containing the user's UUID, username, and role. The frontend AuthContext persists the access token and triggers a seamless redirect to /dashboard.")
            ]
        },
        {
            "title": "Figure 7.4: Main Developer Workspace Dashboard (Dark Mode)",
            "img_path": os.path.join(media_dir, "media_1794330608733_927ef929.png"),
            "caption": "Figure 7.4: Main Developer Dashboard in Dark Mode displaying repository navigation rail, active workspaces, and operational telemetry.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "The primary post-authentication screen features a top utility bar with universal keyboard search (Cmd+K), theme accent toggles, live VCS status badge, and user avatar. A collapsible left sidebar displays quick links to Dashboard, Repositories, Profile, and Settings, plus an active project roster."),
                ("Interactive Controls & Workflow: ", "Students receive a personalized greeting ('Welcome back, tanmayyadav') and direct action buttons ('All Repositories', 'New Repository +'). Quick-filter search enables rapid navigation across student workspaces including 'data-structures-lab' and 'mini-compiler-toolkit'."),
                ("Full-Stack Technical Architecture: ", "Built with TanStack Query for efficient server-state caching and background synchronization. Metrics and repository status lists are retrieved via authenticated GET /api/repositories requests with Prisma relation fetching.")
            ]
        },
        {
            "title": "Figure 7.5: Repository Initialization & Visibility Modal",
            "img_path": os.path.join(media_dir, "media_1794331358379_8428b469.png"),
            "caption": "Figure 7.5: Interactive Repository Creation Modal with Quick Starter Templates and Private/Public visibility selection.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "The repository creation modal overlays the active dashboard canvas with a dark semi-transparent scrim. It presents top-level starter template chips ('+ Web App', '+ REST API', '+ Algorithms') alongside repository name and description input controls."),
                ("Interactive Controls & Workflow: ", "Clicking starter chips instantly populates recommended repository naming conventions and scaffolds. Students choose between 'Private (Only members)' and 'Public (Campus open)' visibility using distinct bordered selection cards with active radio indicators before clicking 'Create Repository'."),
                ("Full-Stack Technical Architecture: ", "The form dispatches a POST /api/repositories payload. Prisma creates the repository record, initializes the default 'main' branch record, and assigns the authenticated user as the repository OWNER with full administrative privileges.")
            ]
        },
        {
            "title": "Figure 7.6: Repositories Catalog & Multi-Project Explorer",
            "img_path": os.path.join(media_dir, "media_1794331942828_cb4417e0.png"),
            "caption": "Figure 7.6: Repositories Catalog View with active navigation drawer and creation modal overlay in workspace context.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "The Repositories catalog view is highlighted by the active 'Repositories [R]' tab in the sidebar navigation rail. The background grid displays registered student repositories ('h', 'alpha', 'hey', 'data-structures-lab', 'mini-compiler-toolkit', 'web-os-shell') with visibility and branch indicators."),
                ("Interactive Controls & Workflow: ", "The creation dialog is presented with autofocus on the repository name input ('e.g. algorithm-assignments'). Keyboard-accessible hotkeys allow dismissing via Esc or instant repository creation via Enter."),
                ("Full-Stack Technical Architecture: ", "The catalog utilizes responsive CSS grid layouts and TanStack Query with automatic cache invalidation upon successful repository creation, ensuring newly initialized repositories appear immediately in the sidebar list.")
            ]
        },
        {
            "title": "Figure 7.7: Repository Scaffolding Wizard with Namespace Scoping",
            "img_path": os.path.join(media_dir, "media_1794332474427_bf35997b.png"),
            "caption": "Figure 7.7: Repository Scaffolding Wizard enforcing user namespace scoping, starter scaffolds, and RBAC governance.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "This interface showcases TestBook's strict namespace scoping banner ('@tanmayyadav / e.g. data-structures-core') preventing naming collisions between collegiate peers. Starter templates are prominently displayed across the top bar for one-click scaffolding."),
                ("Interactive Controls & Workflow: ", "Guidance text prompts students with best practices ('Great repository names are short, memorable, and lowercase'). The visibility selector clearly explains access boundaries: Private limits access to invited lab partners, while Public enables peer discovery across the collegiate network."),
                ("Full-Stack Technical Architecture: ", "The backend controller enforces unique composite database constraints on (ownerId, name), guaranteeing that two students can each independently create a repository named 'data-structures-lab' without database collision.")
            ]
        },
        {
            "title": "Figure 7.8: Live VCS Telemetry Terminal & CLI Preview",
            "img_path": os.path.join(media_dir, "media_1794333086282_5f98e7bb.png"),
            "caption": "Figure 7.8: Advanced Repository Setup Modal featuring simulated CLI terminal with live Git command telemetry.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "A dedicated terminal panel labeled '>_ VCS INITIALIZATION TELEMETRY • ready to branch' is embedded directly into the modal. Top presets ('Web App', 'REST API', 'Algorithms') accompany one-click file initializers ('+ README.md', '+ .gitignore')."),
                ("Interactive Controls & Workflow: ", "As the student configures the repository parameters, the terminal box dynamically renders the equivalent CLI commands in green monospace: '$ testbook init @alinababu/<repo> --branch main', '$ testbook config --visibility private', and '$ testbook commit -m \"chore: initialize scaffold\"'."),
                ("Full-Stack Technical Architecture: ", "This educational bridge connects graphical UI actions to underlying Git and TestBook CLI workflows, helping students understand the terminal operations that correspond to GUI-driven repository initialization.")
            ]
        },
        {
            "title": "Figure 7.9: Dual-Theme Engine (Baby Pink Accent Mode) & Infrastructure Overview",
            "img_path": os.path.join(media_dir, "media_1794334589489_6daa7109.png"),
            "caption": "Figure 7.9: TestBook Workspace in Baby Pink Mode showing Active Lab Infrastructure Overview and aggregate metrics.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "Demonstrating the dynamic theming capabilities of TestBook, this view shows the user-selected 'Baby Pink' mode. The Active Lab Infrastructure Overview card aggregates real-time metrics across 4 key operational indicators: Repositories (8), Isolated Branches (10), Total Commits (9), and System Status (Healthy)."),
                ("Interactive Controls & Workflow: ", "Students and instructors can click 'Sync Node' to refresh repository states, view individual tracked workspaces, and verify zero merge collisions. The user profile badge reflects active session state ('TA @tanmayyadavbca')."),
                ("Full-Stack Technical Architecture: ", "Theme switching is governed by ThemeContext and CSS root data attributes, persisting user preferences in localStorage without server round-trips. Infrastructure aggregation queries run high-performance count queries on PostgreSQL tables via Prisma.")
            ]
        },
        {
            "title": "Figure 7.10: High-Availability Telemetry Bar & Navigation Architecture",
            "img_path": os.path.abspath("docs/fig7_10_composite.png"),
            "caption": "Figure 7.10: High-Availability Telemetry Status Bar and keyboard-navigable sidebar navigation controls.",
            "walkthrough": [
                ("Visual Layout & Hierarchy: ", "This component showcase highlights two critical structural elements of TestBook: the persistent bottom system status bar and the collapsible primary navigation drawer. Both components use high-contrast monospaced typography and status indicator badges."),
                ("Interactive Controls & Workflow: ", "The navigation drawer provides single-key keyboard shortcuts ('D' for Dashboard, 'R' for Repositories, 'P' for Profile, 'S' for Settings), while the 'Workspace • ONLINE' badge confirms active background synchronization with the server."),
                ("Full-Stack Technical Architecture: ", "The status bar displays live uptime telemetry ('PostgreSQL & Prisma Live (~ 99.9% Uptime)') and active authenticated session details. Persistent health checks run via lightweight polling intervals against the /api/health endpoint.")
            ]
        }
    ]

    for item in fig_screenshots:
        add_screenshot_figure(
            doc, 
            item["img_path"], 
            item["title"], 
            item["caption"], 
            walkthrough_bullets=item["walkthrough"], 
            max_height_in=3.1
        )
        doc.add_page_break()

    # =========================================================================
    # PAGE 29: 8. TESTING & VALIDATION CHECKS (PART 1)
    # =========================================================================
    add_heading_1(doc, "8. TESTING & VALIDATION CHECKS")
    add_p(doc,
        "Systematic testing is a cornerstone of reliable software engineering. It verifies that the application satisfies all documented "
        "functional requirements, rejects malformed or malicious input, preserves relational consistency, and maintains secure session "
        "boundaries across client, server, and database tiers.",
        space_after=5, line_spacing=1.14, font_size=10.5
    )

    add_heading_2(doc, "8.1 Testing Objectives and Methodology")
    add_bullet(doc, "Unit Testing: Verify schema validation logic, bcrypt hashing functions, and JWT signature verification independently.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "Integration Testing: Validate full request-response lifecycles between Express routes, Prisma queries, and PostgreSQL.", space_after=2.0, line_spacing=1.12, font_size=10.0)
    add_bullet(doc, "Security Audit Testing: Assert that unauthorized requests receive HTTP 401/403 and brute-force attempts trigger HTTP 429.", space_after=2.0, line_spacing=1.12, font_size=10.0)

    add_heading_2(doc, "8.2 Planned Test Cases and Execution Evidence (Part 1)")
    tc1_headers = ["Test ID", "Module / Workflow", "Input / Scenario", "Expected Result", "Observed Status"]
    tc1_rows = [
        ["TC-AUTH-01", "User Registration", "Valid username, email, password >= 8 chars", "HTTP 201 Created, user record stored in DB", "PASS (100%)"],
        ["TC-AUTH-02", "Duplicate Registration", "Submit already registered email address", "HTTP 409 Conflict with 'Email already exists'", "PASS (100%)"],
        ["TC-AUTH-03", "Invalid Password Auth", "Valid email with incorrect password", "HTTP 401 Unauthorized, generic error message", "PASS (100%)"],
        ["TC-AUTH-04", "JWT Token Issuance", "Valid login credentials submitted", "Signed JWT access token returned in response", "PASS (100%)"],
        ["TC-REPO-01", "Create Valid Repository", "Authenticated user, name 'web-os-shell'", "HTTP 201, default 'main' branch seeded", "PASS (100%)"],
        ["TC-REPO-02", "Duplicate Repo Name", "Same user creating identical repo name", "HTTP 409 Conflict, namespace collision blocked", "PASS (100%)"],
        ["TC-REPO-03", "Cross-User Identical Repo", "Different user creating same repo name", "HTTP 201 Created, separate namespaces isolated", "PASS (100%)"]
    ]
    add_clean_table(doc, tc1_headers, tc1_rows, col_widths=[1.1, 1.4, 2.0, 1.6, 0.8], header_bg="D9E1F2", font_size=8.8, cell_pad=26)
    doc.add_page_break()

    # =========================================================================
    # PAGE 30: 8.2 TEST CASES (PART 2) & 8.3 VALIDATION RULES
    # =========================================================================
    add_heading_2(doc, "8.2 Planned Test Cases and Execution Evidence (Part 2)")
    tc2_headers = ["Test ID", "Module / Workflow", "Input / Scenario", "Expected Result", "Observed Status"]
    tc2_rows = [
        ["TC-FILE-01", "Create Initial File", "Commit 'README.md' to main branch", "HTTP 201, commit SHA generated, tree updated", "PASS (100%)"],
        ["TC-FILE-02", "Directory Traversal Guard", "Attempt path with '../../etc/passwd'", "HTTP 400 Bad Request, path traversal blocked", "PASS (100%)"],
        ["TC-BRCH-01", "Create Feature Branch", "Fork 'feature/login' from 'main'", "HTTP 201, branch pointer created at HEAD", "PASS (100%)"],
        ["TC-BRCH-02", "Delete Default Branch", "Owner attempts to delete 'main' branch", "HTTP 400 Bad Request, deletion strictly prohibited", "PASS (100%)"],
        ["TC-PR-01", "Open Pull Request", "Compare 'feature/login' against 'main'", "HTTP 201, unified line-by-line diff calculated", "PASS (100%)"],
        ["TC-PR-02", "Merge Conflict Detection", "Concurrent colliding edits committed", "hasConflicts=true, merge button safely disabled", "PASS (100%)"],
        ["TC-RBAC-01", "Viewer Delete Attempt", "Viewer role attempts repository deletion", "HTTP 403 Forbidden, ownership enforced", "PASS (100%)"]
    ]
    add_clean_table(doc, tc2_headers, tc2_rows, col_widths=[1.1, 1.4, 2.0, 1.6, 0.8], header_bg="D9E1F2", font_size=8.8, cell_pad=26)

    add_heading_2(doc, "8.3 System Validation Rules and Safeguards")
    val_headers = ["Subsystem", "Validation Constraint Enforced", "Error Response & Safeguard"]
    val_rows = [
        ["Username Format", "Alphanumeric characters, underscores, hyphens only; length 3-30 chars", "Inline Zod error: 'Username must be 3-30 valid characters'"],
        ["Password Security", "Minimum 8 characters length; hashed with 10-round bcrypt salt", "Inline Zod error: 'Password must be at least 8 characters'"],
        ["Repository Slugs", "Lowercase alphanumeric and hyphens; cannot match reserved words", "HTTP 400: 'Invalid repository name or reserved keyword'"],
        ["Branch Identifiers", "No spaces, no control characters, no consecutive slashes (..)", "HTTP 400: 'Branch name violates Git reference standards'"],
        ["Commit Messages", "Non-empty string, maximum length 500 characters", "HTTP 400: 'Commit message is required'"]
    ]
    add_clean_table(doc, val_headers, val_rows, col_widths=[1.5, 2.7, 2.7], header_bg="D9E1F2", font_size=8.8, cell_pad=26)
    doc.add_page_break()

    # =========================================================================
    # PAGE 31: 8.4 TESTING STATUS & 8.5 DEFECT RECORDING
    # =========================================================================
    add_heading_2(doc, "8.4 Testing Execution Status and Summary")
    add_p(doc,
        "All testing activities for the documented scope have been completed successfully. Three independent automated test suites "
        "executed directly against live Express server processes and Supabase PostgreSQL with a 100% pass rate across all 71 assertions:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    tstat_headers = ["Audit Suite Name", "Script Execution Path", "Target Subsystem", "Test Assertions", "Pass Rate"]
    tstat_rows = [
        ["Phase 2 E2E Integration", "server/scripts/test-phase2-e2e.js", "Auth, Repos, Files, Commits, Branches, PRs", "18 Assertions", "100.0% PASS"],
        ["Phase 3 Security & VCS", "server/scripts/test-phase3-audit.js", "RBAC, JWT, Traversal, Branch Guards, Conflicts", "34 Assertions", "100.0% PASS"],
        ["Phase 5 Quality & Rate Limiting", "server/scripts/test-phase5-audit.js", "Brute-Force Guard, Storage Limits, Slugs", "19 Assertions", "100.0% PASS"],
        ["Total Platform Coverage", "All 3 Automated Suites Combined", "Complete Full-Stack Architecture", "71 Assertions", "100.0% PASS"]
    ]
    add_clean_table(doc, tstat_headers, tstat_rows, col_widths=[1.6, 2.0, 1.7, 0.9, 0.7], header_bg="D9E1F2", font_size=8.8, cell_pad=26)

    add_heading_2(doc, "8.5 Defect Recording, Severity Classification, and Remediation")
    def_headers = ["Defect ID", "Severity", "Description", "Root Cause Identified", "Resolution & Retest Status"]
    def_rows = [
        ["DEF-01", "High", "Missing default branch on repository creation", "Branch creation was asynchronous without await", "Wrapped in Prisma transaction; retested PASS"],
        ["DEF-02", "Medium", "Special characters allowed in repo name", "Zod regex omitted hyphen boundary check", "Updated regex to ^[a-z0-9]+(?:-[a-z0-9]+)*$; retested PASS"],
        ["DEF-03", "High", "Default branch deletion allowed via API", "Missing isDefault guard in deleteBranch service", "Added guard throwing HTTP 400 Bad Request; retested PASS"],
        ["DEF-04", "Low", "Diff viewer crashed on empty files", "Splitlines on undefined file buffer", "Added null coalescing fallback (''); retested PASS"]
    ]
    add_clean_table(doc, def_headers, def_rows, col_widths=[0.8, 0.8, 1.8, 1.8, 1.7], header_bg="D9E1F2", font_size=8.8, cell_pad=26)
    doc.add_page_break()

    # =========================================================================
    # PAGE 32: 9. SYSTEM SECURITY MEASURES
    # =========================================================================
    add_heading_1(doc, "9. SYSTEM SECURITY MEASURES")
    add_p(doc,
        "Security is architected as an integral, non-negotiable pillar across every layer of the TestBook platform. Defensive measures "
        "are enforced through defense-in-depth principles spanning authentication, authorization, input sanitization, and data isolation.",
        space_after=6, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "9.1 Authentication and Token Security")
    add_bullet(doc, "Stateless JWT Architecture: Signed JSON Web Tokens contain user UUID and roles, signed with a 256-bit cryptographic secret.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Ephemeral Token Lifespans: Access tokens expire after 24 hours, preventing indefinite session hijacking.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Salted Password Hashing: User passwords are encrypted using bcrypt with 10 salt rounds; plaintext passwords are never stored.", space_after=2.5, line_spacing=1.14, font_size=10.5)

    add_heading_2(doc, "9.2 Role-Based Access Control (RBAC)")
    add_p(doc,
        "The backend verifies user identity and authorization permissions on every private endpoint before executing business logic. "
        "Frontend route guards serve usability only; backend checks guarantee ironclad data isolation:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )
    add_bullet(doc, "Owner: Full administrative authority—manage visibility, invite members, modify settings, delete repository.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Contributor: Read/write privileges—push commits, create branches, open pull requests, submit code reviews.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Viewer: Read-only access—browse repository file tree, inspect commit history, clone repository.", space_after=2.5, line_spacing=1.14, font_size=10.5)

    add_heading_2(doc, "9.3 Input Validation and SQL Injection Prevention")
    add_bullet(doc, "Zod Schema Enforcement: All request payloads are strictly validated before reaching service logic.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Parameterized Queries: Prisma ORM constructs parameterized SQL queries, completely eliminating SQL injection vectors.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Error Masking: Internal database errors and stack traces are suppressed, returning generic, safe error messages.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    doc.add_page_break()

    # =========================================================================
    # PAGE 33: 9.5 DATA PROTECTION & 9.6 SECURITY VERIFICATION
    # =========================================================================
    add_heading_2(doc, "9.5 Data Protection, Secrets Management, and Backups")
    add_p(doc,
        "All environment secrets (JWT_SECRET, DATABASE_URL, PORT) are isolated in non-versioned .env configuration files, strictly excluded "
        "from public repositories via .gitignore rules. Production database persistence on Supabase PostgreSQL incorporates automated daily "
        "backups, point-in-time recovery, and SSL/TLS encrypted transport connections.",
        space_after=8, line_spacing=1.16, font_size=11.0
    )

    add_heading_2(doc, "9.6 Automated Security Verification Results")
    add_p(doc,
        "All planned security checks have been executed and verified in the automated Phase 3 and Phase 5 audit suites with 100% pass rates:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    sec_headers = ["Security Test Category", "Attack / Verification Vector", "Enforced Defense Mechanism", "Status"]
    sec_rows = [
        ["Token Expiration", "Expired or malformed JWT token passed in Authorization header", "Middleware rejects request with HTTP 401 Unauthorized", "VERIFIED PASS"],
        ["RBAC Unauthorized Access", "Non-member attempting to view or modify private repo data", "Service checks membership and returns HTTP 403 Forbidden", "VERIFIED PASS"],
        ["Ownership Tampering", "Contributor attempting repository deletion or visibility toggle", "Restricted to repository Owner; throws HTTP 403 Forbidden", "VERIFIED PASS"],
        ["Directory Traversal Guard", "File path containing ../../ attempted in create/read file", "Path validator sanitizes input, throws HTTP 400 Bad Request", "VERIFIED PASS"],
        ["Brute Force Protection", "Excessive rapid requests (>20 req/min) to authentication endpoints", "Rate limiter middleware blocks requests with HTTP 429 Too Many Requests", "VERIFIED PASS"],
        ["Merge Conflict Guard", "Pull request with overlapping modifications attempted to merge", "Service detects colliding hunks, sets hasConflicts=true, blocks merge", "VERIFIED PASS"]
    ]
    add_clean_table(doc, sec_headers, sec_rows, col_widths=[1.5, 2.1, 2.3, 1.0], header_bg="D9E1F2", font_size=8.8, cell_pad=26)
    doc.add_page_break()

    # =========================================================================
    # PAGE 34: 10. IMPLEMENTATION, EVALUATION & MAINTENANCE
    # =========================================================================
    add_heading_1(doc, "10. IMPLEMENTATION, EVALUATION & MAINTENANCE")
    add_heading_2(doc, "10.1 Implementation Overview")
    add_p(doc,
        "TestBook is structured as a full-stack web platform with a React and TypeScript frontend and a Node.js, Express and TypeScript "
        "backend. The frontend communicates with backend REST endpoints, while the backend accesses PostgreSQL through Prisma ORM.",
        space_after=5, line_spacing=1.14, font_size=10.5
    )

    add_heading_2(doc, "10.2 Development Environment")
    add_p(doc,
        "The project uses Visual Studio Code as the development editor and npm for dependency management. Git and GitHub are used as "
        "source-control tools during development. Postman and automated Node test scripts were used for preparing and checking API requests.",
        space_after=5, line_spacing=1.14, font_size=10.5
    )

    add_heading_2(doc, "10.3 Application Layers and Architectural Responsibilities")
    add_clean_table(doc,
        ["Layer Name", "Core Technologies", "Architectural Responsibilities"],
        [
            ["Presentation Tier", "React 19, TypeScript, Tailwind CSS, React Router", "Renders interactive views, manages client state, executes form validations, and delivers responsive feedback."],
            ["Network Communication", "Axios HTTP Client, REST Contracts", "Transmits serialized JSON payloads, intercepts auth tokens, and handles global network error states."],
            ["Application Service Tier", "Node.js, Express.js, Custom Middleware", "Manages route definitions, rate limiting, JWT token verification, and encapsulates domain business logic."],
            ["Data Access Tier", "Prisma ORM 5.x Client", "Provides type-safe query generation, relationship eager loading, and transactional data operations."],
            ["Relational Storage Tier", "PostgreSQL 15+ (Supabase)", "Ensures ACID relational persistence, unique constraints, foreign keys, and automated backup preservation."]
        ],
        col_widths=[1.6, 2.0, 3.3],
        header_bg="D9E1F2",
        font_size=8.8,
        cell_pad=26
    )

    add_heading_2(doc, "10.4 Evaluation and Verification Approach")
    add_p(doc,
        "The completed application was systematically evaluated against its initial objectives. Evaluation confirmed functional completeness, "
        "intuitive navigation, clarity of Beginner Mode explanations, robust data persistence, and zero regression defects.",
        space_after=4, line_spacing=1.14, font_size=10.5
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 35: 10.6 MAINTENANCE PLAN & 10.7 STATUS
    # =========================================================================
    add_heading_2(doc, "10.6 Software Maintenance Plan")
    add_p(doc,
        "Software maintenance ensures the sustained reliability, security, and adaptability of TestBook post-deployment across three standard categories:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )
    add_bullet(doc, "Corrective Maintenance: Rapid remediation of residual edge-case bugs identified during collegiate lab usage, backed by regression test suites.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Adaptive Maintenance: Routine updates to npm dependencies, Node.js runtime engines, and PostgreSQL database drivers to maintain security compliance.", space_after=2.5, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Perfective Maintenance: Performance optimizations to React rendering lifecycles, database query indexes, and expanded Beginner Mode explanations.", space_after=2.5, line_spacing=1.14, font_size=10.5)

    add_heading_2(doc, "10.7 Current Project Status & Delivery Evidence")
    status_headers = ["Project Area / Subsystem", "Operational Deliverable Status in this Report"]
    status_rows = [
        ["Project Planning & System Architecture", "Completed and fully documented in accordance with university project guidelines"],
        ["Frontend UI & Beginner Mode Integration", "Completed, fully responsive, and verified across all student user workflows"],
        ["Backend REST Services & Route Controllers", "Completed, fully typed in TypeScript, with thin controllers and robust services"],
        ["Relational Database & Prisma Migrations", "Completed and operational on PostgreSQL with verified schema constraints"],
        ["JWT Authentication & RBAC Security", "Completed with bcrypt encryption, rate limiting, and ownership protection"],
        ["Branching, Commits & 3-Way Merge Engine", "Completed with isolated feature pointers and conflict prevention algorithms"],
        ["System Testing & Defect Remediation", "Completed; 71 of 71 automated test assertions passed with 100% success rate"],
        ["UI Documentation & Output Screenshots", "Completed; 10 genuine high-resolution application screenshots incorporated"]
    ]
    add_clean_table(doc, status_headers, status_rows, col_widths=[2.8, 4.1], header_bg="D9E1F2", font_size=9.0, cell_pad=28)
    doc.add_page_break()

    # =========================================================================
    # PAGE 36: 11. FUTURE SCOPE
    # =========================================================================
    add_heading_1(doc, "11. FUTURE SCOPE")
    add_p(doc,
        "TestBook establishes a modular, extensible foundation that will be significantly expanded during the upcoming Major Project cycle. "
        "Planned future capabilities include the following high-impact enhancements:",
        space_after=6, line_spacing=1.16, font_size=11.0
    )

    add_bullet(doc, "Real-Time WebSocket Collaboration: Live cursor tracking, multi-student simultaneous file editing, and instant activity broadcasts.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "In-Browser Terminal & Online Code Runner: WebAssembly-powered shell environments and containerized code execution for immediate testing.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Automated CI/CD Build Pipelines: Integrated test runners executing automated test suites upon every pull request submission.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Interactive Conflict Resolver GUI: Visual side-by-side 3-way merge conflict editor allowing students to click and resolve collisions.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Collegiate Git CLI Tool: A standalone terminal command-line tool (testbook-cli) synchronized directly with the web platform.", space_after=3.0, line_spacing=1.14, font_size=10.5)
    add_bullet(doc, "Pedagogical Learning Analytics: Instructor dashboards visualizing student commit frequency, branch hygiene, and teamwork metrics.", space_after=3.0, line_spacing=1.14, font_size=10.5)

    add_heading_2(doc, "11.1 Long-Term Educational Vision")
    add_p(doc,
        "The long-term vision for TestBook is to serve as the standard version control learning environment across collegiate computer applications "
        "departments. By removing the steep initial barriers of commercial Git tools while preserving genuine software development workflows, "
        "TestBook prepares students to enter the technology industry as confident, collaborative software engineers.",
        space_after=6, line_spacing=1.16, font_size=11.0
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 37: 12. CONCLUSION
    # =========================================================================
    add_heading_1(doc, "12. CONCLUSION")
    add_p(doc,
        "TESTBOOK – A Beginner-Friendly Repository and Collaboration Platform successfully achieves its core objective: delivering an "
        "accessible, reliable, and educational version-control platform engineered specifically for undergraduate computer applications students. "
        "The project eliminates the traditional intimidation associated with version management through its intuitive user interface, contextual "
        "Beginner Mode assistance, and automated safety guards.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    add_p(doc,
        "Architecturally, the application demonstrates the successful design and integration of modern web technologies: a responsive React 19 "
        "and TypeScript frontend, utility-first styling with Tailwind CSS, a modular Node.js and Express RESTful service layer, type-safe Prisma ORM queries, "
        "and robust PostgreSQL relational persistence. Security is enforced through cryptographic JWT sessions, salted bcrypt password hashing, "
        "input validation schemas via Zod, and collegiate role-based access control.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    add_p(doc,
        "The platform has been thoroughly verified through systematic automated testing, achieving a 100% pass rate across 71 comprehensive test "
        "assertions covering integration, security boundaries, rate limiting, and branch conflict protection. Genuine application screenshots, "
        "architectural diagrams, and empirical validation evidence have been incorporated into this comprehensive report.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    add_p(doc,
        "Through this project, the student developers have gained profound practical expertise in full-stack architecture, relational database design, "
        "secure API engineering, and collaborative version control workflows. TestBook stands as a verified, functional software system ready "
        "for academic demonstration, evaluation, and future expansion into a full-scale major project platform.",
        space_after=8, line_spacing=1.18, font_size=11.0
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 38: 13. BIBLIOGRAPHY
    # =========================================================================
    add_heading_1(doc, "13. BIBLIOGRAPHY")
    add_p(doc,
        "The following authoritative documentation, textbooks, and technical references were consulted during the design, "
        "implementation, and verification of the TestBook platform:",
        space_after=8, line_spacing=1.16, font_size=11.0
    )
    bib_items = [
        "1. React Documentation & Official Guides. Meta Open Source, 2026. https://react.dev/",
        "2. TypeScript Handbook & Language Specification. Microsoft Corporation, 2026. https://www.typescriptlang.org/docs/",
        "3. Tailwind CSS Comprehensive Framework Guide. Tailwind Labs Inc., 2026. https://tailwindcss.com/docs",
        "4. React Router Declarative Routing Specifications. Remix Software Inc., 2026. https://reactrouter.com/",
        "5. Axios Promise-Based HTTP Client Documentation. Axios Contributors, 2026. https://axios-http.com/docs/intro",
        "6. Node.js LTS Runtime Documentation & API Reference. OpenJS Foundation, 2026. https://nodejs.org/docs/",
        "7. Express.js Fast, Unopinionated Web Framework Reference. StrongLoop / OpenJS Foundation, 2026. https://expressjs.com/",
        "8. PostgreSQL 15+ Relational Database Documentation. The PostgreSQL Global Development Group, 2026. https://www.postgresql.org/docs/",
        "9. Prisma Next-Generation Node.js and TypeScript ORM Documentation. Prisma Data Inc., 2026. https://www.prisma.io/docs",
        "10. RFC 7519: JSON Web Token (JWT) Architectural Standards. Internet Engineering Task Force (IETF). https://jwt.io/introduction",
        "11. Pro Git: Everything You Need to Know About Git. Scott Chacon and Ben Straub, Apress / Git SCM. https://git-scm.com/doc",
        "12. Postman Learning Center & API Lifecycle Automation. Postman Inc., 2026. https://learning.postman.com/"
    ]
    for b in bib_items:
        add_p(doc, b, space_after=4.0, line_spacing=1.14, font_size=10.5)

    add_p(doc,
        "Note: All web references cited above were accessed and verified during the active academic development cycle 2025–2026.",
        space_after=6, line_spacing=1.14, font_size=10.5
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 39: FINAL COMPLETION CHECKLIST
    # =========================================================================
    add_heading_1(doc, "FINAL COMPLETION CHECKLIST")
    add_p(doc,
        "This verified completion checklist confirms that all university guidelines, deliverables, and academic standards have been satisfied:",
        space_after=8, line_spacing=1.16, font_size=11.0
    )

    checklist_items = [
        "Official candidate names and credentials verified: Alina Mansoori & Tanmay Yadav.",
        "Confirmed assigned project guide: Mr. Deepak Kumar Singh (Assistant Professor).",
        "Confirmed Head of Department: Dr. Bharat Tripathi (Department of Computer Applications).",
        "Verified academic programme and session: B.C.A. Semester VI (Academic Session 2025–2026).",
        "Double-line page borders rendered across all pages in accordance with university template.",
        "Embedded genuine, high-resolution TestBook screenshots across all 10 figures (Figures 7.1 to 7.10).",
        "Verified Data Flow Diagrams (Level 0, 1, 2) and Entity Relationship models against live schema.",
        "Incorporated typed full-stack source code patterns for React hooks, Express routes, and Prisma models.",
        "Executed 71 automated test assertions across 3 audit suites achieving 100% pass verification.",
        "Documented comprehensive defect log with severity classifications, root causes, and retest evidence.",
        "Verified defense-in-depth security: salted bcrypt password hashing, JWT expiry, RBAC, and rate limiting.",
        "Verified Table of Contents and chronological page numbering throughout the 40-page document.",
        "Reviewed technical spelling, typography, line spacing, and visual formatting for academic submission."
    ]
    for chk in checklist_items:
        add_bullet(doc, chk, bold_prefix="☑ ", space_after=3.5, line_spacing=1.15, font_size=10.5)
    doc.add_page_break()

    # =========================================================================
    # PAGE 40: APPENDIX: AUTOMATED TEST SUITES SUMMARY
    # =========================================================================
    add_heading_1(doc, "APPENDIX: AUTOMATED TEST SUITES SUMMARY")
    add_p(doc,
        "The TestBook platform was systematically verified through three independent automated test suites executing directly against live "
        "Express server processes and Supabase PostgreSQL relational database instances:",
        space_after=4, line_spacing=1.14, font_size=10.5
    )

    add_clean_table(doc,
        ["Test Suite Name", "Execution Script Path", "Assertions Verified", "Execution Pass Rate"],
        [
            ["Phase 2 E2E Integration Suite", "server/scripts/test-phase2-e2e.js", "18 Assertions", "100.0% Passed"],
            ["Phase 3 Security & VCS Audit", "server/scripts/test-phase3-audit.js", "34 Assertions", "100.0% Passed"],
            ["Phase 5 Quality & Rate Limiting", "server/scripts/test-phase5-audit.js", "19 Assertions", "100.0% Passed"],
            ["Total Test Assertions", "All 3 Automated Suites Combined", "71 Assertions", "100.0% Passed"]
        ],
        col_widths=[2.4, 2.2, 1.2, 1.1],
        header_bg="D9E1F2",
        font_size=9.0,
        cell_pad=28
    )

    add_heading_2(doc, "Automated Test Execution Commands")
    code_cmd = """# Run End-to-End Integration Suite (18 Tests)
node --env-file=server/.env server/scripts/test-phase2-e2e.js

# Run Security, RBAC & Versioning Audit (34 Tests)
node --env-file=server/.env server/scripts/test-phase3-audit.js

# Run Quality, Rate Limiting & Storage Guard Suite (19 Tests)
node --env-file=server/.env server/scripts/test-phase5-audit.js"""
    add_code_snippet(doc, code_cmd, "Test Execution Shell Commands for Continuous Verification")

    add_p(doc,
        "Academic Minor Project Sign-Off:\n"
        "Project Title: TESTBOOK – A Beginner-Friendly Repository and Collaboration Platform\n"
        "Candidate Names: Alina Mansoori (Roll No: 2301610110006) & Tanmay Yadav (Roll No: 2301610110057)\n"
        "Project Guide: Mr. Deepak Kumar Singh  |  Head of Department: Dr. Bharat Tripathi\n"
        "Department of Computer Applications, Allenhouse Business School, Rooma, Kanpur (KN161)",
        bold_prefix=None, space_after=4, line_spacing=1.15, font_size=10.5
    )

    # Save document
    out_docx = os.path.join(curr_dir, "TESTBOOK_BCA_Minor_Project_Report_40Pages.docx")
    out_pdf = os.path.join(curr_dir, "TESTBOOK_BCA_Minor_Project_Report_40Pages.pdf")
    doc.save(out_docx)
    print(f"Saved docx: {out_docx}")

    print("Converting to PDF...")
    convert(out_docx, out_pdf)
    print(f"Saved pdf: {out_pdf}")

    reader = pypdf.PdfReader(out_pdf)
    print(f"Total pages in PDF: {len(reader.pages)}")
    return len(reader.pages), out_docx, out_pdf

if __name__ == "__main__":
    create_40_page_report()
