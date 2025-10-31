from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from utils.parse_docx import extract_placeholders
from utils.fill_placeholders import fill_placeholders_in_docx
from utils.ai_helper import get_ai_response
import uuid
import os, json
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError
from typing import List, Dict, Optional

load_dotenv()

PORT = int(os.getenv("PORT", "10000"))   # Render provides PORT env var
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "backend/tmp")
os.makedirs(UPLOAD_DIR, exist_ok=True)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "*") 

app = FastAPI(title="Lexsy AI Legal Backend")

# Enable CORS for frontend (Vercel + local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN] if FRONTEND_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeneratePayload(BaseModel):
    placeholders: List[str] = Field(default_factory=list)
    values: Dict[str, str] = Field(default_factory=dict)
    template_path: Optional[str] = None

@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/parse")
async def parse_doc(file: UploadFile):
    """Upload and extract placeholders from a new Word template."""
    # Save unique copy
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.docx")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    placeholders = extract_placeholders(open(file_path, "rb").read())

    return {"file_id": file_id, "placeholders": placeholders}


@app.post("/chat")
async def chat_handler(message: str = Form(...), placeholder: str = Form(...)):
    try:
        ai_reply = get_ai_response(message, placeholder)
        return {"response": ai_reply}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/generate")
async def generate_doc(payload: dict):
    """Fill the placeholders in the user’s uploaded file."""
    placeholders = payload.get("placeholders", [])
    values = payload.get("values", {})
    file_id = payload.get("file_id")

    # Ensure the file exists
    input_path = os.path.join(UPLOAD_DIR, f"{file_id}.docx")
    if not os.path.exists(input_path):
        return {"error": f"Template not found for file_id: {file_id}"}

    output_id = str(uuid.uuid4())
    output_path = os.path.join(UPLOAD_DIR, f"{output_id}.docx")

    fill_placeholders_in_docx(input_path, placeholders, values, output_path)

    return {"file_id": output_id}



@app.get("/download/{file_id}")
async def download_filled_doc(file_id: str):
    """Download the generated filled document."""
    path = os.path.join(UPLOAD_DIR, f"{file_id}.docx")
    if not os.path.exists(path):
        return {"error": "File not found"}
    return FileResponse(path, filename="filled_document.docx")
