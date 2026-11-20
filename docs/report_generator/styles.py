import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

NAVY_COLOR = RGBColor(30, 58, 138)       # #1E3A8A
CHARCOAL_COLOR = RGBColor(30, 41, 59)    # #1E293B
MUTED_COLOR = RGBColor(100, 116, 139)    # #64748B
TEXT_COLOR = RGBColor(45, 55, 72)        # #2D3748

def setup_document():
    doc = docx.Document()
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)  # Gutter for spiral/hardcover binding
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True
        
        # Configure Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("TESTBOOK: BCA Minor Project Report (2026–2027)")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = MUTED_COLOR

        # Configure Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Allenhouse Business School  •  Department of Computer Applications")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = MUTED_COLOR

    return doc

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_h1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(17)
    run.font.bold = True
    run.font.color.rgb = NAVY_COLOR
    return p

def add_h2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(11)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(13.5)
    run.font.bold = True
    run.font.color.rgb = CHARCOAL_COLOR
    return p

def add_h3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11.5)
    run.font.bold = True
    run.font.color.rgb = CHARCOAL_COLOR
    return p

def add_p(doc, text, bold_prefix=None, italic=False, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        brun = p.add_run(bold_prefix)
        brun.font.name = "Calibri"
        brun.font.size = Pt(11)
        brun.font.bold = True
        brun.font.color.rgb = CHARCOAL_COLOR
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.italic = italic
    run.font.color.rgb = TEXT_COLOR
    return p

def add_bullet(doc, text, bold_prefix=None, level=0):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.left_indent = Inches(0.25 * (level + 1))
    if bold_prefix:
        brun = p.add_run(bold_prefix)
        brun.font.name = "Calibri"
        brun.font.size = Pt(11)
        brun.font.bold = True
        brun.font.color.rgb = CHARCOAL_COLOR
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.color.rgb = TEXT_COLOR
    return p

def add_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_shading(hdr_cells[i], "1E293B")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=150, right=150)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for run in p.runs:
            run.font.name = "Calibri"
            run.font.size = Pt(10)
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for r_idx, row in enumerate(rows):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate(row):
            row_cells[c_idx].text = str(val)
            set_cell_shading(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=150, right=150)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = "Calibri"
                run.font.size = Pt(9.5)
                run.font.color.rgb = TEXT_COLOR

    # Set column widths if provided
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                if i < len(row.cells):
                    row.cells[i].width = Inches(w)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return table

def add_code_block(doc, code_str, title=None):
    if title:
        tp = doc.add_paragraph()
        tp.paragraph_format.space_before = Pt(6)
        tp.paragraph_format.space_after = Pt(2)
        tp.paragraph_format.keep_with_next = True
        trun = tp.add_run(f"Listing: {title}")
        trun.font.name = "Calibri"
        trun.font.size = Pt(10)
        trun.font.bold = True
        trun.font.color.rgb = NAVY_COLOR

    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, "F1F5F9")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    cell.paragraphs[0].text = ""
    lines = code_str.strip().split("\n")
    for i, line in enumerate(lines):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        run = p.add_run(line)
        run.font.name = "Consolas"
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(30, 41, 59)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_callout(doc, text, title="IMPORTANT NOTICE"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, "EFF6FF")
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    brun = p.add_run(f"[{title}] ")
    brun.font.name = "Calibri"
    brun.font.size = Pt(10)
    brun.font.bold = True
    brun.font.color.rgb = NAVY_COLOR

    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(10)
    run.font.color.rgb = TEXT_COLOR

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_image_figure(doc, img_path, caption, width_in=5.8):
    if os.path.exists(img_path):
        try:
            from PIL import Image
            import io
            im = Image.open(img_path)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA")
            bio = io.BytesIO()
            im.save(bio, format="PNG")
            bio.seek(0)

            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(4)
            run = p.add_run()
            run.add_picture(bio, width=Inches(width_in))

            cp = doc.add_paragraph()
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cp.paragraph_format.space_after = Pt(8)
            crun = cp.add_run(caption)
            crun.font.name = "Calibri"
            crun.font.size = Pt(9.5)
            crun.font.italic = True
            crun.font.bold = True
            crun.font.color.rgb = CHARCOAL_COLOR
        except Exception as e:
            add_callout(doc, f"Could not embed image '{caption}': {str(e)}", title="IMAGE LOAD ERROR")
    else:
        add_callout(doc, f"Image reference '{caption}' located at {img_path}", title="SCREENSHOT FIGURE")

def add_page_break(doc):
    doc.add_page_break()
