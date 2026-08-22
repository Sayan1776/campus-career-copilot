-- Migration 0006: Disable Row Level Security on all tables
--
-- WHY THIS IS CORRECT AND NOT A REGRESSION:
--
-- This application uses Firebase for authentication, not Supabase Auth.
-- All Supabase access happens exclusively through server-side API routes
-- (Node.js runtime) using the service-role key (supabaseAdmin), which
-- bypasses RLS unconditionally regardless of whether it is enabled.
--
-- RLS policies written against auth.uid() are meaningless here because:
--   1. Supabase Auth is never used — no JWT is issued by Supabase.
--   2. auth.uid() returns NULL for every request, so every auth.uid()-based
--      policy would silently deny or silently allow depending on `using (true)`.
--   3. The anon-key client (lib/supabase/client.ts) was created speculatively
--      and never imported by any component or page (confirmed by grep).
--      It has been deleted in this commit.
--
-- ACTUAL SECURITY MODEL:
--   Every API route that reads or writes data calls verifySession(req) first,
--   which uses firebase-admin to validate the session cookie and extract the
--   role claim.  Unauthenticated or wrong-role requests are rejected at the
--   route level before any Supabase query is made.
--   Middleware additionally gates /student/* and /tpo/* at the Edge.
--
-- Enabling RLS with auth.uid()-based policies while using service-role for
-- every query implies a security guarantee that doesn't exist.
-- Disabled-and-documented is more honest than enabled-and-decorative.

-- Drop all existing RLS policies before disabling RLS
-- (policies can't be dropped after RLS is disabled on the table)

-- users policies (from 0002)
drop policy if exists "company_visits are publicly readable" on company_visits;

-- skill_journeys policies (from 0004)
drop policy if exists "skill_journeys are publicly readable for campus transparency" on skill_journeys;
drop policy if exists "users can manage their own skill_journeys" on skill_journeys;

-- Disable RLS on all four tables
alter table users              disable row level security;
alter table resumes            disable row level security;
alter table skill_journeys     disable row level security;
alter table company_visits     disable row level security;

-- Note: the jds table was created in 0001/0002 but the /recruiter section
-- has since been removed from the application.  The table still exists in
-- the schema for historical compatibility; RLS was enabled on it in 0002.
alter table jds                disable row level security;
