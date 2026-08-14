# Campus Career Copilot — Hour 0-4 Foundation

This scaffold covers everything in the "Hour 0-4: Foundation" block: project
init, route groups, Firebase Auth with role-based custom claims, Supabase
schema, and the middleware that gates routes by role.

## What's in here

- `app/(public)/login`, `app/(public)/signup` — auth pages
- `app/(student)/dashboard`, `app/(tpo)/dashboard`, `app/(recruiter)/candidates` — role-gated placeholder pages
- `middleware.ts` — checks the session cookie's role claim before allowing access to `/student/*`, `/tpo/*`, `/recruiter/*`
- `app/api/auth/session` — exchanges a Firebase ID token for an httpOnly session cookie
- `app/api/auth/set-role` — assigns a role via invite code right after signup
- `app/api/auth/verify-session` — used internally by middleware to check the cookie
- `lib/firebase/client.ts` / `lib/firebase/admin.ts` — Firebase SDK init (browser / server)
- `lib/supabase/client.ts` / `lib/supabase/server.ts` — Supabase SDK init (browser / server)
- `supabase/migrations/0001_init.sql` — full schema:# Campus Career Copilot — Hour 0-4 Foundation

This scaffold covers everything in the "Hour 0-4: Foundation" block: project
init, route groups, Firebase Auth with role-based custom claims, Supabase
schema, and the middleware that gates routes by role.

## What's in here

- `app/(public)/login`, `app/(public)/signup` — auth pages
- `app/(student)/dashboard`, `app/(tpo)/dashboard`, `app/(recruiter)/candidates` — role-gated placeholder pages
- `middleware.ts` — checks the session cookie's role claim before allowing access to `/student/*`, `/tpo/*`, `/recruiter/*`
- `app/api/auth/session` — exchanges a Firebase ID token for an httpOnly session cookie
- `app/api/auth/set-role` — assigns a role via invite code right after signup
- `app/api/auth/verify-session` — used internally by middleware to check the cookie
- `lib/firebase/client.ts` / `lib/firebase/admin.ts` — Firebase SDK init (browser / server)
- `lib/supabase/client.ts` / `lib/supabase/server.ts` — Supabase SDK init (browser / server)
- `supabase/migrations/0001_init.sql` — full schema: users, resumes, jds, company_visits

## Setup steps (do these in order)

### 1. Install dependencies
```bash
npm install
```

### 2. Create the Firebase project
1. Go to console.firebase.google.com → Create project.
2. Build → Authentication → Get started → enable **Email/Password** sign-in method.
3. Project settings → General → scroll to "Your apps" → add a Web app → copy the config into `.env.local` (the `NEXT_PUBLIC_FIREBASE_*` vars).
4. Project settings → Service accounts → Generate new private key → downloads a JSON file.
   Paste its full contents as a single-line string into `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`.

### 3. Create the Supabase project
1. Go to supabase.com → New project.
2. Project Settings → API → copy the Project URL and `anon public` key into `.env.local`.
3. Copy the `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (keep this secret, server-only).
4. Open the SQL editor → paste the contents of `supabase/migrations/0001_init.sql` → run it.

### 4. Set your env file
```bash
cp .env.local.example .env.local
# then fill in all the values from steps 2 and 3
```

### 5. Run it
```bash
npm run dev
```
Visit `http://localhost:3000/signup`, sign up with invite code `STUDENT2026`
(or whatever you set in `.env.local`), and you should land on
`/student/dashboard`. Try `TPOADMIN2026` and `RECRUIT2026` in separate
incognito sessions to confirm the role gating actually works — that's the
whole point of this block.

## How the role flow works (so you can explain it live if asked)

1. User signs up with email/password + an invite code.
2. `/api/auth/set-role` verifies the invite code server-side and calls
   `adminAuth.setCustomUserClaims(uid, { role })` — this attaches the role
   to the Firebase user permanently, but it does **not** show up on tokens
   already issued.
3. The client force-refreshes its ID token (`getIdToken(true)`) so the new
   claim is actually present.
