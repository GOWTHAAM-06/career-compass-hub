# Career Compass Hub Guidelines

## Project Architecture
- **Frontend**: React 19 + React Router 7 + Axios (Runs on `http://localhost:3000`)
- **Backend**: Express 5 + Node.js (Runs on `http://localhost:5000`)
- **Database & Auth**: Supabase (PostgreSQL + RLS + Auth)

## Core Capabilities
- PDF Upload & Parsing via `multer` and `pdf-parse`
- User Authentication with Supabase JWT & Row Level Security
- AI Skill Extraction & Matching Pipeline

## Critical Rules
- Keep `backend/` and root `src/` clean and separated.
- Never hardcode API keys or credentials; use process.env.
- Validate backend endpoints before updating frontend Axios calls.