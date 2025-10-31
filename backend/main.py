from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from utils.parse_docx import extract_placeholders
from utils.fill_placeholders import fill_placeholders_in_docx
from utils.ai_helper import get_ai_response
import uuid
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError
from typing import List, Dict, Optional

load_dotenv()

app = FastAPI(title="Lexsy AI Legal Backend")

# Enable CORS for frontend (Vercel + local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMP_DIR = "tmp"
os.makedirs(TMP_DIR, exist_ok=True)


class GeneratePayload(BaseModel):
    placeholders: List[str] = Field(default_factory=list)
    values: Dict[str, str] = Field(default_factory=dict)
    # optional: allow a custom template path later
    template_path: Optional[str] = None

@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/parse")
async def parse_doc(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        placeholders = extract_placeholders(file_bytes)
        return {"placeholders": placeholders}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/chat")
async def chat_handler(message: str = Form(...), placeholder: str = Form(...)):
    try:
        ai_reply = get_ai_response(message, placeholder)
        return {"response": ai_reply}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.post("/generate")
async def generate_doc(data: dict):
    try:
        payload = GeneratePayload(**data)

        if not payload.values:
            return JSONResponse(
                content={"error": "Missing 'values' in request body."},
                status_code=400,
            )

        file_id = str(uuid.uuid4())
        output_path = os.path.join(TMP_DIR, f"{file_id}.docx")

        # For MVP: always use default template (or user-provided template_path, if given)
        fill_placeholders_in_docx(
            placeholders=payload.placeholders,
            values=payload.values,
            output_path=output_path,
            template_path=payload.template_path,  # None -> default template
        )

        return {"file_id": file_id}

    except ValidationError as ve:
        return JSONResponse(content={"error": ve.errors()}, status_code=422)
    except FileNotFoundError as fe:
        return JSONResponse(content={"error": str(fe)}, status_code=404)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/download/{file_id}")
def download_file(file_id: str):
    path = os.path.join("tmp", f"{file_id}.docx")

    if os.path.exists(path):
        return FileResponse(
            path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename="filled_document.docx",
        )

    return JSONResponse(content={"error": "File not found"}, status_code=404)
