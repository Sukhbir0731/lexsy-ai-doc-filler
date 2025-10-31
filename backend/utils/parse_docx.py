import re
from io import BytesIO
from docx import Document

def extract_placeholders(file_bytes: bytes):
    """Extract placeholders from a Word doc (supports {{ }} and [ ] formats)."""
    document = Document(BytesIO(file_bytes))
    text = []
    for para in document.paragraphs:
        text.append(para.text)
    combined = "\n".join(text)

    # Match {{Placeholder}} and [Placeholder]
    found = re.findall(r"\{\{(.*?)\}\}|\[(.*?)\]", combined)

    # Flatten and clean both types
    placeholders = [f[0] or f[1] for f in found]

    # Normalize to underscores instead of spaces
    normalized = []
    seen = set()
    for ph in placeholders:
        clean = ph.strip().replace(" ", "_")
        if clean and clean not in seen:
            normalized.append(clean)
            seen.add(clean)
    return normalized
