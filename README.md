# ProfileFlow

ProfileFlow is a resume and personal-profile parsing tool with a Next.js frontend and a FastAPI backend. It can extract structured information from images, PDFs, DOCX, TXT, or pasted text, then let you review, edit, store, and reuse the results in a local knowledge base.(Currently only supports Chinese)

## Features

- Upload files or paste raw text for profile extraction
- Support image, PDF, DOCX, and TXT inputs
- Use OCR and LLM-based parsing to turn unstructured content into structured profile data
- Edit parsed basic info, education history, certificates, languages, and experience records
- Save results into a local SQLite knowledge base
- Fill templates with structured data

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, Python
- OCR and parsing: PaddleOCR, PyMuPDF, python-docx, Ark runtime SDK
- Storage: SQLite

## Project Structure

```text
app/                Next.js App Router pages
components/         Reusable UI components
lib/                Frontend utility helpers
main.py             FastAPI backend entry
requirements-backend.txt
package.json
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- Git

## Environment Variables

Create a `.env` file in the project root and configure the backend variables as needed:

```env
ARK_API_KEY=your_api_key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_TEXT_ENDPOINT_ID=your_text_model_endpoint
ARK_VISION_ENDPOINT_ID=your_vision_model_endpoint
ARK_TIMEOUT=180
ARK_MAX_TOKENS=4000
OCR_LANG=ch
PDF_TEXT_THRESHOLD=80
MAX_TEXT_CHARS=12000
```

## Install

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
pip install -r requirements-backend.txt
```

## Run Locally

Start the backend:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

- `POST /api/extract`
- `POST /api/knowledge/save`
- `GET /api/knowledge-bases`
- `POST /api/knowledge-bases`
- `PUT /api/knowledge-bases/{knowledge_base_id}`
- `DELETE /api/knowledge-bases/{knowledge_base_id}`
- `POST /api/templates/fill`
- `GET /health`

## Notes

- The local SQLite database is ignored in Git by default.
- Build output and cache folders are also ignored to keep the repository clean.
- Some OCR and model features depend on external service credentials being configured correctly.
