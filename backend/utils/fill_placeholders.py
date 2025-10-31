import os
from docx import Document

DEFAULT_TEMPLATE = os.path.join(
    os.path.dirname(__file__),
    "..",
    "sample_docs",
    "Postmoney_Safe_Template.docx"
)
DEFAULT_TEMPLATE = os.path.abspath(DEFAULT_TEMPLATE)


def _replace_in_paragraphs(doc, mapping: dict):
    for p in doc.paragraphs:
        if not p.text:
            continue
        new_text = p.text
        for key, val in mapping.items():
            new_text = new_text.replace(f"{{{{{key}}}}}", str(val))
        # If changed, update paragraph text (MVP: resets mixed formatting in that paragraph)
        if new_text != p.text:
            p.text = new_text

def _replace_in_tables(doc, mapping: dict):
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if not cell.text:
                    continue
                new_text = cell.text
                for key, val in mapping.items():
                    new_text = new_text.replace(f"{{{{{key}}}}}", str(val))
                if new_text != cell.text:
                    # Overwrite the cell's paragraphs simply
                    for p in cell.paragraphs:
                        p.text = new_text  # MVP: simplest path

def fill_placeholders_in_docx(input_path, placeholders, values, output_path):
    doc = Document(input_path)
    for p in doc.paragraphs:
        for key in placeholders:
            val = values.get(key, "")
            if not val:
                continue
            # Replace both {{key}} and [key]
            patterns = [
                "{{" + key + "}}",
                "[" + key + "]",
                "[" + key.replace("_", " ") + "]",
            ]
            for pattern in patterns:
                if pattern in p.text:
                    p.text = p.text.replace(pattern, val)
    doc.save(output_path)
