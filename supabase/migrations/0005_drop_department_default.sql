-- Migration 0005: Drop the 'Computer Science' default on users.department
--
-- Previously, new users who didn't supply a department were silently
-- categorised as Computer Science. With lib/departments.ts as the single
-- source of truth and the signup / set-role flows now capturing the real
-- department at registration time, the column default is no longer needed
-- and should be removed so missing data stays NULL (explicitly unset)
-- rather than masquerading as a CS student.
--
-- Existing rows are intentionally left untouched.

ALTER TABLE users ALTER COLUMN department DROP DEFAULT;