-- Campus Career Copilot: initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push` if using the CLI.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(), -- should match Firebase UID (set explicitly on insert)
  role text not null check (role in ('student', 'tpo', 'recruiter')),
  name text,
  batch_year int,
  target_role text,
  opted_in_recruiter boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  file_url text,
  uploaded_at timestamptz not null default now(),
  overall_score int check (overall_score between 0 and 100),
  skill_gaps jsonb not null default '[]',      -- [{ "skill": "System Design", "severity": "high" }]
  extracted_skills jsonb not null default '[]', -- ["Python", "React", ...]
  status text not null default 'processing' check (status in ('processing', 'complete', 'failed'))
);

create table if not exists jds (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references users(id) on delete cascade,
  title text not null,
  required_skills jsonb not null default '[]',
  posted_at timestamptz not null default now()
);

create table if not exists company_visits (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  visit_date date,
  location_lat double precision,
  location_lng double precision,
  jd_id uuid references jds(id) on delete set null
);

-- Helpful indexes for the TPO aggregate query (grouping skill_gaps across all resumes)
create index if not exists idx_resumes_user_id on resumes(user_id);
create index if not exists idx_resumes_status on resumes(status);
create index if not exists idx_jds_recruiter_id on jds(recruiter_id);

-- Row Level Security: enable, but since all writes go through the server
-- (using the service role key, which bypasses RLS), these policies only
-- matter if you ever query Supabase directly from the client with the anon key.
alter table users enable row level security;
alter table resumes enable row level security;
alter table jds enable row level security;
alter table company_visits enable row level security;

-- Public read on company_visits (used on the public About/map page)
create policy "company_visits are publicly readable"
  on company_visits for select
  using (true);
