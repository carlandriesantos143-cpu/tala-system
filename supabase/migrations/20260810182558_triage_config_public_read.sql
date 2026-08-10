-- ============================================================================
-- Migration: allow anonymous (resident) read access to triage_config
-- Date: 2026-08-10
-- ============================================================================
--
-- WHY THIS EXISTS
-- ---------------
-- The resident PWA runs WITHOUT logging in (anonymous / anon role). On startup,
-- syncService.fetchAndStore() reads triage_config with the anon key and caches
-- it into IndexedDB so the triage flow works offline.
--
-- Before this migration, triage_config only had an {authenticated} ALL policy
-- and NO anon SELECT policy. Under RLS, that means anonymous residents got zero
-- rows back (silently — not an error), so the triage config never reached their
-- device and TriageFlow.tsx always showed the "Hindi Pa Available" fallback.
--
-- The other public content tables (health_articles, health_alerts,
-- emergency_contacts) already have an equivalent "Public can view" anon SELECT
-- policy — this brings triage_config in line with them.
--
-- SAFETY: triage_config holds non-sensitive guidance content that is MEANT to be
-- shown to residents. It is read-only for anon here (SELECT only); anonymous
-- users still cannot insert/update/delete.
-- ============================================================================

create policy "Public can view triage config"
on public.triage_config
for select
to anon
using (true);


-- ============================================================================
-- OPTIONAL HARDENING (commented out — review before enabling)
-- ============================================================================
-- Right now bhw_users has a single {authenticated} ALL policy with USING (true),
-- which lets ANY authenticated BHW read and modify EVERY other BHW's row
-- (names, emails, etc.). Within a small trusted team this is tolerable, but the
-- cleaner design is: each user can only see and edit their OWN row.
--
-- The current app code (SettingsPage.tsx) only ever reads/writes the logged-in
-- user's own row via `.eq('id', userId)`, so enabling the policies below should
-- NOT break existing functionality. Test after applying.
--
-- To enable: uncomment the block below and run it.
--
-- -- Remove the broad "do everything on every row" policy for bhw_users:
-- drop policy if exists "BHW Admins can do everything" on public.bhw_users;
--
-- -- Each user may read only their own profile row:
-- create policy "Users can view own profile"
-- on public.bhw_users
-- for select
-- to authenticated
-- using (auth.uid() = id);
--
-- -- Each user may update only their own profile row:
-- create policy "Users can update own profile"
-- on public.bhw_users
-- for update
-- to authenticated
-- using (auth.uid() = id)
-- with check (auth.uid() = id);
-- ============================================================================
