# AI Job Frontend 🎯

A job matching web app that extracts skills from resumes and recommends jobs using AI analysis.

## Tech Stack

- **Frontend:** React 19, React Router 7, Axios
- **Backend:** Express 5, Multer, pdf-parse
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Security:** Helmet, express-rate-limit, bcrypt via Supabase

## Project Structure

```
├── backend/
│   ├── controllers/       # Business logic (auth, resume)
│   ├── middleware/        # Auth + file upload
│   ├── routes/            # API route definitions
│   ├── supabase/          # SQL schema (run in Supabase)
│   ├── utils/             # Supabase client
│   └── server.js          # Express entry point
├── src/
│   ├── api/               # Axios instance
│   ├── components/        # Login, Signup, Dashboard
│   ├── context/           # AuthContext
│   └── pages/             # ResumeUpload page
└── package.json
```

## Setup Instructions

### 1. Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → New query
3. Copy the contents of `backend/supabase/schema.sql` and run it
4. Go to **Project Settings** → **API**
5. Copy your `Project URL` and `anon public` key

### 2. Backend

```bash
cd backend
npm install
```

Edit `backend/.env`:

```env
PORT=5000
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_KEY=your-service-role-key   # from Settings > API > service_role
JWT_SECRET=your-strong-random-secret
CORS_ORIGINS=http://localhost:3000
```

> ⚠️ Never commit `.env` to git — it's in `.gitignore`.

Start the backend:

```bash
npm start
```

### 3. Frontend

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Create account | No |
| POST | `/api/auth/login` | Login, get JWT | No |
| GET | `/api/profile` | Get user profile | Yes |
| POST | `/api/resume/extract` | Upload PDF, extract text | Yes |

## Current Features

- ✅ Signup / Login with JWT auth (via Supabase)
- ✅ Protected routes (Dashboard, Resume)
- ✅ PDF resume upload + text extraction
- ✅ Resume text stored in Supabase per user
- ✅ Basic job recommendation mock UI

## Roadmap

- [ ] Real AI skill extraction (OpenAI / NLP)
- [ ] Real job matching engine (match %, trust score)
- [ ] Resume history & re-analysis
- [ ] Profile editing
- [ ] Deploy (Render/Railway + Vercel/Netlify)