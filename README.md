# DELULU — AI Hiring Intelligence Platform

> **We don’t rank resumes. We rank evidence.**

DELULU is an evidence-driven hiring intelligence system that turns resumes + public proof (GitHub / LinkedIn / LeetCode / portfolios) into **explainable capability, risk, and “hidden talent” signals**, then ranks candidates against a role blueprint generated from the job description.

## What’s in this repo

```
IntelliHire/
├── frontend/          # Next.js (App Router) recruiter dashboard
├── backend/           # FastAPI API + scoring/intelligence pipeline
├── shared/            # Shared schemas/contracts (if present)
├── docs/              # Architecture + scoring docs
├── datasets/          # Demo dataset / evaluation assets
└── docker-compose.yml # Postgres + Redis + Qdrant for local dev
```

## Local development (quick start)

### Prerequisites

- Docker + Docker Compose
- Node.js 20+
- Python 3.10+

### 1) Start infrastructure (Postgres, Redis, Qdrant)

From the repo root:

```bash
docker compose up -d postgres redis qdrant
```

### 2) Backend (FastAPI)

The backend **will not start** unless the database has been migrated to the current Alembic head.

```bash
cd backend
python -m venv .venv
```

Activate the venv:

- Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

- macOS/Linux:

```bash
source .venv/bin/activate
```

Install deps + configure env:

```bash
pip install -r requirements.txt
copy .env.example .env
```

Run migrations (required):

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

- **Health**: `http://localhost:8000/health`
- **API docs**: `http://localhost:8000/docs`

#### Backend environment variables

See `backend/.env.example` for the full list. The most important ones:

- **DATABASE_URL**: async SQLAlchemy URL (default points at docker-compose Postgres)
- **DATABASE_URL_SYNC / DIRECT_URL**: sync URL for Alembic / DDL
- **GEMINI_API_KEY**: required for the default LLM provider (`LLM_PROVIDER=gemini`)
- **GITHUB_TOKEN**: recommended for GitHub evidence throughput
- **APIFY_TOKEN**: optional (LinkedIn evidence via Apify actor)

> Note: GitHub “intel cache” defaults to SQLite (`GITHUB_INTEL_DB_URL=sqlite:///./github_intel.db`) for zero-setup local dev. If you switch it to Postgres, you must also run: `alembic -c alembic_gh.ini upgrade head`.

### 3) Frontend (Next.js)

```bash
cd frontend
npm install
```

Set the backend URL (optional). By default the app uses `http://localhost:8000/api`.

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the dashboard:

```bash
npm run dev
```

- **Dashboard**: `http://localhost:3000`

## Product flow (MVP)

1. Recruiter signs up / logs in
2. Create a job (paste JD text or upload a JD file)
3. Upload candidates (resume + optional links)
4. DELULU ingests evidence and runs analysis
5. View rankings + candidate detail + explanation + interview focus

## Key APIs (high level)

Most endpoints are under **`/api`** (v1 business API) and **`/v2`** (v2 intelligence API).

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- **Jobs**
  - `POST /api/jobs` (creates role blueprint from JD)
  - `GET /api/jobs`
  - `GET /api/jobs/{job_id}`
  - `GET /api/jobs/{job_id}/candidates`
  - `GET /api/jobs/{job_id}/rankings`
- **Candidates**
  - `POST /api/candidates` (multipart; triggers background analysis)
  - `GET /api/candidates/{candidate_id}`
  - `POST /api/candidates/{candidate_id}/analyze` (manual trigger; usually not needed)
- **Evaluation / graphs (v2)**
  - `POST /v2/evaluations`
  - `GET /v2/graph/{graph_id}`

## Scoring (conceptual)

DELULU produces multiple signals (capability, risk, hidden talent, confidence) and then ranks candidates with an explainable final score.

For deeper details, see:

- `docs/scoring.md`
- `docs/hld.md`
- `docs/lld.md`

## Troubleshooting

- **Backend crashes at startup with “Database has not been migrated”**: run `alembic upgrade head` from `backend/`.
- **CORS issues**: ensure `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000`.
- **GitHub rate limits**: set `GITHUB_TOKEN` in `backend/.env`.

