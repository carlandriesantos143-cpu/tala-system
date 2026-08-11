-- ============================================================================
-- TALA — Row Level Security (RLS) — CANONICAL policy file
-- ----------------------------------------------------------------------------
-- This is the single source of truth for TALA's RLS. It reconciles your
-- database to a secure baseline and is IDEMPOTENT (drops known policy names,
-- then recreates the correct ones) so you can re-run it safely.
--
-- WHY RLS MATTERS HERE (plain terms):
--   The app ships a PUBLIC "anon" key inside the browser JS
--   (src/app/utils/supabase/info.tsx). Anyone can extract it and call the DB
--   directly. RLS is the ONLY thing protecting your data behind that key.
--
-- ASSUMPTION (from the code): residents use triage WITHOUT logging in; the only
-- accounts are BHW admins. So the Postgres role "authenticated" == "admin".
-- If you ever add resident logins, revisit these policies.
--
-- WHAT THIS FILE CHANGES vs. the policies found in your project on audit:
--   [FIXED  🔴] bhw_users: was "{authenticated} ALL using(true)" → any admin
--               could read/edit/delete EVERY other admin's row. Now owner-scoped
--               (each admin sees/edits only their own row, id = auth.uid()).
--   [FIXED  🟡] health_articles: anon SELECT was using(true) → DRAFTS were
--               public. Now anon can read ONLY status = 'Published'.
--   [FIXED  🟢] health_alerts / emergency_contacts: anon SELECT was using(true)
--               → non-active rows were public. Now anon reads ACTIVE only.
--   [KEPT   ✅] triage_config (anon read, admin write),
--               triage_sessions (anon INSERT only, no anon read),
--               and admin full-access on all tables — these were already correct.
--
-- Adjust the literal status values below if your rows use different casing.
-- ============================================================================


-- ============================================================================
-- PART 1 — AUDIT (run first; keep the output for before/after comparison)
-- ============================================================================
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
  and relname in ('triage_config','triage_sessions','health_articles',
                  'health_alerts','emergency_contacts','bhw_users')
order by relname;

select tablename, policyname, roles, cmd,
       qual as using_expression, with_check as with_check_expression
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;


-- ============================================================================
-- PART 2 — RECONCILE TO SECURE BASELINE
-- ============================================================================

-- Make sure RLS is ON everywhere (already true in your project; harmless to re-run).
alter table public.triage_config      enable row level security;
alter table public.triage_sessions    enable row level security;
alter table public.health_articles    enable row level security;
alter table public.health_alerts      enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.bhw_users          enable row level security;


-- ---------------------------------------------------------------------------
-- triage_config : residents (anon) READ; admins WRITE.  (unchanged behaviour)
-- ---------------------------------------------------------------------------
drop policy if exists "BHW Admins can do everything"   on public.triage_config;
drop policy if exists "Public can view triage config"  on public.triage_config;

create policy "BHW Admins can do everything"
  on public.triage_config for all
  to authenticated using (true) with check (true);

create policy "Public can view triage config"
  on public.triage_config for select
  to anon using (true);


-- ---------------------------------------------------------------------------
-- triage_sessions : anon INSERT only; admins READ (+all). No anon read. (unchanged)
-- ---------------------------------------------------------------------------
drop policy if exists "BHW Admins can do everything"     on public.triage_sessions;
drop policy if exists "Anyone can log a triage session"  on public.triage_sessions;

create policy "BHW Admins can do everything"
  on public.triage_sessions for all
  to authenticated using (true) with check (true);

create policy "Anyone can log a triage session"
  on public.triage_sessions for insert
  to anon with check (true);
-- SPAM NOTE: anon INSERT is required for offline-first logging. Low harm
-- (anonymous aggregates). Add rate limiting / an Edge Function if abused.


-- ---------------------------------------------------------------------------
-- health_articles : anon reads PUBLISHED only; admins read-all + write.  [FIXED 🟡]
-- ---------------------------------------------------------------------------
drop policy if exists "BHW Admins can do everything"        on public.health_articles;
drop policy if exists "Public can view articles"            on public.health_articles;
drop policy if exists "Public can view published articles"  on public.health_articles;

