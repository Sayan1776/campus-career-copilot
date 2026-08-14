-- Fix: users.id must be TEXT, not UUID, because it stores the Firebase UID
-- (a 28-char alphanumeric string), not a Postgres-generated UUID.
-- Tables are freshly created and empty, so we drop and recreate rather
-- than doing a risky in-place ALTER with FK juggling.

drop table if exists resumes cascade;
drop table if exists jds cascade;
drop table if exists company_visits cascade;
drop table if exists users cascade;

create table users (
  id text primary key,                          -- Firebase UID, set explicitly on insert
  role text not null check (role in ('student', 'tpo', 'recruiter')),
  name text,
  batch_year int,
  target_role text,
  opted_in_recruiter boolean not null default false,
  created_at timestamptz not null default now()
);

create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  file_url text,
  uploaded_at timestamptz not null default now(),
  overall_score int check (overall_score between 0 and 100),
  skill_gaps jsonb not null default '[]',
  extracted_skills jsonb not null default '[]',
  status text not null default 'processing' check (status in ('processing', 'complete', 'failed'))
);

create table jds (
  id uuid primary key default gen_random_uuid(),
  recruiter_id text not null references users(id) on delete cascade,
  title text not null,
  required_skills jsonb not null default '[]',
  posted_at timestamptz not null default now()
);

create table company_visits (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  visit_date date,
  location_lat double precision,
  location_lng double precision,
  jd_id uuid references jds(id) on delete set null
);

create index idx_resumes_user_id on resumes(user_id);
create index idx_resumes_status on resumes(status);
create index idx_jds_recruiter_id on jds(recruiter_id);

alter table users enable row level security;
alter table resumes enable row level security;
alter table jds enable row level security;
alter table company_visits enable row level security;

create policy "company_visits are publicly readable"
  on company_visits for select
  using (true);
