# Burnly — Startup Financial Model & Runway Simulator

Burnly is a financial simulation platform that lets startup founders model investment allocation, project runway/burn/break-even points, compare scenarios side-by-side, and receive explainable, rule-based advisory guidance.

---

## 🛠️ Database & Auth Setup (Supabase Hosted)

Burnly uses **Supabase Hosted PostgreSQL** with Prisma Connection Pooling for runtime queries and direct connections for migrations.

### 1. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

In your [Supabase Project Dashboard](https://app.supabase.com) under *Project Settings -> Database -> Connection string*, copy both connection strings into your `.env`:

```env
# 1. Transaction / Session Pooled Connection (Used by Prisma Client at runtime, Port 6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# 2. Direct Connection (Used exclusively for Prisma schema migrations, Port 5432)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase Auth Configuration (Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 2. Run Database Migrations Against Hosted Supabase
Deploy the Prisma schema to your hosted Supabase database:
```bash
npx prisma migrate deploy
```
Or run `npx prisma db push` to push schema changes directly.

---

## 🐳 Local Offline Development (Optional Docker Setup)

For developers working offline without internet access:
1. Spin up the local PostgreSQL container:
   ```bash
   docker compose up -d
   ```
2. Update `.env` to point `DATABASE_URL` and `DIRECT_URL` to local Postgres:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/burnly?schema=public"
   DIRECT_URL="postgresql://postgres:postgres@localhost:5432/burnly?schema=public"
   ```
3. Run local migration:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## 🔒 Authentication Configuration

1. In Supabase Dashboard under *Authentication -> URL Configuration*, set Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` under Additional Redirect URLs.
2. Enable **Email/Password** and **Google OAuth** under *Authentication -> Providers*.

---

## 🚀 Running the App
```bash
# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Unit Tests
```bash
npx vitest run
```
