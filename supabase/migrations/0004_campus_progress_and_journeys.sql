-- Migration 0004: Campus Progress and Gamified Skill Journeys
-- Adds department & social fields to users and creates the skill_journeys table

-- 1. Extend users table
alter table users add column if not exists department text default 'Computer Science';
alter table users add column if not exists github_url text;
alter table users add column if not exists linkedin_url text;

-- 2. Create skill_journeys table
create table if not exists skill_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  skill text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  steps jsonb not null default '[]',
  completed_steps int not null default 0,
  total_steps int not null default 3,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create indexes for high performance
create index if not exists idx_skill_journeys_user_id on skill_journeys(user_id);
create index if not exists idx_skill_journeys_status on skill_journeys(status);

-- 4. Enable Row Level Security
alter table skill_journeys enable row level security;

-- 5. Idempotent RLS Policies
drop policy if exists "skill_journeys are publicly readable for campus transparency" on skill_journeys;
create policy "skill_journeys are publicly readable for campus transparency"
  on skill_journeys for select
  using (true);

drop policy if exists "users can manage their own skill_journeys" on skill_journeys;
create policy "users can manage their own skill_journeys"
  on skill_journeys for all
  using (true);
