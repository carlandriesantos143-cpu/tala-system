-- ============================================================================
-- Migration: triage_sessions — anonymous analytics logging
-- Date: 2026-08-10
-- ============================================================================
--
-- LAYUNIN
-- -------
-- Bigyang-buhay ang Analytics page gamit ang TOTOONG data. Bawat tapos na triage
-- (resident side) ay maglo-log ng isang ANONYMOUS na aggregate row dito.
--
-- PRIVACY: walang PII. Wala tayong itinatabi na pangalan, eksaktong edad, o
-- anumang makakakilala sa pasyente — age GROUP lang (hal. "Adult"), user type,
-- outcome, bilang ng red flags, at kung anong symptom category ang may "Yes".
-- Tugma ito sa privacy notice ng app ("no personally identifiable patient data").
-- ============================================================================

-- 1) Idagdag ang kulang na aggregate columns (idempotent — safe i-run ulit).
--    Ginagamit natin ang existing na `urgency_result` at `is_offline`.
alter table public.triage_sessions
  add column if not exists age_group       text,
  add column if not exists user_type        text,
  add column if not exists red_flag_count   integer default 0,
  add column if not exists flagged_clusters text[],
  add column if not exists completed        boolean default true;

-- 2) Data integrity: valid na urgency values lang ang tatanggapin (anti-garbage).
--    Ligtas kung walang laman pa ang table.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'triage_sessions_urgency_chk'
  ) then
    alter table public.triage_sessions
      add constraint triage_sessions_urgency_chk
      check (
        urgency_result is null
        or urgency_result in ('Emergency', 'Urgent', 'Semi-Urgent', 'Non-Urgent')
      );
  end if;
end $$;

-- 3) RLS: hayaan ang anonymous residents na mag-INSERT lang ng session log nila.
--    WALANG anon SELECT — hindi nila mababasa ang records ng iba. Ang admin
--    (authenticated) ang makakabasa para sa Analytics (saklaw na ng dating
--    "BHW Admins can do everything" na policy).
--
--    Security note: dahil bukas ang anon INSERT, technically may posibilidad ng
--    spam rows mula sa sinumang may anon key. Mababa ang panganib para sa barangay
--    tool, at ang CHECK constraint sa itaas ang nagbabawas ng garbage data.
drop policy if exists "Anyone can log a triage session" on public.triage_sessions;
create policy "Anyone can log a triage session"
on public.triage_sessions
for insert
to anon
with check (true);
