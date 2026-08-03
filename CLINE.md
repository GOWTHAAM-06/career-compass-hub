# Career Compass Hub Guidelines

## Project Architecture
- **Frontend**: React 19 + React Router 7 + Axios (Runs on `http://localhost:3000`)
- **Backend**: Express 5 + Node.js (Runs on `http://localhost:5000`)
- **Database & Auth**: Supabase (PostgreSQL + RLS + Auth)

## Core Capabilities
- PDF Upload & Parsing via `multer` and `pdf-parse`
- User Authentication with Supabase JWT & Row Level Security
- AI Skill Extraction & Matching Pipeline
- Dynamic Job Matching Engine (skill overlap → match % + trust score)
- Job Recommendations persisted to Supabase `job_recommendations` table

## Database Migrations
- SQL migrations live in `backend/sql/migrations/` (e.g., `001_create_job_recommendations.sql`)
- Run them in the Supabase SQL Editor:
  `https://supabase.com/dashboard/project/<PROJECT_REF>/sql/new`

## Critical Rules
- Keep `backend/` and root `src/` clean and separated.
- Never hardcode API keys or credentials; use process.env.
- Validate backend endpoints before updating frontend Axios calls.
- When querying/inserting Supabase tables, handle schema variations gracefully
  (try alternate column names and log warnings instead of returning a 500).
- Add a numbered SQL migration under `backend/sql/migrations/` whenever a new
  Supabase table or schema change is introduced.
