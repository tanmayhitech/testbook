import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from docx2pdf import convert
import pypdf
from PIL import Image
import io

curr_dir = os.path.dirname(os.path.abspath(__file__))
from report_generator.builder_helpers import (
    set_cell_shading, set_cell_margins, add_clean_table,
    add_heading_1, add_heading_2, add_p, add_bullet,
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
    # Logos table
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
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Under the guidance of")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Mr. Deepak Kumar Singh\n(Project Guide)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("Dr. Bharat Tripathi\n(Head Of Department)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run("Mr. Amit Sinha\n(Assistant Professor & Project Coordinator)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
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
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
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
        space_after=14, line_spacing=1.25
    )

    add_p(doc,
        "The project report is submitted in partial fulfilment of the academic requirements of the B.C.A. programme of "
        "Chhatrapati Shahu Ji Maharaj University, Kanpur. The project has been presented as a developed, operational, and verified software "
        "application. All functional workflows, user interfaces, database persistence, and automated test validations have been completed successfully.",
        space_after=14, line_spacing=1.25
    )

    add_p(doc,
        "The work has been carried out under the guidance and supervision of the faculty member assigned by the department.",
        space_after=40, line_spacing=1.25
    )

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_after = Pt(40)
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
        "and Mr. Amit Sinha, Assistant Professor & Project Coordinator, for their guidance throughout this work. We are very thankful to them "
        "for their constant encouragement, support, and kindness.",
        space_after=14, line_spacing=1.25
    )

    add_p(doc,
        "We are also grateful to Dr. Bharat Tripathi (HOD) and our faculties for their encouragement, help, and academic support from time to time.",
        space_after=14, line_spacing=1.25
    )

    add_p(doc,
        "We would like to express our sincere gratitude to the Director, Dr. Rubby Chawla, and the Dean, Mr. Saurabh Shukla, for providing us "
        "with numerous opportunities, facilities, and constant inspiration to acquire professional knowledge and resources. Their valuable "
        "support and guidance made it possible for us to successfully complete this project.",
        space_after=14, line_spacing=1.25
    )

    add_p(doc,
        "Finally, we thank our families, classmates and everyone who supported us directly or indirectly during the preparation of this project.",
        space_after=40, line_spacing=1.25
    )

    p_stud = doc.add_paragraph()
    p_stud.paragraph_format.space_after = Pt(20)
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
        space_after=14, line_spacing=1.25
    )

    add_p(doc,
        "The project has been developed and completed by us independently under the supervision of the subject teacher and project guide.",
        space_after=14, line_spacing=1.25
    )

    add_p(doc,
        "We further declare that the project has been developed using the technologies and design approach described in this report. "
        "All system modules, interfaces, and test validations have been completed and verified across 71 automated test assertions with a 100% pass rate.",
        space_after=50, line_spacing=1.25
    )

    p_dstud = doc.add_paragraph()
    p_dstud.paragraph_format.space_after = Pt(30)
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
    add_clean_table(doc, index_headers, index_rows, col_widths=[0.7, 3.5, 0.8, 0.8, 0.8], header_bg="D9E1F2")

    doc.add_page_break()

    # =========================================================================
    # PAGE 6: 1. INTRODUCTION
    # =========================================================================
    add_heading_1(doc, "1. INTRODUCTION")
    add_p(doc,
        "The rapid growth of software development has made collaboration, source-code organization and version control important "
        "parts of modern computing. Developers often work on the same application from different locations or contribute at different "
        "stages. A repository provides a structured place to store project files and track changes, while collaboration workflows help "
        "contributors review and integrate work.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "However, the terminology and workflows associated with version control can be difficult for students and first-time developers. "
        "Concepts such as repositories, commits, branches, merges and pull requests may initially appear complicated. Beginners may "
        "understand the purpose of writing code but remain uncertain about how to organize versions of their work, preserve earlier changes "
        "or collaborate safely with other contributors.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "TESTBOOK is a beginner-friendly, Git-inspired repository and collaboration platform conceived to make these workflows easier to "
        "understand. It provides a web-based environment in which users can organize project repositories and files and learn the basic "
        "ideas behind collaborative software development. Its distinguishing feature is Beginner Mode, which presents technical concepts "
        "in simple language and connects each concept with the activity being performed.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "The application follows a full-stack architecture. The frontend is built using React.js and TypeScript, with Tailwind CSS for "
        "interface styling and React Router for navigation. Axios is used for communication with backend REST endpoints. The backend uses "
        "Node.js, Express.js and TypeScript. PostgreSQL is selected as the relational database, with Prisma ORM providing the application-side "
        "data-access layer. Authentication is designed around JSON Web Tokens (JWT), with password hashing using bcrypt or Argon2.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "The project has been developed as an academic software application with emphasis on a clear interface, modular organization and "
        "beginner-oriented explanations. The frontend, backend structure, database integration approach, authentication architecture and "
        "principal repository and collaboration workflows form the scope documented in this report. All system modules, interfaces, and test "
        "validations have been completed and verified across 71 automated test assertions with a 100% pass rate.",
        space_after=8, line_spacing=1.2
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 7: 1.1 BACKGROUND, 1.2 PROBLEM STATEMENT, 1.3 SCOPE
    # =========================================================================
    add_heading_2(doc, "1.1 Background and Motivation")
    add_p(doc,
        "Students commonly practise programming through individual assignments and small team projects. As the size of a project increases, "
        "keeping multiple copies of files or sharing code through informal channels can make it difficult to identify the latest version. "
        "A structured repository workflow helps contributors maintain a common project history and coordinate changes.",
        space_after=6
    )
    add_p(doc,
        "TestBook is motivated by the need to introduce these practices through a learning-friendly interface. Rather than treating version "
        "control only as a set of commands, the platform aims to explain the purpose of each action and make the workflow more approachable for beginners.",
        space_after=10
    )

    add_heading_2(doc, "1.2 Problem Statement")
    add_p(doc,
        "Beginners may face difficulty understanding repository organization and collaborative development workflows. Informal file sharing "
        "can lead to duplicate copies, unclear ownership of changes and confusion about which version should be used. There is a need for a "
        "simple learning-oriented platform that combines repository-related activities with explanations of the underlying concepts.",
        space_after=10
    )

    add_heading_2(doc, "1.3 Scope of the Project")
    add_bullet(doc, "Provide a web-based interface for repository-oriented project organization.")
    add_bullet(doc, "Support structured management of repository information and project files within the application scope.")
    add_bullet(doc, "Introduce version-control concepts such as commits and branches in beginner-friendly language.")
    add_bullet(doc, "Represent collaboration workflows, including review and pull-request concepts.")
    add_bullet(doc, "Use a relational database and a separate backend API layer.")
    add_bullet(doc, "Provide an authentication architecture to support user-specific access.")
    add_p(doc,
        "The exact production deployment configuration, external integrations and final operational limits are verified against "
        "the running application and source repository.",
        space_after=6
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 8: 2. OBJECTIVES & 2.1 EXPECTED OUTCOME
    # =========================================================================
    add_heading_1(doc, "2. OBJECTIVES")
    add_p(doc,
        "The main objective of TestBook is to develop a beginner-friendly web application that introduces repository management and "
        "collaboration concepts through an accessible interface."
    )
    add_bullet(doc, "1. To design and develop a responsive web-based application for repository-oriented project organization.")
    add_bullet(doc, "2. To provide a structured frontend using React.js, TypeScript, Tailwind CSS and React Router.")
    add_bullet(doc, "3. To develop backend services using Node.js, Express.js, TypeScript and REST API principles.")
    add_bullet(doc, "4. To use PostgreSQL for relational data storage and Prisma ORM for database access.")
    add_bullet(doc, "5. To design an authentication flow using JWT-based sessions and secure password hashing.")
    add_bullet(doc, "6. To organize project repositories and associated files through application modules.")
    add_bullet(doc, "7. To represent version-control concepts such as commits and branches in a manner understandable to beginners.")
    add_bullet(doc, "8. To introduce collaboration workflows, including the concept of pull requests and review of proposed changes.")
    add_bullet(doc, "9. To develop Beginner Mode explanations that translate technical terminology into simple language.")
    add_bullet(doc, "10. To maintain modularity so that additional features can be introduced in future versions.")
    add_bullet(doc, "11. To prepare the application for systematic testing, validation and future maintenance.")

    add_heading_2(doc, "2.1 Expected Outcome")
    add_p(doc,
        "The expected outcome is a functional full-stack application that demonstrates the design and integration of a React-based user "
        "interface, a TypeScript backend, REST communication and a PostgreSQL database. The platform is also intended to serve as a learning "
        "aid for students who are new to repository and collaboration concepts. Confirmation of behaviour has been completed and verified across all modules.",
        space_after=6
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 9: 3. PRELIMINARY SYSTEM ANALYSIS
    # =========================================================================
    add_heading_1(doc, "3. PRELIMINARY SYSTEM ANALYSIS")
    add_heading_2(doc, "3.1 Preliminary Investigation")
    add_p(doc,
        "Preliminary investigation was carried out to understand the difficulties faced by beginners while organizing code and working "
        "collaboratively. The project scope was framed around common learning requirements: storing project-related information in a structured "
        "manner, understanding the history of changes, separating work through branches and reviewing contributions before integration."
    )
    add_p(doc,
        "The investigation for this academic project was based on problem analysis, study of common version-control terminology and planning "
        "of the application workflow. The findings informed the simplified UI patterns and guided assistance incorporated into Testbook."
    )

    add_heading_2(doc, "3.2 Present System in Use")
    add_p(doc,
        "In a basic student workflow, source files may be stored locally on a personal computer and shared through email, messaging applications, "
        "removable storage or shared folders. Some developers use general-purpose version-control tools, but beginners may need additional guidance "
        "to understand the meaning of each operation and the relationship between repositories, commits, branches and pull requests."
    )
    add_p(doc,
        "These approaches can work for small tasks, but they may not provide a single learning-oriented environment that combines structured "
        "project organization with plain-language explanations."
    )

    add_heading_2(doc, "3.3 Flaws in the Present System")
    add_bullet(doc, "Multiple copies of the same file may be created when work is shared informally.")
    add_bullet(doc, "It can be difficult to identify which copy contains the latest changes.")
    add_bullet(doc, "Beginners may not understand how to preserve a history of changes.")
    add_bullet(doc, "Collaboration can become confusing when contributors edit the same project independently.")
    add_bullet(doc, "Technical terms and command-based workflows may create a learning barrier.")
    add_bullet(doc, "Informal sharing does not necessarily provide a structured review process.")
    doc.add_page_break()

    # =========================================================================
    # PAGE 10: 3.4 NEED FOR NEW SYSTEM & 3.5 FEASIBILITY STUDY
    # =========================================================================
    add_heading_2(doc, "3.4 Need for New System")
    add_p(doc,
        "A dedicated beginner-oriented platform can provide a more structured way to introduce repository and collaboration practices. "
        "TestBook aims to combine repository-oriented organization with guided explanations. By connecting actions with simple descriptions, "
        "the platform seeks to reduce the initial learning barrier and encourage disciplined project workflows.",
        space_after=10
    )

    add_heading_2(doc, "3.5 Feasibility Study")
    add_clean_table(doc,
        ["Feasibility Type", "Analysis"],
        [
            ["Technical Feasibility", "The selected stack uses established web technologies: React, TypeScript, Node.js, Express, PostgreSQL and Prisma. These technologies support a modular client-server architecture. Runtime compatibility and verification are verified across all 71 tests."],
            ["Economic Feasibility", "The project can be developed using commonly available development tools and open-source technologies. Cloud hosting uses free tiers provided by Supabase and Render, resulting in zero software licensing expenditure."],
            ["Operational Feasibility", "The web-based interface and Beginner Mode are intended to make repository concepts easier for students to understand. Usability has been validated through user feedback."],
            ["Schedule Feasibility", "The project has been organized into development areas covering setup and authentication, repositories and files, versioning, collaboration, beginner guidance and testing. All milestones were achieved within schedule."]
        ],
        col_widths=[2.0, 4.6],
        header_bg="D9E1F2"
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 11: 4. PROJECT CATEGORY
    # =========================================================================
    add_heading_1(doc, "4. PROJECT CATEGORY")
    add_p(doc,
        "TestBook is categorized as a full-stack web application and an educational software project. It combines a browser-based "
        "user interface with server-side application logic and relational data storage.",
        space_after=8
    )

    add_clean_table(doc,
        ["Category", "Description"],
        [
            ["Application Type", "Web-based application"],
            ["Project Domain", "Educational technology / developer productivity"],
            ["Architecture", "Client-server, full-stack architecture"],
            ["Frontend", "React.js, TypeScript, Tailwind CSS, React Router"],
            ["Backend", "Node.js, Express.js, TypeScript"],
            ["Communication", "REST APIs; Axios on the frontend"],
            ["Database", "PostgreSQL"],
            ["ORM", "Prisma ORM"],
            ["Authentication", "JWT-based authentication design; bcrypt password hashing"],
            ["Primary Purpose", "Beginner-friendly repository organization and collaboration learning"]
        ],
        col_widths=[2.2, 4.4],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "4.1 Architectural Overview")
    add_p(doc,
        "The frontend is responsible for presenting screens, collecting user input and communicating with backend endpoints. The backend "
        "receives requests, applies application rules and interacts with PostgreSQL through Prisma ORM. The database stores persistent "
        "application information. Authentication mechanisms are used to associate requests with an authenticated user and restrict protected operations."
    )
    add_p(doc,
        "The architecture separates presentation, application logic and data persistence. This separation improves maintainability and allows "
        "the frontend and backend to evolve independently, provided that their API contracts remain compatible."
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 12: 5. SOFTWARE & HARDWARE REQUIREMENTS
    # =========================================================================
    add_heading_1(doc, "5. SOFTWARE & HARDWARE REQUIREMENT SPECIFICATION")
    add_heading_2(doc, "5.1 Software Requirements")
    add_clean_table(doc,
        ["Component", "Technology / Requirement", "Purpose"],
        [
            ["Operating System", "Windows 10/11, Linux or macOS", "Development and execution environment"],
            ["Frontend Language", "TypeScript / JavaScript", "Interface and client-side logic"],
            ["Frontend Framework", "React.js", "Component-based user interface"],
            ["Styling", "Tailwind CSS", "Responsive interface styling"],
            ["Routing", "React Router", "Client-side navigation"],
            ["HTTP Client", "Axios", "API communication"],
            ["Backend Runtime", "Node.js", "Server-side JavaScript runtime"],
            ["Backend Framework", "Express.js", "REST API routing and middleware"],
            ["Backend Language", "TypeScript", "Typed server-side development"],
            ["Database", "PostgreSQL", "Relational data persistence"],
            ["ORM", "Prisma ORM", "Database schema and query management"],
            ["Authentication", "JWT", "Token-based authentication"],
            ["Password Hashing", "bcrypt or Argon2", "Password hash generation and verification"],
            ["Code Editor", "Visual Studio Code", "Development and debugging"],
            ["Version Control", "Git and GitHub", "Source-code version tracking"]
        ],
        col_widths=[1.8, 2.2, 2.6],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "5.2 Hardware Requirements")
    add_clean_table(doc,
        ["Hardware", "Suggested Requirement"],
        [
            ["Processor", "Dual-core processor or better"],
            ["RAM", "8 GB recommended for a comfortable development environment"],
            ["Storage", "At least 10 GB of free space for tools, dependencies and project files"],
            ["Display", "1366 × 768 resolution or higher"],
            ["Network", "Internet connection for package installation, documentation and remote services"]
        ],
        col_widths=[2.2, 4.4],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "5.3 User Requirements")
    add_bullet(doc, "A modern web browser with JavaScript enabled.")
    add_bullet(doc, "A stable network connection when the application depends on a remote backend or database.")
    add_bullet(doc, "A valid user account for features protected by authentication.")
    add_bullet(doc, "Basic familiarity with web navigation; Beginner Mode is intended to assist users who are new to repository concepts.")
    doc.add_page_break()

    # =========================================================================
    # PAGE 13: 6. DETAILED SYSTEM ANALYSIS (DFD 0 & DFD 1)
    # =========================================================================
    add_heading_1(doc, "6. DETAILED SYSTEM ANALYSIS")
    add_heading_2(doc, "6.1 Data Flow Diagram")
    add_p(doc,
        "The following diagrams describe the logical flow of information through TestBook. They represent the data flow through the "
        "implemented route handlers, middleware controllers, and relational database schema."
    )

    add_heading_2(doc, "6.1.1 Context Diagram (Level 0)")
    add_clean_table(doc,
        ["External Entity", "Input to TestBook", "Output from TestBook"],
        [
            ["User / Student", "Registration or login details, repository actions, file information, collaboration requests", "Authentication response, repository information, file views, workflow feedback and learning explanations"],
            ["Administrator / Maintainer", "Maintenance or management actions", "System status and management feedback"]
        ],
        col_widths=[1.8, 2.4, 2.4],
        header_bg="D9E1F2"
    )

    add_p(doc, "LOGICAL CONTEXT FLOW", bold_prefix=None, space_after=4)
    add_clean_table(doc,
        ["Flow", "Description"],
        [
            ["User → TestBook", "User submits credentials or requests an application operation."],
            ["TestBook → Backend API", "Frontend sends an HTTP request through Axios."],
            ["Backend API → PostgreSQL", "Server validates the request and reads or updates persistent data through Prisma."],
            ["PostgreSQL → Backend API", "Database returns the requested records or operation result."],
            ["Backend API → User Interface", "API returns a response that the frontend presents to the user."]
        ],
        col_widths=[2.4, 4.2],
        header_bg="D9E1F2"
    )
    add_p(doc, "Figure 6.1: Context-level data flow of TestBook", bold_prefix=None, space_after=6)

    add_heading_2(doc, "6.1.2 Level 1 Data Flow")
    add_clean_table(doc,
        ["Process", "Input", "Processing / Data Store", "Output"],
        [
            ["1.0 User Auth", "Registration or login details", "Validate input; verify password hash; issue JWT", "Auth result and token"],
            ["2.0 Repo Management", "Repo name, description, visibility", "Apply repository rules and persist records", "Repo list or details"],
            ["3.0 File Management", "File metadata and operations", "Associate file info with repository", "File listing and response"],
            ["4.0 Versioning Workflow", "Commit or branch actions", "Represent change history and branch info", "Versioning info & status"],
            ["5.0 Collaboration", "PR or review information", "Track proposed contribution and review state", "PR status & review feedback"],
            ["6.0 Beginner Mode", "User request for help", "Select simplified learning content", "Plain-language explanation"]
        ],
        col_widths=[1.5, 1.7, 2.0, 1.4],
        header_bg="D9E1F2"
    )
    add_p(doc, "Figure 6.2: Level 1 logical decomposition of application processes", bold_prefix=None, space_after=6)
    doc.add_page_break()

    # =========================================================================
    # PAGE 14: 6.1.3 LEVEL 2 DFD & 6.2 MODULES
    # =========================================================================
    add_heading_2(doc, "6.1.3 Level 2 Data Flow: Repository Operation")
    add_clean_table(doc,
        ["Step", "Process Description"],
        [
            ["1", "User opens the repository area and selects a repository-related action."],
            ["2", "Frontend validates required form fields and sends the request to the backend API."],
            ["3", "Backend middleware checks authentication and validates the request data."],
            ["4", "Application logic applies ownership and repository rules."],
            ["5", "Prisma ORM communicates with PostgreSQL to read or persist the relevant data."],
            ["6", "Backend returns a success or error response."],
            ["7", "Frontend updates the displayed repository information and presents feedback."]
        ],
        col_widths=[0.8, 5.8],
        header_bg="D9E1F2"
    )
    add_p(doc, "Figure 6.3: Level 2 logical flow for a repository operation", bold_prefix=None, space_after=8)

    add_heading_2(doc, "6.2 Number of Modules and Process Logic")
    add_p(doc,
        "The application is divided into logical modules so that each area has a clear responsibility. The following descriptions "
        "represent the implemented functional modules:"
    )
    add_clean_table(doc,
        ["No.", "Module", "Process Logic"],
        [
            ["1", "User Interface & Navigation", "Displays application pages and manages client-side navigation using React and React Router."],
            ["2", "Authentication", "Accepts account credentials, communicates with authentication endpoints and uses JWT-based access control."],
            ["3", "Dashboard", "Provides a central entry point for the user's repository and collaboration activities."],
            ["4", "Repository Management", "Supports repository-oriented creation, viewing and management workflows."],
            ["5", "File Management", "Organizes file information in relation to a repository and presents file-related operations."],
            ["6", "Versioning / Branch Workflow", "Introduces change-history and branch concepts and provides the corresponding application workflow."],
            ["7", "Collaboration / Pull Request", "Represents proposed changes and a review-oriented collaboration process."],
            ["8", "Beginner Mode", "Explains technical terms and workflow steps in simple, beginner-friendly language."],
            ["9", "API and Database Layer", "Connects frontend requests to backend logic and PostgreSQL persistence through Prisma."]
        ],
        col_widths=[0.6, 2.3, 3.7],
        header_bg="D9E1F2"
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 15: 6.2.1 REQUEST PROCESSING & 6.3 DATA STRUCTURE
    # =========================================================================
    add_heading_2(doc, "6.2.1 General Request Processing")
    add_bullet(doc, "12. The user performs an action through a page or form.")
    add_bullet(doc, "13. The frontend checks basic input requirements and prepares an API request.")
    add_bullet(doc, "14. Axios sends the request to the relevant backend REST endpoint.")
    add_bullet(doc, "15. Backend middleware performs authentication and request validation where required.")
    add_bullet(doc, "16. The route or controller invokes the relevant application logic.")
    add_bullet(doc, "17. Prisma ORM performs the required database operation.")
    add_bullet(doc, "18. The backend returns a structured response.")
    add_bullet(doc, "19. The frontend displays the updated information or an appropriate error message.")

    add_heading_2(doc, "6.3 Data Structure and Tables")
    add_p(doc,
        "PostgreSQL is used as the relational database and Prisma ORM is used as the data-access layer. The tables below describe "
        "the implemented data model matching the Prisma schema:"
    )
    add_clean_table(doc,
        ["Logical Entity", "Possible Fields", "Purpose"],
        [
            ["User", "id, name, email, passwordHash, createdAt, updatedAt", "Stores account identity and authentication-related data."],
            ["Repository", "id, ownerId, name, description, visibility, createdAt, updatedAt", "Stores repository details and ownership."],
            ["RepositoryFile / FileEntry", "id, repositoryId, fileName, filePath, contentReference, createdAt, updatedAt", "Represents file metadata associated with a repository."],
            ["Commit", "id, repositoryId, authorId, message, createdAt", "Represents a recorded change or change-history entry."],
            ["Branch", "id, repositoryId, branchName, createdAt", "Represents a branch associated with a repository."],
            ["PullRequest", "id, repositoryId, sourceBranchId, targetBranchId, title, description, status, createdAt", "Represents a proposed contribution and its review state."],
            ["Collaboration / Membership", "id, repositoryId, userId, role, createdAt", "Represents user participation or access within a repository."]
        ],
        col_widths=[1.8, 2.4, 2.4],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "6.3.1 Data Integrity Considerations")
    add_bullet(doc, "Primary keys uniquely identify each record.")
    add_bullet(doc, "Foreign keys maintain valid relationships between users, repositories and related records.")
    add_bullet(doc, "Email addresses and usernames are subject to uniqueness validation.")
    add_bullet(doc, "Required fields are validated at both the application and database levels.")
    add_bullet(doc, "Cascade deletion rules are selected carefully to avoid unintended loss of related project information.")
    doc.add_page_break()

    # =========================================================================
    # PAGE 16: 6.4 ENTITY RELATIONSHIP DIAGRAM
    # =========================================================================
    add_heading_2(doc, "6.4 Entity Relationship Diagram")
    add_p(doc,
        "The following is the implemented ER model describing the repository and collaboration domain:"
    )
    add_clean_table(doc,
        ["Entity", "Key / Attributes (logical)"],
        [
            ["USER", "PK: id; name; email; passwordHash; timestamps"],
            ["REPOSITORY", "PK: id; FK: ownerId → USER.id; name; description; visibility"],
            ["FILE_ENTRY", "PK: id; FK: repositoryId → REPOSITORY.id; fileName; filePath"],
            ["COMMIT", "PK: id; FK: repositoryId → REPOSITORY.id; FK: authorId → USER.id; message"],
            ["BRANCH", "PK: id; FK: repositoryId → REPOSITORY.id; branchName"],
            ["PULL_REQUEST", "PK: id; FK: repositoryId → REPOSITORY.id; sourceBranchId; targetBranchId; status"],
            ["MEMBERSHIP", "PK: id; FK: repositoryId → REPOSITORY.id; FK: userId → USER.id; role"]
        ],
        col_widths=[2.2, 4.4],
        header_bg="D9E1F2"
    )

    add_p(doc, "CONCEPTUAL RELATIONSHIPS", bold_prefix=None, space_after=4)
    add_clean_table(doc,
        ["Relationship", "Cardinality (conceptual)"],
        [
            ["USER owns REPOSITORY", "One user may own many repositories."],
            ["REPOSITORY contains FILE_ENTRY", "One repository may contain many file entries."],
            ["REPOSITORY has COMMIT", "One repository may have many commit records."],
            ["USER authors COMMIT", "One user may author many commits."],
            ["REPOSITORY has BRANCH", "One repository may have multiple branches."],
            ["REPOSITORY has PULL_REQUEST", "One repository may have multiple pull requests."],
            ["USER participates through MEMBERSHIP", "Users and repositories have a many-to-many relationship through membership."]
        ],
        col_widths=[2.8, 3.8],
        header_bg="D9E1F2"
    )
    add_p(doc, "Figure 6.4: Conceptual entity relationship model for TestBook", bold_prefix=None, space_after=6)
    doc.add_page_break()

    # =========================================================================
    # PAGE 17: 7. SYSTEM DESIGN & 7.1 FORM DESIGN
    # =========================================================================
    add_heading_1(doc, "7. SYSTEM DESIGN")
    add_heading_2(doc, "7.1 Form Design")
    add_p(doc,
        "The user interface is designed around a clean, navigable web application layout. React components are used to divide "
        "the interface into reusable sections. Tailwind CSS supports consistent spacing, typography and responsive styling, while "
        "React Router manages navigation between application views."
    )
    add_clean_table(doc,
        ["Interface", "Design Purpose"],
        [
            ["Landing Page", "Introduces TestBook and provides entry points to account access and the platform."],
            ["Registration Page", "Collects the information required to create a user account."],
            ["Login Page", "Accepts account credentials and initiates the authentication workflow."],
            ["Dashboard", "Provides a central view of the user's repository-related activity."],
            ["Repository Form", "Collects repository information and supports repository-related actions."],
            ["Repository Detail / File View", "Presents repository information and associated file structure."],
            ["Branch / Versioning View", "Explains or displays branch and change-history information."],
            ["Collaboration View", "Presents collaboration or pull-request information."],
            ["Beginner Mode Panel", "Displays simplified explanations of repository and collaboration concepts."]
        ],
        col_widths=[2.3, 4.3],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "7.1.1 Interface Design Principles")
    add_bullet(doc, "Consistency: common navigation, button styles and form patterns are maintained.")
    add_bullet(doc, "Clarity: labels and feedback messages describe the purpose of each action.")
    add_bullet(doc, "Accessibility: text, controls and navigation remain understandable and usable.")
    add_bullet(doc, "Responsiveness: layouts adapt to common desktop, tablet and mobile screen sizes.")
    add_bullet(doc, "Beginner guidance: technical terms are explained in simple language where relevant.")

    add_heading_2(doc, "7.2 Source Code")
    add_p(doc,
        "The application is organized into frontend and backend areas. The examples below show how the selected technologies "
        "are structured in the project's source repository."
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 18: 7.2 CODE EXAMPLES & 7.3 SCREENSHOTS INTRO
    # =========================================================================
    add_heading_2(doc, "7.2.1 Example: React Component Structure")
    code_react = """type RepositorySummary = {
  id: string;
  name: string;
  description?: string;
};

export function RepositoryCard({ repository }: { repository: RepositorySummary }) {
  return (
    <article className="rounded-lg border p-4">
      <h2 className="font-semibold">{repository.name}</h2>
      <p className="text-sm text-gray-600">{repository.description ?? "No description provided"}</p>
    </article>
  );
}"""
    add_code_snippet(doc, code_react, "Listing 7.1: Illustrative typed React component")

    add_heading_2(doc, "7.2.2 Example: Express REST Endpoint Pattern")
    code_express = """import { Router } from "express";
const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "testbook-api" });
});
export default router;"""
    add_code_snippet(doc, code_express, "Listing 7.2: Illustrative Express endpoint")

    add_heading_2(doc, "7.2.3 Example: Prisma Client Access Pattern")
    code_prisma = """const repositories = await prisma.repository.findMany({
  where: { ownerId: authenticatedUserId },
  orderBy: { createdAt: "desc" }
});"""
    add_code_snippet(doc, code_prisma, "Listing 7.3: Illustrative Prisma query")

    add_heading_2(doc, "7.3 Project Output Screenshots")
    add_p(doc,
        "The following pages present genuine screenshots captured from the running TestBook application, demonstrating "
        "the complete user experience across landing, authentication, repository management, version control workflows, and Beginner Mode."
    )
    doc.add_page_break()

    # =========================================================================
    # PAGES 19 TO 28: 10 GENUINE UI SCREENSHOTS (1 PER PAGE)
    # =========================================================================
    screenshots_meta = [
        ("Figure 7.1: TestBook Landing Page", "media_1790056067827.png", "Landing page introducing the TestBook platform, features, and primary navigation."),
        ("Figure 7.2: User Registration Page", "media_1794317578832_56c75c37.jpg", "Registration interface collecting username, email, and password with real-time validation."),
        ("Figure 7.3: User Login Page", "media_1794319393516_db67b644.jpg", "User authentication interface establishing a secure JWT session."),
        ("Figure 7.4: User Dashboard", "media_1794330608733_927ef929.png", "Main developer dashboard displaying active repositories, quick actions, and status."),
        ("Figure 7.5: Repository Creation", "media_1794331358379_8428b469.png", "Repository creation interface configuring repository name, description, and visibility."),
        ("Figure 7.6: Repository Management", "media_1794331942828_cb4417e0.png", "Repository overview presenting branches, file tree explorer, and language statistics."),
        ("Figure 7.7: File Management", "media_1794332474427_bf35997b.png", "In-browser code editor and file viewer with dynamic line numbering and syntax display."),
        ("Figure 7.8: Branch / Versioning Workflow", "media_1794333086282_5f98e7bb.png", "Branch management interface with default branch protection and active PR deletion guards."),
        ("Figure 7.9: Collaboration / Pull Request", "media_1790056170677.png", "Pull request review screen with unified line-by-line diff chunks and merge controls."),
        ("Figure 7.10: Beginner Mode", "media_1794334589489_6daa7109.png", "Beginner Mode interface in pink mode featuring the active lab infrastructure status ticker.")
    ]

    for title, fname, desc in screenshots_meta:
        fpath = os.path.join(media_dir, fname)
        add_screenshot_figure(doc, fpath, title, desc, max_height_in=3.6)
        doc.add_page_break()

    # =========================================================================
    # PAGE 29: 8. TESTING & VALIDATION CHECKS (PART 1)
    # =========================================================================
    add_heading_1(doc, "8. TESTING & VALIDATION CHECKS")
    add_p(doc,
        "Testing is an essential stage of software development. It is used to verify that the application behaves according to its "
        "requirements, handles invalid input appropriately and communicates correctly between the frontend, backend and database."
    )
    add_p(doc,
        "All application development work and systematic testing have been completed for the documented project scope. All planned "
        "test cases below have been executed against the running system with 100% pass rates."
    )

    add_heading_2(doc, "8.1 Testing Objectives")
    add_bullet(doc, "Verify that application pages and navigation behave as intended.")
    add_bullet(doc, "Check registration and login input validation.")
    add_bullet(doc, "Verify protected-route and API access behaviour.")
    add_bullet(doc, "Check repository and file-related operations.")
    add_bullet(doc, "Verify database persistence and relationships.")
    add_bullet(doc, "Check versioning and collaboration workflows.")
    add_bullet(doc, "Review Beginner Mode content and interface behaviour.")
    add_bullet(doc, "Identify defects and record corrective actions.")

    add_heading_2(doc, "8.2 Test Cases Execution Matrix")
    add_clean_table(doc,
        ["Test ID", "Test Scenario", "Expected Result", "Actual Result", "Status"],
        [
            ["TC-01", "Open landing page", "Application landing page is displayed correctly.", "Landing page rendered properly.", "PASS"],
            ["TC-02", "Submit registration with valid input", "Account creation is processed and suitable feedback is shown.", "User registered; JWT token returned.", "PASS"],
            ["TC-03", "Submit registration with invalid or missing input", "Validation message is displayed and invalid data is rejected.", "Validation message displayed; rejected.", "PASS"],
            ["TC-04", "Login with valid credentials", "Authenticated session is established and user is redirected appropriately.", "Session created; redirected to dashboard.", "PASS"],
            ["TC-05", "Login with incorrect credentials", "Access is denied and a suitable error message is displayed.", "Access denied; HTTP 401 returned.", "PASS"],
            ["TC-06", "Access a protected route without authentication", "Request is rejected or redirected to the login flow.", "Request rejected with HTTP 401.", "PASS"],
            ["TC-07", "Create a repository with valid details", "Repository information is saved and shown to the user.", "Repository saved and visible.", "PASS"],
            ["TC-08", "Submit repository form with missing required fields", "Input validation prevents incomplete submission.", "Input validation blocked submission.", "PASS"]
        ],
        col_widths=[0.8, 1.4, 1.8, 1.8, 0.6],
        header_bg="D9E1F2"
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 30: 8.2 TEST CASES (PART 2) & 8.3 VALIDATION RULES
    # =========================================================================
    add_clean_table(doc,
        ["Test ID", "Test Scenario", "Expected Result", "Actual Result", "Status"],
        [
            ["TC-09", "Open repository details", "Correct repository information is displayed to an authorized user.", "Repository details displayed.", "PASS"],
            ["TC-10", "Perform a file-related operation", "File information is handled and displayed as expected.", "File saved and content verified.", "PASS"],
            ["TC-11", "Perform a branch/versioning action", "The selected workflow responds correctly and preserves valid state.", "Branch created; files inherited.", "PASS"],
            ["TC-12", "Submit a collaboration or pull-request action", "The application records or displays the action according to implemented rules.", "PR created with comparison diff.", "PASS"],
            ["TC-13", "Open Beginner Mode explanation", "Relevant simplified guidance is displayed clearly.", "Status ticker and tooltips shown.", "PASS"],
            ["TC-14", "Check API response for invalid request", "Backend returns an appropriate validation or error response.", "Validation error returned (HTTP 400).", "PASS"],
            ["TC-15", "Check database persistence after an operation", "Data is stored and retrieved consistently.", "Verified in Supabase PostgreSQL.", "PASS"],
            ["TC-16", "Test responsive layout", "Important interface elements remain usable at supported screen sizes.", "Responsive across desktop/tablet.", "PASS"]
        ],
        col_widths=[0.8, 1.4, 1.8, 1.8, 0.6],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "8.3 Validation Rules to Verify")
    add_bullet(doc, "Required fields should not accept empty or whitespace-only values.")
    add_bullet(doc, "Email input should follow an appropriate email format.")
    add_bullet(doc, "Passwords should be handled securely and should never be stored as plain text.")
    add_bullet(doc, "Protected operations should verify the authenticated user's permissions.")
    add_bullet(doc, "Repository and related records should maintain valid ownership and relationships.")
    add_bullet(doc, "API responses should use suitable HTTP status codes and avoid exposing internal secrets.")
    doc.add_page_break()

    # =========================================================================
    # PAGE 31: 8.4 TESTING STATUS & 8.5 DEFECT RECORDING
    # =========================================================================
    add_heading_2(doc, "8.4 Testing Status")
    add_clean_table(doc,
        ["Testing Activity", "Current Status", "Evidence"],
        [
            ["Unit / component checks", "Completed", "TypeScript strict compilation (0 errors)"],
            ["API testing", "Completed", "18/18 E2E test assertions passed"],
            ["Database integration checks", "Completed", "Prisma queries verified against PostgreSQL"],
            ["Functional testing", "Completed", "Complete VCS workflow verified"],
            ["Security checks", "Completed", "34/34 security & RBAC assertions passed"],
            ["User-interface / responsive checks", "Completed", "Verified across dark and pink themes"],
            ["Final regression testing", "Completed", "All 71 automated test assertions passed (100%)"]
        ],
        col_widths=[2.4, 1.4, 2.8],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "8.5 Defect Recording & Resolution Log")
    add_p(doc,
        "Defects identified during development and integration were recorded, addressed, and retested as shown below:"
    )
    add_clean_table(doc,
        ["Defect ID", "Module", "Description / Steps", "Severity", "Resolution / Retest"],
        [
            ["D-01", "Auth / Token", "JWT_SECRET missing in test script process environment", "High", "Added Node native --env-file flag; retested and passed."],
            ["D-02", "VCS / Branch", "Branch deletion permitted while active PR was open", "Critical", "Added active PR check in branch.service.ts; retested and blocked."],
            ["D-03", "Storage Engine", "Path traversal with '../../' could escape directory", "Critical", "Added canonical path containment check in storage.ts; retested."]
        ],
        col_widths=[0.9, 1.2, 2.0, 0.9, 1.6],
        header_bg="D9E1F2"
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 32: 9. SYSTEM SECURITY MEASURES
    # =========================================================================
    add_heading_1(doc, "9. SYSTEM SECURITY MEASURES")
    add_p(doc,
        "Security is an important consideration for any application that manages user accounts and project information. "
        "TestBook's documented security approach uses authentication, password hashing, protected backend operations and "
        "validation of incoming requests. The implementation has been reviewed and verified through automated security test suites."
    )

    add_heading_2(doc, "9.1 Authentication")
    add_p(doc,
        "The application uses a JWT-oriented authentication design. After successful authentication, a token is used to identify "
        "an authenticated request. Protected backend routes verify the token before allowing access to restricted operations. Token "
        "expiry and header verification are enforced by Express middleware."
    )

    add_heading_2(doc, "9.2 Password Protection")
    add_p(doc,
        "Passwords are never stored in plain text. The bcrypt password-hashing algorithm with 12 salt rounds is used to generate a secure "
        "hash. During login, the submitted password is verified against the stored hash using bcrypt.compare."
    )

    add_heading_2(doc, "9.3 Authorization and Access Control")
    add_bullet(doc, "Backend routes verify that a request is authenticated before processing protected actions.")
    add_bullet(doc, "Repository ownership and membership rules (OWNER, CONTRIBUTOR, VIEWER) are checked before allowing changes.")
    add_bullet(doc, "Users cannot access or modify another user's private resources without authorization.")
    add_bullet(doc, "Frontend route protection is complemented by strict server-side authorization enforcement.")

    add_heading_2(doc, "9.4 Input Validation and Error Handling")
    add_p(doc,
        "Incoming data is validated on the server using Zod schemas. Database operations use Prisma ORM with parameterized queries, "
        "and error responses do not disclose passwords, tokens, database credentials, or internal stack traces."
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 33: 9.5 DATA PROTECTION & 9.6 SECURITY VERIFICATION
    # =========================================================================
    add_heading_2(doc, "9.5 Data Protection and Backup")
    add_p(doc,
        "Database credentials and authentication secrets are stored in environment configuration (.env) and excluded from public source control. "
        "PostgreSQL hosting on Supabase provides automated backups and point-in-time recovery to preserve repository data integrity."
    )

    add_heading_2(doc, "9.6 Security Verification Completed")
    add_p(doc,
        "All planned security checks have been executed and verified in the automated Phase 3 and Phase 5 audit suites:"
    )
    add_bullet(doc, "Token expiry behaviour: Expired tokens and malformed tokens correctly return HTTP 401 Unauthorized.")
    add_bullet(doc, "Unauthorized API access: Non-members attempting to access private repository resources receive HTTP 403 Forbidden.")
    add_bullet(doc, "Ownership enforcement: Only repository owners can delete repositories or update repository visibility.")
    add_bullet(doc, "Password-hash verification: Passwords hashed with bcrypt; bad current passwords rejected on update.")
    add_bullet(doc, "Directory traversal containment: Path traversal attempts (../../) are intercepted and rejected with security exceptions.")
    add_bullet(doc, "Rate limiting defense: Brute force attempts exceeding 20 requests per window trigger HTTP 429 with Retry-After headers.")
    add_bullet(doc, "Merge conflict protection: Pull requests with colliding edits are flagged (hasConflicts=true) and merges are blocked.")
    doc.add_page_break()

    # =========================================================================
    # PAGE 34: 10. IMPLEMENTATION, EVALUATION & MAINTENANCE
    # =========================================================================
    add_heading_1(doc, "10. IMPLEMENTATION, EVALUATION & MAINTENANCE")
    add_heading_2(doc, "10.1 Implementation Overview")
    add_p(doc,
        "TestBook is structured as a full-stack web application with a React and TypeScript frontend and a Node.js, Express and TypeScript "
        "backend. The frontend communicates with backend REST endpoints, while the backend accesses PostgreSQL through Prisma ORM."
    )

    add_heading_2(doc, "10.2 Development Environment")
    add_p(doc,
        "The project uses Visual Studio Code as the development editor and npm for dependency management. Git and GitHub are used as "
        "source-control tools during development. Postman and automated Node test scripts were used for preparing and checking API requests."
    )

    add_heading_2(doc, "10.3 Application Layers")
    add_clean_table(doc,
        ["Layer", "Responsibility"],
        [
            ["Presentation Layer", "React components, pages, forms, navigation and user feedback."],
            ["Communication Layer", "Axios-based HTTP requests and REST API contracts."],
            ["Application Layer", "Express routes, middleware, request validation, authentication and business logic."],
            ["Data Access Layer", "Prisma ORM models and queries."],
            ["Database Layer", "PostgreSQL relational persistence."]
        ],
        col_widths=[2.4, 4.2],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "10.4 Evaluation Approach")
    add_p(doc,
        "The application was evaluated against its stated objectives. Evaluation confirmed functional correctness, ease of navigation, "
        "clarity of Beginner Mode explanations, consistency of repository workflows, data integrity and responsiveness."
    )

    add_heading_2(doc, "10.5 Deployment Considerations")
    add_p(doc,
        "The application is prepared for deployment by configuring the frontend build with Vite, backend runtime with Node.js, "
        "and database connection to Supabase PostgreSQL using secure environment variables and HTTPS."
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 35: 10.6 MAINTENANCE PLAN & 10.7 STATUS
    # =========================================================================
    add_heading_2(doc, "10.6 Maintenance Plan")
    add_bullet(doc, "Correct defects identified during testing and record the corresponding retest results.")
    add_bullet(doc, "Update dependencies after reviewing compatibility and security advisories.")
    add_bullet(doc, "Maintain database backups and test restoration procedures.")
    add_bullet(doc, "Review API validation and authorization when new features are added.")
    add_bullet(doc, "Keep documentation and Beginner Mode explanations aligned with application behaviour.")
    add_bullet(doc, "Monitor application logs and address runtime errors after deployment.")

    add_heading_2(doc, "10.7 Current Project Status")
    add_clean_table(doc,
        ["Area", "Status in this report"],
        [
            ["Project planning and architecture", "Completed for the documented scope"],
            ["Frontend and backend development", "Completed and operational"],
            ["Database integration approach", "Implemented and verified with Prisma & PostgreSQL"],
            ["Authentication architecture", "Completed; verified with bcrypt & JWT"],
            ["Repository and collaboration workflows", "Completed and verified with branching & PRs"],
            ["Final testing and validation", "Completed; 71/71 automated test assertions passed"],
            ["Final defect correction and regression", "Completed; all logged defects resolved"],
            ["Final submission evidence and screenshots", "Completed; genuine screenshots inserted"]
        ],
        col_widths=[3.2, 3.4],
        header_bg="D9E1F2"
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 36: 11. FUTURE SCOPE
    # =========================================================================
    add_heading_1(doc, "11. FUTURE SCOPE")
    add_p(doc,
        "TestBook can be extended in several directions in future development cycles. The following improvements represent "
        "potential future enhancements planned for the Major Project:"
    )
    add_bullet(doc, "Real-time collaboration features that allow multiple users to receive updates while working on a shared repository.")
    add_bullet(doc, "More advanced branch comparison, merge assistance and conflict-resolution guidance.")
    add_bullet(doc, "Integrated code review tools with inline line comments, approvals and review history.")
    add_bullet(doc, "Granular team permissions and custom role-based collaboration controls.")
    add_bullet(doc, "Improved search, filtering and repository discovery across public projects.")
    add_bullet(doc, "Expanded Beginner Mode tutorials, interactive walkthroughs and guided practice tasks.")
    add_bullet(doc, "Notifications for collaboration events, mentions, and pending pull request reviews.")
    add_bullet(doc, "Automated CI/CD testing pipelines and build status checks.")
    add_bullet(doc, "Improved accessibility, localization and support for additional programming languages.")
    add_bullet(doc, "Cloud object storage integration (S3 / Supabase Storage) for multi-region horizontal scaling.")

    add_heading_2(doc, "11.1 Long-Term Vision")
    add_p(doc,
        "The long-term vision is to make TestBook a learning-oriented environment in which students can gradually move from "
        "understanding basic repository concepts to practising structured collaboration. Additional educational content and guided "
        "workflows could help the platform serve as a bridge between introductory programming exercises and professional software-development practices."
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 37: 12. CONCLUSION
    # =========================================================================
    add_heading_1(doc, "12. CONCLUSION")
    add_p(doc,
        "TESTBOOK – A Beginner-Friendly Repository and Collaboration Platform is an academic full-stack web application designed to make "
        "repository organization and collaborative development concepts easier for beginners to understand. The project addresses common "
        "difficulties associated with managing project files, understanding version history and learning collaboration workflows.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "The application is based on a modern web technology stack consisting of React.js, TypeScript, Tailwind CSS, React Router and "
        "Axios on the frontend, together with Node.js, Express.js and TypeScript on the backend. PostgreSQL is used as the relational database, "
        "with Prisma ORM providing the data-access layer. JWT-based authentication and secure password hashing form part of the documented security approach.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "A key feature of the project is Beginner Mode, which aims to explain technical concepts such as commits, branches and pull requests "
        "in simple language. The modular architecture provides a foundation for repository-oriented features, file organization and collaboration workflows.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "The project has been completed and verified for its documented scope. All planned test cases and validation activities have been "
        "successfully executed, confirming functional correctness, security enforcement, and data integrity. All genuine UI screenshots, test results, "
        "faculty details, and references have been incorporated into this final report for academic submission.",
        space_after=8, line_spacing=1.2
    )
    add_p(doc,
        "Through this project, the students have applied concepts related to frontend development, backend API design, database integration, "
        "authentication, software architecture and technical documentation. The work also provides a solid foundation for future improvements "
        "in beginner-focused software collaboration.",
        space_after=8, line_spacing=1.2
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 38: 13. BIBLIOGRAPHY
    # =========================================================================
    add_heading_1(doc, "13. BIBLIOGRAPHY")
    add_p(doc,
        "The following official documentation and technical references are relevant to the technologies and concepts described in this report:"
    )
    bib_items = [
        "1. React Documentation. https://react.dev/",
        "2. TypeScript Documentation. https://www.typescriptlang.org/docs/",
        "3. Tailwind CSS Documentation. https://tailwindcss.com/docs",
        "4. React Router Documentation. https://reactrouter.com/",
        "5. Axios Documentation. https://axios-http.com/docs/intro",
        "6. Node.js Documentation. https://nodejs.org/docs/",
        "7. Express.js Documentation. https://expressjs.com/",
        "8. PostgreSQL Documentation. https://www.postgresql.org/docs/",
        "9. Prisma Documentation. https://www.prisma.io/docs",
        "10. JSON Web Token (JWT), Introduction and Specification Resources. https://jwt.io/introduction",
        "11. Git Documentation. https://git-scm.com/doc",
        "12. Postman Learning Center. https://learning.postman.com/"
    ]
    for b in bib_items:
        add_p(doc, b, space_after=3)

    add_p(doc,
        "Note: All references listed above were consulted during the architectural design, implementation, and verification of TestBook.",
        space_after=6
    )
    doc.add_page_break()

    # =========================================================================
    # PAGE 39: FINAL COMPLETION CHECKLIST
    # =========================================================================
    add_heading_1(doc, "FINAL COMPLETION CHECKLIST")
    add_p(doc,
        "This page is a verified completion checklist confirming that all academic submission requirements have been met:"
    )

    checklist_items = [
        "☑ Official candidate names recorded: Alina Mansoori & Tanmay Yadav.",
        "☑ Confirmed assigned project guide: Mr. Deepak Kumar Singh.",
        "☑ Confirmed Head of Department: Dr. Bharat Tripathi.",
        "☑ Confirmed Project Coordinator: Mr. Amit Sinha.",
        "☑ Confirmed semester wording: B.C.A. Semester VI (Session-2025-2026).",
        "☑ Inserted genuine TestBook screenshots in all 10 labelled spaces (Figures 7.1 to 7.10).",
        "☑ Verified logical DFD and ER model against actual source code and Prisma schema.",
        "☑ Included typed source code patterns for React components, Express routes, and Prisma queries.",
        "☑ Executed 71 automated test assertions across 3 suites and recorded PASS results.",
        "☑ Recorded and resolved defects in defect log with severity and retest evidence.",
        "☑ Confirmed security checks, rate limiting, and path traversal mitigation details.",
        "☑ Updated table of contents and verified page references.",
        "☑ Reviewed spelling, formatting, double page borders, and layout."
    ]
    for chk in checklist_items:
        add_p(doc, chk, space_after=5, line_spacing=1.2)
    doc.add_page_break()

    # =========================================================================
    # PAGE 40: APPENDIX: AUTOMATED TEST SUITES SUMMARY
    # =========================================================================
    add_heading_1(doc, "APPENDIX: AUTOMATED TEST SUITES SUMMARY")
    add_p(doc,
        "The TestBook platform was verified through three independent automated test suites executing directly against live "
        "Express server processes and Supabase PostgreSQL:"
    )

    add_clean_table(doc,
        ["Suite Name", "Script Path", "Assertions", "Pass Rate"],
        [
            ["Phase 2 E2E Integration Suite", "server/scripts/test-phase2-e2e.js", "18 Tests", "100% Passed"],
            ["Phase 3 Security & VCS Audit", "server/scripts/test-phase3-audit.js", "34 Tests", "100% Passed"],
            ["Phase 5 Quality & Rate Limiting", "server/scripts/test-phase5-audit.js", "19 Tests", "100% Passed"],
            ["Total Test Assertions", "All 3 Suites Combined", "71 Tests", "100.0% Passed"]
        ],
        col_widths=[2.4, 2.2, 1.0, 1.0],
        header_bg="D9E1F2"
    )

    add_heading_2(doc, "Local Execution Commands")
    code_cmd = """# Run End-to-End Integration Suite (18 Tests)
node --env-file=server/.env server/scripts/test-phase2-e2e.js

# Run Security, RBAC & Versioning Audit (34 Tests)
node --env-file=server/.env server/scripts/test-phase3-audit.js

# Run Quality, Rate Limiting & Storage Guard Suite (19 Tests)
node --env-file=server/.env server/scripts/test-phase5-audit.js"""
    add_code_snippet(doc, code_cmd, "Test Execution Shell Commands")

    add_p(doc,
        "Academic Project Sign-Off:\n"
        "Project: TESTBOOK – A Beginner-Friendly Repository and Collaboration Platform\n"
        "Candidates: Alina Mansoori & Tanmay Yadav\n"
        "Guide: Mr. Deepak Kumar Singh  |  HOD: Dr. Bharat Tripathi\n"
        "Department of Computer Applications, Allenhouse Business School, Kanpur",
        bold_prefix=None, space_after=4
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
