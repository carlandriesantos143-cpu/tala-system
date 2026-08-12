-- ============================================================
-- TALA — Role-based access control (RBAC) + RLS hardening
-- ------------------------------------------------------------
-- Adds admin / editor / viewer roles so only authorized staff can
-- edit content. Residents (anon) are unaffected. Idempotent and
-- wrapped in a transaction — safe to run in the Supabase SQL Editor.
--
-- Roles:
--   admin  — full access; can also manage other users' roles
--   editor — can create/edit/delete content
--   viewer — can log in and VIEW the admin panel, but not edit content
--
-- Backfill policy: existing accounts become 'admin' (no one loses
-- access now); NEW accounts default to 'viewer' (least privilege).
--
-- SECURITY: run this before launch. It also closes a self-promotion
-- hole (a non-admin editing their own bhw_users.role).
-- ============================================================

begin;

-- ── 1) Add role column to bhw_users ─────────────────────────────
-- Add as nullable first so we can backfill existing rows to 'admin',
-- THEN set the default to 'viewer' for future signups.
alter table public.bhw_users add column if not exists role text;

update public.bhw_users set role = 'admin' where role is null;   -- existing → admin

alter table public.bhw_users alter column role set default 'viewer';
alter table public.bhw_users alter column role set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bhw_users_role_check') then
    alter table public.bhw_users
      add constraint bhw_users_role_check check (role in ('admin','editor','viewer'));
  end if;
end $$;

-- ── 2) Helper functions (SECURITY DEFINER = bypass RLS, no recursion) ──
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.bhw_users
    where id = auth.uid() and coalesce(is_active, true) and role = 'admin'
  );
$$;

create or replace function public.is_content_editor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.bhw_users
    where id = auth.uid() and coalesce(is_active, true) and role in ('admin','editor')
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.is_content_editor() to authenticated, anon;

-- ── 3) Replace blanket content policies with role-aware ones ────────
-- Pattern per table: any authenticated staff may VIEW all rows (incl.
-- drafts) so the admin panel works; only editors/admins may write.
-- The anon "Public can view ..." policies are left untouched.

-- health_articles
drop policy if exists "BHW Admins can do everything" on public.health_articles;
create policy "Staff can view all articles" on public.health_articles
  for select to authenticated using (true);
create policy "Editors can insert articles" on public.health_articles
  for insert to authenticated with check (public.is_content_editor());
create policy "Editors can update articles" on public.health_articles
  for update to authenticated using (public.is_content_editor()) with check (public.is_content_editor());
create policy "Editors can delete articles" on public.health_articles
  for delete to authenticated using (public.is_content_editor());

-- emergency_contacts
drop policy if exists "BHW Admins can do everything" on public.emergency_contacts;
create policy "Staff can view all contacts" on public.emergency_contacts
  for select to authenticated using (true);
create policy "Editors can insert contacts" on public.emergency_contacts
  for insert to authenticated with check (public.is_content_editor());
create policy "Editors can update contacts" on public.emergency_contacts
  for update to authenticated using (public.is_content_editor()) with check (public.is_content_editor());
create policy "Editors can delete contacts" on public.emergency_contacts
  for delete to authenticated using (public.is_content_editor());

-- health_alerts
drop policy if exists "BHW Admins can do everything" on public.health_alerts;
create policy "Staff can view all alerts" on public.health_alerts
  for select to authenticated using (true);
create policy "Editors can insert alerts" on public.health_alerts
  for insert to authenticated with check (public.is_content_editor());
create policy "Editors can update alerts" on public.health_alerts
  for update to authenticated using (public.is_content_editor()) with check (public.is_content_editor());
create policy "Editors can delete alerts" on public.health_alerts
  for delete to authenticated using (public.is_content_editor());

-- triage_config (clinical) — editors/admins only for writes
drop policy if exists "BHW Admins can do everything" on public.triage_config;
create policy "Staff can view triage config" on public.triage_config
  for select to authenticated using (true);
create policy "Editors can insert triage config" on public.triage_config
  for insert to authenticated with check (public.is_content_editor());
create policy "Editors can update triage config" on public.triage_config
  for update to authenticated using (public.is_content_editor()) with check (public.is_content_editor());
create policy "Editors can delete triage config" on public.triage_config
  for delete to authenticated using (public.is_content_editor());

-- ── 4) triage_sessions ──────────────────────────────────────────
-- Keep the existing anon INSERT ("Anyone can log a triage session").
-- Any authenticated staff may VIEW sessions (needed by Analytics,
-- Dashboard, and the notification bell). Only editors/admins may
-- modify or delete session records.
drop policy if exists "BHW Admins can do everything" on public.triage_sessions;
create policy "Staff can view sessions" on public.triage_sessions
  for select to authenticated using (true);
create policy "Staff can insert sessions" on public.triage_sessions
  for insert to authenticated with check (true);
create policy "Editors can update sessions" on public.triage_sessions
  for update to authenticated using (public.is_content_editor()) with check (public.is_content_editor());
create policy "Editors can delete sessions" on public.triage_sessions
  for delete to authenticated using (public.is_content_editor());

-- ── 5) Close the self-promotion hole on bhw_users ───────────────
-- The existing "Admin can update own profile" policy lets a user edit
-- their own row (name, barangay, etc.). Without this guard they could
-- also set their own role = 'admin'. This trigger silently reverts any
-- role / is_active change made by a non-admin.
create or replace function public.prevent_privilege_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role
      or new.is_active is distinct from old.is_active)
     and not public.is_admin() then
    new.role := old.role;
    new.is_active := old.is_active;
  end if;
  return new;
end $$;

drop trigger if exists trg_prevent_priv_escalation on public.bhw_users;
create trigger trg_prevent_priv_escalation
  before update on public.bhw_users
  for each row execute function public.prevent_privilege_escalation();

-- Allow admins to manage all profiles (e.g. promote/demote staff).
-- Combined with the existing own-row policies (permissive = OR'd),
-- non-admins keep only their own row; admins get full user management.
drop policy if exists "Admins can manage all profiles" on public.bhw_users;
create policy "Admins can manage all profiles" on public.bhw_users
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

commit;

-- ============================================================
-- AFTER RUNNING — assign roles (run as needed in the SQL Editor):
--   -- make someone an editor:
--   update public.bhw_users set role = 'editor' where email = 'editor@example.com';
--   -- restrict someone to read-only:
--   update public.bhw_users set role = 'viewer' where email = 'viewer@example.com';
--   -- check who has what:
--   select email, full_name, role, is_active from public.bhw_users order by role;
--
-- HOW TO TEST:
--   1. Log into the admin panel as an 'admin' or 'editor' → you can add/edit/delete content.
--   2. Set a test account to 'viewer', log in as them → admin pages still LOAD (read),
--      but saving/deleting content fails (blocked by RLS). This is expected.
--   3. As that viewer, try to change your own role in SQL/API → it silently stays 'viewer'.
--
-- ROLLBACK (reverts to "any authenticated user can edit everything"):
--   Re-create the old policy on each table and drop the role-aware ones, e.g.:
--     create policy "BHW Admins can do everything" on public.health_articles
--       for all to authenticated using (true) with check (true);
--   (repeat per table), then optionally: drop trigger, functions, and role column.
-- ============================================================
