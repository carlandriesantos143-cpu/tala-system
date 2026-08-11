# TALA — Implementation Summary (Pre-Launch Hardening)

*Companion to `TALA_Feature_Review.md`. This documents the work actually implemented in response to that review — what changed, why (with the safety reasoning), and how to verify. Useful as a capstone changelog / defense reference.*

---

## Overview

Starting from a feature-improvement review, six roadmap items were implemented, in safety-first order, each following a plan → explain → implement → verify workflow. Every change was type-checked (`tsc --noEmit`, clean), and the safety-critical pure logic is covered by unit tests. The database was also hardened with Row Level Security.

Headline outcome: the app moved from a **flat "answer anything, take the worst" triage** with several safety gaps to a **guided, age-aware decision tree** with durable offline logging, admin-side config validation, and locked-down data access.

---

## What was delivered

### 1. Result-engine safety hardening (CRITICAL)
**Problem:** a resident could reach a result after a single answer (`canNext` needed only one answer), and an under-answered assessment silently fell through to *Non-Urgent — Home Care* — false reassurance in a health tool.

**Fix (`TriageFlow.tsx`):**
- Completion is enforced before a result can be produced.
- `determineResult` no longer defaults to the lowest urgency when a result config is missing; it uses a cautious "consult your BHW" fallback that **keeps** the computed urgency (never downgrades).
- The gate is made visible (progress on category tabs + an inline hint).

### 2. Age-aware triage — visibility + escalation (HIGH)
**Problem:** the resident selected an Age Group, but it never affected the outcome — fever in a newborn was treated the same as in an adult.

**Fix:**
- `types.ts` — optional `ageGroupIds` on clusters/questions (visibility) and `ageEscalations` on branches (weighting), plus `schemaVersion`. All optional → **no database migration** (the config is a JSONB blob).
- Shared helpers `isVisibleForAge()` and `effectiveUrgency()` with the **safety invariant**: age escalation may only ever *raise* urgency, never lower it (`max(base, escalation)`) — a misconfiguration can't downgrade an emergency.
- Resident runtime filters questions/categories by age and applies escalation.
- Admin editor (`StepSymptomClusters.tsx`) gained an age-chip selector on categories and questions, and a per-branch escalation editor.
- Seeded examples: fever → Emergency for Newborn/Infant; Maternal Health scoped to Adolescent/Adult.

### 3. Offline session queue (HIGH)
**Problem:** triage sessions were sent fire-and-forget; if offline, they were lost — undermining the offline-first promise.

**Fix:**
- `localDB.ts` — new Dexie `pendingSessions` outbox (via a `version(2)` migration that preserves existing tables).
- `syncService.ts` — `queueTriageSession()` persists locally *first*, then tries to send; `flushPendingSessions()` sends queued rows one at a time, deletes each only on success, stops early on failure to retry, and is guarded against concurrent double-sends.
- `is_offline` and `created_at` are stamped at the moment of the assessment, so analytics stay accurate even when a row is flushed later.
- `main.tsx` flushes on load and on reconnect.

### 4. Row Level Security hardening (HIGH)
**Problem:** the public anon key is shipped in the client; RLS is the only protection. Audit found the account table wide open across admins, and drafts/inactive content publicly readable.

**Fix (`supabase_rls_policies.sql`, applied):**
- `bhw_users` → owner-scoped (`id = auth.uid()`); admins can no longer read/edit each other's profiles.
- `health_articles` → anon can read `Published` only (drafts no longer public).
- `health_alerts` / `emergency_contacts` → anon can read `Active` only.
- Confirmed correct and kept: `triage_sessions` (anon INSERT only, no anon read), `triage_config` (anon read, admin write), no anon writes on content.

### 5. Config validation + dead-end lint (MEDIUM)
**Problem:** an admin could save a broken protocol (empty categories, dangling question links, an age group with no applicable questions, or a missing Emergency result that would blank the result screen).

**Fix:**
- `validation.ts` — pure `validateTriageConfig()` returning tagged errors/warnings, including the **age dead-end lint**.
- `TriagePage.tsx` — a live "Checks" panel (clickable to jump to the offending step); errors block Save, warnings are surfaced but allowed.

