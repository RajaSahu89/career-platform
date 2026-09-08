# CareerPilot — Free AI-Powered Job & Career Platform

A full-stack job & career platform: job matching, an ATS resume scanner, an
application tracker, an interview tracker, a recruiter dashboard, notifications,
and AI-style career recommendations — built entirely on free tools, with no
paid APIs or hosted database required.

## Why this stack (no paid services)

| Feature | How it's free |
|---|---|
| Job listings | [Arbeitnow Job Board API](https://www.arbeitnow.com/api/job-board-api) (global, no key) + [Adzuna India API](https://developer.adzuna.com/) (India-specific, free key) |
| Database | SQLite via Node's built-in `node:sqlite` module — a local file, no hosted DB bill, and no native compiler needed (requires Node 22.5+) |
| ATS scanning & AI recommendations | Local keyword/TF-IDF matching in `backend/utils/` — no LLM API calls, so no per-request cost |
| Auth | Self-hosted JWT + bcrypt — no third-party auth provider |

This keeps the whole thing deployable on free tiers (Render, Railway, Fly.io,
Vercel) with zero recurring API cost, which makes it easy to keep live for a
portfolio link.

> **Want smarter AI matching later?** Swap the scoring in
> `backend/utils/matcher.js` for a call to a free-tier LLM (Groq, Gemini free
> tier) using the same resume/job text inputs — the rest of the app doesn't
> need to change.

## Architecture

```
career-platform/
├── backend/               Express API (port 5000)
│   ├── db/init.js          SQLite schema (users, resumes, jobs, applications, interviews, notifications)
│   ├── middleware/auth.js  JWT auth guard + role check
│   ├── routes/             auth, jobs, resume, applications, interviews, recruiter, notifications
│   └── utils/
│       ├── atsScanner.js   Skill/keyword extraction + ATS scoring
│       └── matcher.js      TF-IDF cosine similarity for job recommendations
└── frontend/               React + Vite + Tailwind (port 5173)
    └── src/
        ├── api/client.js   Fetch wrapper for the API
        ├── context/        Auth context (JWT stored in session)
        └── pages/          Home, Login, Register, Jobs, JobDetail, Resume,
                             Applications, Interviews, RecruiterDashboard, Notifications
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET to a random string
npm run dev            # http://localhost:5000
```

> Requires Node.js 22.5+ (the database uses Node's built-in `node:sqlite`
> module — no native compiler or Visual Studio Build Tools needed). You'll
> see a one-line "SQLite is experimental" warning in the console; that's
> expected and harmless.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so just run
both and open the frontend URL.

### Or: run both from a single terminal

From the project root (one time):

```bash
npm install
npm run install:all
```

Then every time you want to run the app:

```bash
npm run dev
```

This uses `concurrently` to start the backend and frontend in one terminal,
with labeled/color-coded output for each. Ctrl+C stops both.

### 3. Load real job listings

Once both servers are running, sign up, go to **Jobs**, and click
**"Sync latest jobs (free API)"**. This pulls live listings from Arbeitnow
into your local SQLite database — no API key needed.

### 4. Load India-specific job listings (optional)

1. Sign up free at [developer.adzuna.com](https://developer.adzuna.com/) — you'll
   get an `App ID` and `App Key` instantly.
2. Add them to `backend/.env`:
   ```
   ADZUNA_APP_ID=your_app_id
   ADZUNA_APP_KEY=your_app_key
   ```
3. Restart the backend, then click **"Sync India jobs"** on the Jobs page.
   You can optionally type a keyword (e.g. "developer") and a city
   (e.g. "Bangalore") before syncing to narrow the results.
4. Use the **Country** filter on the Jobs page to show only India listings.

Adzuna's free tier allows a generous number of calls per month — more than
enough for a portfolio demo.

## Core user flows

- **Job seeker**: register → paste resume on the ATS Scanner page → browse or
  sync jobs → click a job to see your match score → apply → track status on
  the Applications kanban → schedule interviews → see updates on Notifications.
- **Recruiter**: register with the "Recruiter" role → post a job → view
  applicants automatically ranked by resume match score.

## Deploying for your portfolio

- **Backend**: Render or Railway free tier (Node service). Set `JWT_SECRET`
  and `JOB_API_URL` as environment variables. The SQLite file persists on
  Render's disk for the free tier's lifetime (fine for a demo).
- **Frontend**: Vercel or Netlify free tier. Set the API base URL (update
  `src/api/client.js`'s `BASE` constant, or add a Vite proxy/env var) to point
  at your deployed backend.

## Pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: CareerPilot job & career platform"
git branch -M main
git remote add origin https://github.com/<your-username>/career-platform.git
git push -u origin main
```

## Resume/portfolio bullet (suggested)

> Built CareerPilot, a full-stack job platform (React, Express, SQLite) with
> an ATS resume scanner and TF-IDF-based job recommendation engine built from
> scratch — no paid AI API — plus an application tracker, interview tracker,
> and recruiter dashboard with applicant ranking.
