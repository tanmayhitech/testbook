import os
import sys
import docx
from docx2pdf import convert
import pypdf

# Add local directory to path for imports
curr_dir = os.path.dirname(os.path.abspath(__file__))
if curr_dir not in sys.path:
    sys.path.insert(0, curr_dir)

from styles import setup_document
from preliminaries import build_preliminaries
from chapters_1_to_5 import build_chapters_1_to_5
from chapter_6 import build_chapter_6
from chapter_7 import build_chapter_7
from chapter_8 import build_chapter_8
from chapters_9_to_13 import build_chapters_9_to_13

def generate_report():
    print("=================================================================")
    print("   GENERATING TESTBOOK BCA MINOR PROJECT FINAL REPORT (40+ PGS)  ")
    print("=================================================================\n")

    media_dir = "C:/Users/Acer/.gemini/antigravity/brain/e7e3fe0b-71cb-4454-a5b8-855a721fed6a/.user_uploaded"
    docs_dir = os.path.abspath(os.path.join(curr_dir, ".."))
    output_docx = os.path.join(docs_dir, "TESTBOOK_BCA_Minor_Project_Report_Final.docx")
    output_pdf = os.path.join(docs_dir, "TESTBOOK_BCA_Minor_Project_Report_Final.pdf")

    print("[1/5] Setting up document formatting, styles, margins, headers & footers...")
    doc = setup_document()

    print("[2/5] Building Preliminaries (Cover, Certificate, Ack, Dec, Abstract, TOC, List of Figures & Tables)...")
    build_preliminaries(doc)

    print("[3/5] Building Chapters 1 through 5 (Introduction, Objectives, Preliminary Analysis, Category/Arch, SRS)...")
    build_chapters_1_to_5(doc)

    print("[4/5] Building Chapter 6 (Detailed System Analysis: DFDs, Algorithms, 13 Data Tables, ERD)...")
    build_chapter_6(doc)

    print("[5/5] Building Chapter 7 (Design, 8 Full Production Code Listings, Screenshots & UI Walkthroughs)...")
    build_chapter_7(doc, media_dir)

    print("[6/5] Building Chapter 8 (Testing & QA: All 71 Tests Matrix, Defect Tracking & Retest Logs)...")
    build_chapter_8(doc)

    print("[7/5] Building Chapters 9 to 13 & Appendix (Security, Implementation, Future Scope, Conclusion, References, API)...")
    build_chapters_9_to_13(doc)

    print(f"\nSaving Word Document to: {output_docx}...")
    doc.save(output_docx)
    print(f"✓ Word document successfully saved! Size: {os.path.getsize(output_docx):,} bytes.")

    print(f"\nConverting DOCX to PDF via Microsoft Word COM engine ({output_pdf})...")
    convert(output_docx, output_pdf)
    print(f"✓ PDF conversion complete! Size: {os.path.getsize(output_pdf):,} bytes.")

    print("\nVerifying PDF page count with pypdf...")
    reader = pypdf.PdfReader(output_pdf)
    total_pages = len(reader.pages)
    print(f"=================================================================")
    print(f"🎉 FINAL PDF GENERATED: {total_pages} PAGES! 🎉")
    print(f"Target: Minimum 40 Pages | Achieved: {total_pages} Pages")
    print(f"=================================================================\n")

    if total_pages < 40:
        print(f"⚠️ WARNING: Generated {total_pages} pages, which is below the 40-page minimum requirement!")
        sys.exit(1)
    else:
        print("✓ SUCCESS: Exceeds the 40-page minimum requirement comfortably!")

if __name__ == "__main__":
    generate_report()