### 6. True decision-tree traversal (MEDIUM — closes review finding #0)
**Problem:** the admin's `branch.target` links ("go to question X" / "go to result") were **cosmetic** — the engine ignored them and the resident saw all questions flat.

**Fix:**
- `traversal.ts` — pure `walkCluster()` that walks each category from its entry, follows each answer's target, applies age escalation at terminals, and fails safe on dangling/looping/age-hidden targets.
- Resident Step 4 is now progressive (one question at a time, category outcome banner on terminal); `determineResult` takes the highest terminal urgency across completed categories.

---

## Files touched

**New**
- `src/app/triage/traversal.ts` — decision-tree walker.
- `src/app/triage/validation.ts` — config validator.
- `src/app/triage/__tests__/ageLogic.test.ts`, `validation.test.ts`, `traversal.test.ts` — unit tests.
- `supabase_rls_policies.sql` — canonical RLS policy + audit file.
- `TALA_Feature_Review.md`, `TALA_Implementation_Summary.md` — documentation.

**Changed**
- `src/app/triage/types.ts` — age fields, `schemaVersion`, `urgencyRank`, `isVisibleForAge`, `effectiveUrgency`.
- `src/app/triage/initialData.ts` — seeded age examples + `schemaVersion`.
- `src/app/triage/steps/StepSymptomClusters.tsx` — age selectors + escalation editor.
- `src/app/pages/resident/TriageFlow.tsx` — safety gate, age-awareness, offline queue call, guided traversal.
- `src/app/pages/admin/TriagePage.tsx` — validation panel + save-blocking.
- `src/app/services/localDB.ts` — `pendingSessions` table.
- `src/app/services/syncService.ts` — queue/flush helpers.
- `src/main.tsx` — flush triggers.
- `package.json` / `tsconfig.json` — Vitest wiring; tests excluded from the app build.

---

## How to verify

```
npm install     # first time (adds vitest)
npm run typecheck   # expect: clean
npm test            # runs age-logic, validation, and traversal suites
npm run dev         # manual checks below
```

Manual smoke tests:
- **Safety gate:** answering one question keeps "Get Result" disabled with a hint; reaching a category terminal enables it.
- **Age-aware:** Fever → Yes as **Newborn** = Emergency; same as **Adult** = Urgent.
- **Traversal:** answering reveals the next question along the tree; a "result" answer ends the category immediately.
- **Offline queue (DevTools → Network → Offline):** finish a triage → row appears in IndexedDB `tala_db › pendingSessions` → go Online → it flushes to Supabase.
- **Validation:** delete all questions in a category or disable all age groups → "Checks" panel lights up and Save locks.
- **RLS:** logged out, confirm you cannot read a Draft article or the `bhw_users` table.

---

## Design principles applied

- **Fail safe, never reassure by accident.** Every fallback path (missing config, no questions for an age, broken links) keeps or raises urgency and points to a BHW — it never silently returns Non-Urgent.
- **Escalate-only age logic.** Age adjustments can only raise urgency, enforced with `max()`, so misconfiguration can't create harm.
- **Additive, migration-free data model.** New fields are optional on a JSONB blob; old saved configs keep working.
- **Pure, testable core.** Safety-critical logic (`effectiveUrgency`, `walkCluster`, `validateTriageConfig`) lives in pure modules with unit tests.
- **Guidance, not diagnosis.** The tool remains decision-support; AI auto-diagnosis was assessed and deliberately not adopted (see the review).

---

## Deferred / future work

- **"Clear answers" affordance** — minor UX; low value now that tree re-routing makes stray answers harmless.
- **Admin AI assist (optional)** — online-only protocol-authoring helper or result rewording; keep resident triage deterministic and offline (rationale in the review).
- **Accessibility pass** — larger touch targets, text labels alongside color cues, consistent Tagalog for low-literacy/elderly users.
- **Wider test coverage** — component/integration tests for the resident flow and the offline sync path.
- **If resident logins are ever added** — revisit RLS, since policies currently assume `authenticated` == admin.