4. That fresh token is exchanged for an httpOnly session cookie via
   `/api/auth/session` — this is what `middleware.ts` reads on every
   request to a protected route.
5. `middleware.ts` can't run `firebase-admin` directly (Edge runtime has no
   Node APIs), so it calls `/api/auth/verify-session` internally, which
   *can* run Admin SDK code, and gets the role back.

## Known gaps you'll close in later blocks

- Dashboards for TPO/recruiter are still placeholders (Hour 16-22 / 22-28). Student dashboard is now real.
- No FCM notification wiring yet (part of Hour 10-16).
- No about/map page yet (Hour 22-28).
- Seed data script not yet written (final stretch).

---

# Hour 4-10: Resume Analysis Pipeline

## What's new in this block

- `lib/groq/client.ts` — Groq call with a strict JSON-schema prompt, wrapped in shape validation so a malformed model response fails loudly instead of corrupting your data.
- `app/api/resume/analyze/route.ts` — the actual pipeline: verifies the session, accepts a PDF upload, extracts text, calls Groq, writes the result to Supabase. Runs entirely inside your own API route — **not through n8n**, so there's no extra network hop to break during a live demo.
- `app/student/upload/page.tsx` — upload form (target role + PDF).
- `app/student/dashboard/page.tsx` — now a real server component that reads the latest resume from Supabase and renders the score, extracted skills, and skill gaps.

## Schema fix required before this works

Firebase UIDs are 28-character strings, not UUIDs, but the original
migration typed `users.id` as `uuid`. Run `supabase/migrations/0002_fix_user_id_type.sql`
in the Supabase SQL editor now — it drops and recreates the four tables
with `users.id` as `text`. Safe to run since your tables are still empty.

