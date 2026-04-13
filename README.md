# MedAssist AI

A full-stack medical assistant platform powered by Claude. Patients can chat with an AI health assistant, run structured symptom assessments, manage their medical profile, browse providers, and book appointments.

> **Disclaimer:** MedAssist AI is an informational tool. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified clinician for medical decisions, and call emergency services for urgent situations.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + React Router
- **Backend:** Node.js + Express + TypeScript + Prisma ORM
- **Database:** PostgreSQL 16
- **AI:** Anthropic Claude via `@anthropic-ai/sdk` (with prompt caching + streaming)
- **Auth:** Email + password (bcrypt) with JWT sessions

## Project Layout

```
Medassistai/
├── client/          # React + Vite frontend
├── server/          # Express + Prisma backend
├── docker-compose.yml
└── package.json     # npm workspaces
```

## Prerequisites

- Node.js 20+
- Docker (for Postgres) — or an existing Postgres instance
- An Anthropic API key (https://console.anthropic.com)

## Quick Start

```bash
# 1. Install dependencies (installs both workspaces)
npm install

# 2. Start Postgres
npm run db:up

# 3. Copy env and set secrets
cp server/.env.example server/.env
# edit server/.env and set ANTHROPIC_API_KEY and JWT_SECRET

# 4. Run migrations and seed
npm run db:migrate
npm run db:seed

# 5. Start dev servers (client :5173, server :4000)
npm run dev
```

Open http://localhost:5173. A demo account is seeded:

- **Email:** `demo@medassist.ai`
- **Password:** `demo1234`

## Environment Variables (`server/.env`)

| Name | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Secret used to sign session tokens |
| `ANTHROPIC_API_KEY` | Claude API key |
| `PORT` | Backend port (default `4000`) |
| `CLIENT_ORIGIN` | CORS origin for the frontend (default `http://localhost:5173`) |

## Scripts (root)

| Command | Description |
|---|---|
| `npm run dev` | Run server + client concurrently |
| `npm run build` | Build server and client for production |
| `npm start` | Start the built server |
| `npm run db:up` / `db:down` | Start / stop the Postgres container |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed providers and demo user |
| `npm run db:reset` | Drop and re-create the database |

## API Overview

All routes are prefixed with `/api`.

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /patients/me`, `PUT /patients/me`
- `GET /chat/conversations`, `POST /chat/conversations`
- `GET /chat/conversations/:id`, `DELETE /chat/conversations/:id`
- `POST /chat/conversations/:id/messages` — streams Claude via SSE
- `POST /symptoms/assess`, `GET /symptoms/history`
- `GET /providers`
- `GET /appointments`, `POST /appointments`
- `PATCH /appointments/:id`, `DELETE /appointments/:id`

## Features

- **AI Chat** — streamed Claude replies, persistent conversations.
- **Symptom Checker** — structured triage form returning an AI assessment with urgency.
- **Patient Profile** — DOB, allergies, medications, conditions, emergency contact.
- **Providers & Appointments** — browse clinicians, book, reschedule, cancel.
- **Auth** — JWT sessions, password hashing with bcrypt, protected routes.

## License

MIT
