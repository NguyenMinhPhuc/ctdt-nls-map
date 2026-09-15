import json
import os
import sys
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def export_docx(input_json='curriculum_data.json', output_docx='2026-CNTT-Tóm tắt học phần.docx'):
    if not os.path.exists(input_json):
        print(f"Error: {input_json} does not exist.")
        return False
        
    with open(input_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    summaries = data.get('courseSummaries', data)
    if not summaries or not isinstance(summaries, dict):
        print("Warning: No valid course summaries found in data.")
        return False
        
    doc = docx.Document()
    
    # Page setup - Standard A4 / 1 inch margins
    for s in doc.sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)
        
    # Header paragraphs
    p0 = doc.add_paragraph()
    r0 = p0.add_run('TRƯỜNG ĐẠI HỌC LẠC HỒNG')
    r0.font.name = 'Times New Roman'
    r0.font.size = Pt(13)
    
    p1 = doc.add_paragraph()
    r1 = p1.add_run('KHOA CÔNG NGHỆ THÔNG TIN')
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(13)
    r1.bold = True
    
    doc.add_paragraph()
    
    p3 = doc.add_paragraph()
    p3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r3 = p3.add_run('TÓM TẮT HỌC PHẦN')
    r3.font.name = 'Times New Roman'
    r3.font.size = Pt(14)
    r3.bold = True
    
    p4 = doc.add_paragraph()
    p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r4 = p4.add_run('NGÀNH: CÔNG NGHỆ THÔNG TIN')
    r4.font.name = 'Times New Roman'
    r4.font.size = Pt(13)
    r4.bold = True
    
    doc.add_paragraph()
    
    count = 0
    for code, item in summaries.items():
        title = item.get('title', '')
        desc = item.get('description', '').strip()
        refs = item.get('references', '').strip()
        
        count += 1
        # Heading 1: <Code> - <Title>
        h = doc.add_heading(level=1)
        rh = h.add_run(f"{code} - {title}")
        rh.font.name = 'Times New Roman'
        rh.font.size = Pt(13)
        rh.bold = True
        rh.font.color.rgb = RGBColor(0, 0, 0)
        
        # Course Description paragraphs
        if desc:
            for para in desc.split('\n\n'):
                p_desc = para.strip()
                if p_desc:
                    pd = doc.add_paragraph()
                    rd = pd.add_run(p_desc)
                    rd.font.name = 'Times New Roman'
                    rd.font.size = Pt(12)
                    
        # References
        if refs:
            pr_label = doc.add_paragraph()
            rr_label = pr_label.add_run('Tài liệu tham khảo:')
            rr_label.font.name = 'Times New Roman'
            rr_label.font.size = Pt(12)
            rr_label.bold = True
            
            for r_line in refs.split('\n'):
                line_txt = r_line.strip()
                if line_txt:
                    pr = doc.add_paragraph()
                    rr = pr.add_run(line_txt)
                    rr.font.name = 'Times New Roman'
                    rr.font.size = Pt(12)
                    
    doc.save(output_docx)
    print(f"Successfully exported {count} course summaries to '{output_docx}'!")
    return True

if __name__ == '__main__':
    out_file = sys.argv[1] if len(sys.argv) > 1 else '2026-CNTT-Tóm tắt học phần.docx'
    export_docx(output_docx=out_file)
