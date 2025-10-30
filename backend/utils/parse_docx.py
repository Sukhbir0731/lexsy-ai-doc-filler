import re
from io import BytesIO
from docx import Document

def extract_placeholders(file_bytes: bytes):
    """
    Extract all unique placeholders in {{placeholder}} format from a .docx file.
    Returns a list of unique placeholder names in order of appearance.
    """
    try:
        doc = Document(BytesIO(file_bytes))
        placeholders = []

        # regex to detect {{placeholder}}
        pattern = r"{{(.*?)}}"

        for para in doc.paragraphs:
            matches = re.findall(pattern, para.text)
            for match in matches:
                if match not in placeholders:
                    placeholders.append(match.strip())

        # optional: handle tables (if document includes placeholders in cells)
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    matches = re.findall(pattern, cell.text)
                    for match in matches:
                        if match not in placeholders:
                            placeholders.append(match.strip())

        return placeholders
    except Exception as e:
        raise RuntimeError(f"Error extracting placeholders: {str(e)}")