After running it, your existing Firebase-created accounts still work for
login (Firebase doesn't know or care about this), but they won't have a
Supabase `users` row yet since that write didn't happen before this fix.
Simplest fix: just sign up fresh test accounts after this migration, or
manually insert rows for your existing UIDs via the Supabase table editor.

## New setup steps

1. Get a Groq API key: console.groq.com → API Keys → Create API Key → paste into `.env.local` as `GROQ_API_KEY=gsk_...`.
2. Run migration `0002_fix_user_id_type.sql` (see above).
3. `npm install` (pulls in `groq-sdk` and `pdf-parse`).
4. `npm run dev`.
5. Sign up (or log back in) as a student, go to `/student/upload`, pick a target role, upload any PDF resume, submit.
6. You should land back on `/student/dashboard` showing a score, extracted skills, and a skill-gap list.

## How the pipeline works (for your pitch/demo narration)

1. Student uploads a PDF from `/student/upload`.
2. API route verifies the session cookie server-side (never trusts a client-supplied user ID).
3. Confirms the caller's role is `student` — TPO/recruiter accounts can't hit this endpoint.
4. Inserts a `resumes` row with `status: 'processing'` immediately, so the UI has something to show even before Groq responds.
5. Extracts raw text from the PDF using `pdf-parse`.
6. Sends the text + target role to Groq with `response_format: { type: 'json_object' }`, forcing structured output instead of prose you'd have to regex out.
7. Validates the response shape before trusting it.
8. Updates the same `resumes` row with the score, skills, and gaps, sets `status: 'complete'`.
9. If anything fails partway (bad PDF, Groq error, malformed JSON), the row is marked `status: 'failed'` instead of hanging forever on "processing" — this is what stops a live demo from looking broken if a single call flakes.

## What's still missing (next blocks)

- No FCM push notification fired on analysis-complete yet (that's the Hour 10-16 notifications piece).
- No skill-gap radar chart yet — currently a plain list, chart comes with Recharts in the next pass.
- No resume file storage — `file_url` currently just stores the filename, not an actual uploaded file. Fine for the demo; real storage would use Supabase Storage if you want it later.

---

# Hour 16-22: TPO Cohort Dashboard

## What's new in this block

- `lib/auth/verify-session.ts` — shared session-verification helper, used by every TPO-only route so the role check can't drift between routes.
- `app/api/seed/route.ts` — TPO-gated endpoint that inserts 18 realistic student accounts + completed resumes for demo purposes. Safe to click repeatedly: it deletes its own previously-seeded rows first (all prefixed `seed_student_...`), so it never touches a real signup and never piles up duplicates.
- `app/api/tpo/notify/route.ts` — TPO-gated endpoint that finds every student with a given skill gap and returns the list. **Does not send a real push notification yet** — that requires FCM device token registration, which isn't built. This endpoint is honest about that: it tells you exactly who *would* be notified and logs the message server-side, rather than claiming delivery that isn't happening.
- `app/tpo/dashboard/page.tsx` — now a real server component. Fetches all `complete` resumes and aggregates skill-gap counts **in JavaScript**, not SQL — with ~20 rows this is simpler and safer than writing a `jsonb_array_elements` query under time pressure, and produces the exact same result.
- `app/tpo/dashboard/CohortAnalyticsClient.tsx` — the actual dashboard UI: 4 summary metric cards, a horizontal Recharts bar chart of skill gaps colored by severity, a severity filter, a "Notify affected students" modal per skill gap, a "Seed demo data" button, and a student roster table sorted weakest-first (most actionable for a TPO).

## New setup steps

1. Copy in the 5 files above.
2. `npm install` (no new dependencies this block — `recharts` was already added in Hour 4-10's `package.json`).
3. `npm run dev`.
4. Log in as your TPO account (invite code `TPOADMIN2026`), go to `/tpo/dashboard`.
5. Click **Seed demo data** — this populates 18 fake students with varied scores and skill gaps.
6. Confirm the summary cards, bar chart, and roster table populate.
7. Click **Notify affected students** on any skill gap, confirm the modal shows the right count and student names.

## How the seeding works (so you can explain it if asked)

The seed endpoint builds a target distribution first (e.g. "System Design" should hit ~14 of 18 students, "Microservices Pattern" only ~4), then randomly assigns each gap to that many students, and randomly assigns each student a plausible score (58-94) and a subset of common skills. This means every time you click "Seed demo data" you get a slightly different but always realistic-looking cohort — useful for rehearsing the demo multiple times without staring at identical numbers.

## What's still missing after this block

- Recruiter JD posting + candidate matching (Hour 22-28).
- About page + campus map (Hour 22-28).

---

# Hour 10-16 (completed retroactively): Radar Chart + Real FCM Push

## What's new in this block

- `app/student/dashboard/SkillRadarChart.tsx` — Recharts radar chart combining extracted skills (scored high) and skill gaps (scored by severity) into one 360-degree competency shape, replacing the plain skill-gap list on the student dashboard.
- `lib/firebase/messaging.ts` — client-side helper that requests notification permission, gets an FCM device token, and registers it with the backend. Called once, silently, right after login/signup.
- `public/firebase-messaging-sw.js` — the service worker FCM requires to deliver push notifications when the tab isn't focused. **You must manually paste your real Firebase config values into this file** — it can't read `.env.local` since it's a static file served as-is, not processed by Next.js.
- `app/api/notifications/register-token/route.ts` — saves a user's FCM token to their Supabase `users` row.
- `lib/firebase/send-push.ts` — shared helper that sends a push to a list of tokens, silently skipping anyone without one (never crashes the caller over one bad token).
- `supabase/migrations/0003_add_fcm_token.sql` — adds the `fcm_token` column to `users`.
- **Resume analyze route now fires a real push** when a resume finishes scoring, if the student has a token.
- **TPO notify route now sends a real push** instead of just simulating it. The response distinguishes `notifiedCount` (students identified with that gap) from `actuallySent` (how many actually had a token and got a real push) — seeded demo students will almost always show 0 actually sent, since they're fake and never register a real device. That's expected, not a bug.

## New setup steps (this block needs one manual Firebase console step)

1. Run migration `0003_add_fcm_token.sql` in the Supabase SQL editor.
2. Firebase console → gear icon → **Project settings** → **Cloud Messaging** tab → scroll to **Web Push certificates** → click **Generate key pair**. Copy the key.
3. Paste it into `.env.local` as `NEXT_PUBLIC_FIREBASE_VAPID_KEY=...`.
4. Open `public/firebase-messaging-sw.js` and replace the three `REPLACE_WITH_YOUR_*` placeholders with the same values you already have in `.env.local` (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`). This file can't read env vars, so these have to be hardcoded here directly — that's fine, they're already public/client-safe values.
5. `npm run dev`, log out and back in (so the login flow re-runs and calls `registerForNotifications()`), and accept the browser's notification permission prompt when it appears.
6. Upload a resume as a student — you should get a real browser push when scoring completes.
7. As TPO, hit "Notify affected students" on a gap that includes your real (non-seeded) account — check `actuallySent` is now 1, not 0.

## Known limitation

Push notifications only work over HTTPS or `localhost` — this is a browser security requirement, not a bug in the code. `localhost:3000` satisfies this for local dev; if you deploy to Vercel it'll work automatically since Vercel serves HTTPS by default.

## Seeding demo accounts (do this early, not at Hour 20)

Rather than relying on live signup during the demo, create your TPO and
recruiter demo accounts now via `/signup` using the invite codes, so
they're stable and ready. Do the same for a handful of student accounts
once resume upload is working in the next block.
 users, resumes, jds, company_visits

## Setup steps (do these in order)

### 1. Install dependencies
```bash
npm install
```

### 2. Create the Firebase project
1. Go to console.firebase.google.com → Create project.
2. Build → Authentication → Get started → enable **Email/Password** sign-in method.
3. Project settings → General → scroll to "Your apps" → add a Web app → copy the config into `.env.local` (the `NEXT_PUBLIC_FIREBASE_*` vars).
4. Project settings → Service accounts → Generate new private key → downloads a JSON file.
   Paste its full contents as a single-line string into `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`.

### 3. Create the Supabase project
1. Go to supabase.com → New project.
2. Project Settings → API → copy the Project URL and `anon public` key into `.env.local`.
3. Copy the `service_role` key into `SUPABASE_SERVICE_ROLE_KEY` (keep this secret, server-only).
4. Open the SQL editor → paste the contents of `supabase/migrations/0001_init.sql` → run it.

### 4. Set your env file
```bash
cp .env.local.example .env.local
# then fill in all the values from steps 2 and 3
```

### 5. Run it
```bash
npm run dev
```
Visit `http://localhost:3000/signup`, sign up with invite code `STUDENT2026`
(or whatever you set in `.env.local`), and you should land on
`/student/dashboard`. Try `TPOADMIN2026` and `RECRUIT2026` in separate
incognito sessions to confirm the role gating actually works — that's the
whole point of this block.

## How the role flow works (so you can explain it live if asked)

1. User signs up with email/password + an invite code.
2. `/api/auth/set-role` verifies the invite code server-side and calls
   `adminAuth.setCustomUserClaims(uid, { role })` — this attaches the role
   to the Firebase user permanently, but it does **not** show up on tokens
   already issued.
3. The client force-refreshes its ID token (`getIdToken(true)`) so the new
   claim is actually present.
4. That fresh token is exchanged for an httpOnly session cookie via
   `/api/auth/session` — this is what `middleware.ts` reads on every
   request to a protected route.
5. `middleware.ts` can't run `firebase-admin` directly (Edge runtime has no
   Node APIs), so it calls `/api/auth/verify-session` internally, which
   *can* run Admin SDK code, and gets the role back.

## Known gaps you'll close in later blocks

- No resume upload/scoring yet (Hour 4-10).
- Dashboards are placeholders (Hour 10-16 / 16-22).
- No FCM notification wiring yet (part of Hour 10-16).
- No about/map page yet (Hour 22-28).
- Seed data script not yet written (final stretch).

## Seeding demo accounts (do this early, not at Hour 20)

Rather than relying on live signup during the demo, create your TPO and
recruiter demo accounts now via `/signup` using the invite codes, so
they're stable and ready. Do the same for a handful of student accounts
once resume upload is working in the next block.
