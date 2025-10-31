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

def fill_placeholders_in_docx(placeholders, values: dict, output_path: str, template_path: str = None):
    """
    Load a .docx template and replace all {{key}} with provided values.
    - placeholders: list[str] (unused for logic, but kept for signature parity)
    - values: dict[str, str]
    - output_path: where to save the generated .docx
    - template_path: optional override; uses DEFAULT_TEMPLATE if None
    """
    tpl_path = template_path or DEFAULT_TEMPLATE
    if not os.path.exists(tpl_path):
        raise FileNotFoundError(f"Template not found at: {tpl_path}")

    # Ensure output directory exists
    out_dir = os.path.dirname(output_path)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    doc = Document(tpl_path)

    # Replace in paragraphs and tables
    _replace_in_paragraphs(doc, values)
    _replace_in_tables(doc, values)

    doc.save(output_path)
    return output_path
