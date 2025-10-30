from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from utils.parse_docx import extract_placeholders
from utils.fill_placeholders import fill_placeholders_in_docx
from utils.ai_helper import get_ai_response
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Lexsy AI Legal Backend")

# Enable CORS for frontend (Vercel + local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, later we will restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMP_DIR = "tmp"
os.makedirs(TMP_DIR, exist_ok=True)


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
        placeholders = data.get("placeholders", [])
        values = data.get("values", {})
        file_id = str(uuid.uuid4())
        output_path = f"{TMP_DIR}/{file_id}.docx"
        fill_placeholders_in_docx(placeholders, values, output_path)
        return {"file_id": file_id}
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/download/{file_id}")
def download_file(file_id: str):
    path = f"{TMP_DIR}/{file_id}.docx"
    if os.path.exists(path):
        return FileResponse(path, filename="filled_document.docx")
    return JSONResponse(content={"error": "File not found"}, status_code=404)
