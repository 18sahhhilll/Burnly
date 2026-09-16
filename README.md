# Burnly — Startup Financial Model & Runway Simulator

Burnly is a financial simulation platform that lets startup founders model investment allocation, project runway/burn/break-even points, compare scenarios side-by-side, and receive explainable, rule-based advisory guidance.

---

## 🛠️ Local Development & Setup

### 1. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Configure your `.env` with PostgreSQL and Supabase credentials:
```env
# Database connection URL for Prisma (local Docker Postgres instance)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/burnly?schema=public"

# Supabase Auth Configuration (From your Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 2. Start PostgreSQL via Docker Compose
Spin up the local PostgreSQL 17 container (`burnly-db`):
```bash
docker compose up -d
```

### 3. Run Prisma Database Migrations
Apply schema migrations to set up the `scenarios` table:
```bash
npx prisma migrate dev --name init
```

### 4. Configure Supabase Authentication Providers
In your [Supabase Dashboard](https://app.supabase.com):
1. **Email/Password**: Enabled by default under *Authentication -> Providers*.
2. **Google OAuth**: Under *Authentication -> Providers -> Google*, enable the provider and paste your Client ID and Client Secret from Google Cloud Console. Set the Authorized Redirect URI to `https://<your-supabase-ref>.supabase.co/auth/v1/callback`.
3. **Site URL & Redirects**: Under *Authentication -> URL Configuration*, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` under Additional Redirect URLs.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Authentication & Data Isolation Architecture

- **Middleware Route Protection**: Unauthenticated requests to `/` redirect to `/login`. Unauthenticated requests to `/api/scenarios/*` receive HTTP `401 Unauthorized`.
- **Database User Isolation**: Scenarios created by logged-in users store their Supabase User UUID in the `userId` column in Postgres. `GET /api/scenarios` filters strictly by `where: { userId: user.id }`.

---

## 🔌 API Route Reference

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/scenarios` | Yes | List saved scenarios belonging to the logged-in user |
| `POST` | `/api/scenarios` | Yes | Create a scenario tied to the logged-in user ID |
| `GET` | `/api/scenarios/:id` | Yes | Fetch a single scenario owned by the user |
| `PUT` | `/api/scenarios/:id` | Yes | Update a scenario owned by the user |
| `DELETE` | `/api/scenarios/:id` | Yes | Delete a scenario owned by the user |

---

## 🧪 Running Unit Tests
```bash
npx vitest run
```
