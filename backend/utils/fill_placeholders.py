from docx import Document

def fill_placeholders_in_docx(placeholders, values, output_path):
    """Replace placeholders in a sample document template"""
    doc = Document("backend/sample_docs/Postmoney_Safe_Template.docx")  # use any test file
    for p in doc.paragraphs:
        for key in placeholders:
            if f"{{{{{key}}}}}" in p.text:
                p.text = p.text.replace(f"{{{{{key}}}}}", values.get(key, ""))
    doc.save(output_path)
