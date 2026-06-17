-- ============================================================================
-- Virtus — add a second owner (admin)
-- Run AFTER 0002_roles.sql. Promotes an additional account to 'admin' so it
-- survives a migration re-run (the one-off SQL Editor update would not).
--
-- The account must already exist (Authentication → Users) before this runs;
-- new accounts default to 'employee'. Re-run / copy this block per new owner.
-- ============================================================================
update public.profiles
set role = 'admin'
where email = 'brianbrins9422@gmail.com';