create policy "BHW Admins can do everything"
  on public.health_articles for all
  to authenticated using (true) with check (true);

create policy "Public can view published articles"
  on public.health_articles for select
  to anon using (status = 'Published');


-- ---------------------------------------------------------------------------
-- health_alerts : anon reads ACTIVE only; admins read-all + write.  [FIXED 🟢]
-- ---------------------------------------------------------------------------
drop policy if exists "BHW Admins can do everything"    on public.health_alerts;
drop policy if exists "Public can view alerts"          on public.health_alerts;
drop policy if exists "Public can view active alerts"   on public.health_alerts;

create policy "BHW Admins can do everything"
  on public.health_alerts for all
  to authenticated using (true) with check (true);

create policy "Public can view active alerts"
  on public.health_alerts for select
  to anon using (status = 'Active');


-- ---------------------------------------------------------------------------
-- emergency_contacts : anon reads ACTIVE only; admins read-all + write.  [FIXED 🟢]
-- ---------------------------------------------------------------------------
drop policy if exists "BHW Admins can do everything"      on public.emergency_contacts;
drop policy if exists "Public can view contacts"          on public.emergency_contacts;
drop policy if exists "Public can view active contacts"   on public.emergency_contacts;

create policy "BHW Admins can do everything"
  on public.emergency_contacts for all
  to authenticated using (true) with check (true);

create policy "Public can view active contacts"
  on public.emergency_contacts for select
  to anon using (status = 'Active');


-- ---------------------------------------------------------------------------
-- bhw_users : each admin may read/update ONLY their own row.  [FIXED 🔴]
--   Removes "BHW Admins can do everything" (using=true), which let any admin
--   read/modify every other admin's profile. SettingsPage only touches the
--   caller's own row, so nothing in the app breaks.
-- ---------------------------------------------------------------------------
drop policy if exists "BHW Admins can do everything"  on public.bhw_users;
drop policy if exists "Admin can view own profile"    on public.bhw_users;
drop policy if exists "Admin can update own profile"  on public.bhw_users;

create policy "Admin can view own profile"
  on public.bhw_users for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Admin can update own profile"
  on public.bhw_users for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Only needed if the APP inserts the profile row (vs. a signup trigger).
-- SettingsPage only UPDATEs, so this stays commented out.
-- create policy "Admin can insert own profile"
--   on public.bhw_users for insert
--   to authenticated
--   with check (id = (select auth.uid()));


-- ============================================================================
-- PART 3 — CONFIRM (re-run to see the new state)
-- ============================================================================
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
  and relname in ('triage_config','triage_sessions','health_articles',
                  'health_alerts','emergency_contacts','bhw_users')
order by relname;

select tablename, policyname, roles, cmd,
       qual as using_expression, with_check as with_check_expression
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;


-- ============================================================================
-- PART 4 — MANUAL VERIFICATION CHECKLIST
-- ----------------------------------------------------------------------------
-- As ANON (public key, logged out):
--   [ ] CAN read a Published article / Active alert / Active contact
--   [ ] CANNOT read a Draft article or non-Active alert/contact
--   [ ] CANNOT insert/update/delete any article/alert/contact
--   [ ] CAN read triage_config ; CANNOT write it
--   [ ] CAN insert a triage_session ; CANNOT read triage_sessions
--   [ ] CANNOT read bhw_users
--
-- As AUTHENTICATED admin:
--   [ ] CAN read/create/edit/delete all articles/alerts/contacts
--   [ ] CAN read triage_sessions (Analytics/Dashboard) and save triage_config
--   [ ] CAN read/update ONLY their own bhw_users row (NOT other admins')
--
-- Quick anon probe (replace <PROJECT> and <ANON_KEY>) — expect [] (denied):
--   curl "https://<PROJECT>.supabase.co/rest/v1/bhw_users?select=*" \
--     -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>"
-- ============================================================================
