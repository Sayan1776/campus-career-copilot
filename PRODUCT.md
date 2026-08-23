# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Engineering students preparing for institutional campus recruitment drives, and Training & Placement Officers (TPO) coordinating cohort placement readiness, diagnostic analytics, and targeted skill interventions.

## Product Purpose

Campus Career Copilot is an AI-powered institutional placement intelligence and skill-readiness platform for higher education institutions. It empowers students to analyze PDF resumes against engineering branch standards, build compilable LaTeX resumes, resolve detected skill gaps through 4-step structured AI learning journeys, and benchmark readiness against campus peers. It equips Placement Cells (TPO) with real-time cohort analytics, department gap distributions, urgency-ranked student rosters, and 1-click targeted push notification broadcasts.

## Positioning

The product unifies automated resume evaluation, LaTeX resume compilation, 4-step gamified skill learning journeys, transparent campus peer progress benchmarking, TPO cohort diagnostics, and targeted push notification interventions into a single institutional placement ecosystem across 11 engineering disciplines.

## Operating Context

Students use the platform throughout their placement preparation lifecycle—uploading PDF resumes, reviewing calibrated readiness scores (0–100) and 360° competency radars, progressing through 4-stage learning roadmaps (Concept → Course → Challenge → Quiz), and reviewing peer profiles to form study circles. TPOs monitor macro batch health gauges, analyze horizontal gap distributions across branches and graduating years, inspect urgency-ranked student rosters, dispatch real-time Firebase Cloud Messaging (FCM) push alerts for technical workshops, and seed demo cohort data.

## Capabilities and Constraints

The application is a Next.js 14 web platform backed by Firebase Authentication (with custom role claims and TOTP 2FA), Supabase PostgreSQL (managed via server-side service-role access), Google Gemini 3.5 Flash Lite (`gemini-3.5-flash-lite`) for resume scoring, LaTeX generation, and 4-step skill journeys, Firebase Cloud Messaging (FCM) for web push alerts, Recharts for 360° radar and cohort bar visualizations, and Interactive Campus & Drive Mapping with Leaflet. Authenticated dashboards are role-gated for Student (`/student/*`) and TPO (`/tpo/*`) personas using zero-network Edge HMAC-SHA256 cookies. The system natively supports 11 engineering branches (`lib/departments.ts`).

## Brand Commitments

Product name is Campus Career Copilot. Voice is institutional, practical, calibrated, and career-outcome oriented. The visual identity implements the "Instrument Sheet" design system (seed `ins-84d2`) with a bespoke CC monogram instrument mark (`app/icon.svg`, `components/Sidebar.tsx`) carrying a signature instrument-red calibration tick, graph-paper workbook surfaces, and Archivo + IBM Plex Mono typography.

## Evidence on Hand

Repository content includes public landing page with live animated InstrumentPanel, about page with 3 system architecture diagrams and interactive Leaflet drive map, auth pages with invite code gating and TOTP 2FA challenge, student dashboard with 360° radar chart, resume upload with PDF analyzer and LaTeX builder, 4-stage AI skill journeys with interactive MCQ quizzes and automated grading, campus peer directory with individual profile deep-dives, TPO cohort diagnostics with horizontal gap frequency chart, FCM push broadcast modal, 18-student multi-department demo seeder, 6 Supabase SQL migrations, and 10 Node.js API route handlers. No recruiter JD posting or candidate matching features exist. No fake testimonials, pricing, or external proof assets are present and none are fabricated.

## Product Principles

1. **Make Placement Readiness Visible and Calibrated**: Quantify student readiness with transparent 0–100 scores, 360° radars, and severity-ranked skill gaps.
2. **Turn Diagnosis into Structured Action**: Every detected gap connects directly to a personalized 4-step learning roadmap (Concept → Course → Challenge → Quiz) with verified mastery.
3. **Preserve Institutional Trust**: Maintain strict role boundaries between students and placement officers; display genuine student metrics with transparent peer benchmarking.
4. **Equip Placement Officers with Rapid Interventions**: Enable 1-click cohort diagnostics, department filtering, and instant push notification broadcasts to affected students.
5. **Universal Branch Equity**: Deliver specialized role recommendations and AI prompt contexts across all 11 engineering disciplines so no department is second-class.

## Accessibility & Inclusion

The interface is built with accessible markup (`scope="col"`, `aria-modal`, focus-trapped dialogs, `aria-label` for icon controls), responsive layouts for mobile, laptop, and projector displays, strict 11px type floor for mono data labels, WCAG AA compliant contrast ratios (≥ 4.5:1 on sheet surfaces), and full `prefers-reduced-motion` support.
