# Backend (FastAPI)

## Stack

- FastAPI + Uvicorn
- python-docx, python-multipart
- OpenAI SDK

## Dev

1. Python 3.11 recommended
2. Create venv:
   - PowerShell:
     ```
     py -3.11 -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
3. Install:
   - pip install -r requirements.txt
4. Run:
   - uvicorn main:app --reload

API → http://127.0.0.1:8000

## Env

Set:

- `OPENAI_API_KEY`

## Endpoints (planned)

- `GET /` — health
- `POST /parse` — docx → placeholders
- `POST /chat` — AI guidance
- `POST /generate` — fill + save
- `GET /download/{file_id}` — file download
