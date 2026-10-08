# Virtual Study Lobby — Setup Guide

## Step 1 — Supabase (free, ~5 minutes)

1. Go to **supabase.com** → create a free account → click **New Project**
2. Give it a name (e.g. `study-lobby`) and set a database password → click Create
3. Wait ~2 minutes for it to provision
4. Go to **SQL Editor** (left sidebar) → click **New query**
5. Paste this SQL and click **Run**:

```sql
-- Study plans feed
create table study_plans (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Focus sessions for leaderboard
create table focus_sessions (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  minutes integer not null default 0,
  date date not null default current_date,
  unique(nickname, date)
);

-- Allow anyone to read and write (no auth needed)
alter table study_plans enable row level security;
alter table focus_sessions enable row level security;

create policy "Anyone can read study_plans" on study_plans for select using (true);
create policy "Anyone can insert study_plans" on study_plans for insert with check (true);

create policy "Anyone can read focus_sessions" on focus_sessions for select using (true);
create policy "Anyone can insert focus_sessions" on focus_sessions for insert with check (true);
create policy "Anyone can update focus_sessions" on focus_sessions for update using (true);
```

6. Go to **Project Settings → API** (left sidebar)
7. Copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2 — GitHub

1. Create a new repository on github.com (e.g. `virtual-study-lobby`)
2. In your terminal, inside this folder:

```bash
git init
git add .
git commit -m "Initial commit — Virtual Study Lobby"
git remote add origin https://github.com/YOUR_USERNAME/virtual-study-lobby.git
git push -u origin main
```

---

## Step 3 — Vercel

1. Go to **vercel.com** → New Project → Import your GitHub repo
2. Vercel auto-detects Next.js — just click **Deploy**
3. After first deploy, go to **Project Settings → Environment Variables**
4. Add these two variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Go to **Deployments → Redeploy** (so the env vars take effect)

Your app is live! Share the Vercel URL with your students.

---

## Local development

```bash
cp .env.local.example .env.local
# Fill in your Supabase values in .env.local
npm install
npm run dev
# Open http://localhost:3000
```

---

## What each page does

| URL | Purpose |
|-----|---------|
| `/` | Entry screen — type your name |
| `/lobby` | Main lobby — rooms, status, timer, plans, leaderboard |
| `/how-to` | How-to guide (share this link with new students) |
