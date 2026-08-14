-- Adds a column to store each user's FCM device token so the server can
-- send them a real push notification instead of just identifying them.
-- Nullable: a user who hasn't granted notification permission simply has
-- no token, and gets silently skipped when we send.

alter table users add column if not exists fcm_token text;
