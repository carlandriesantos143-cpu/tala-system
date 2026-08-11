# TALA — Feature-Improvement Review

*Analysis pass only. No code was changed. Every claim below is based on reading the actual source, not file names.*

Files read: `src/app/triage/{types.ts, initialData.ts}`, `steps/{StepSymptomClusters, StepPatientContext, ...}.tsx`, `pages/resident/{TriageFlow, HomeScreen, MobileArticles, MobileContacts}.tsx`, `pages/admin/{TriagePage, AnalyticsPage, DashboardPage, AlertsPage, ContactsPage, ArticlesPage, SettingsPage}.tsx`, `services/{localDB, syncService}.ts`, `utils/supabase/client.ts`, `main.tsx`.

---

## 0. The one finding you need to read first (CRITICAL)

Before we get to age-awareness: **the branching decision-tree that the admin builds is not actually executed at runtime.**

In `StepSymptomClusters.tsx` the admin carefully configures, for each question, a `yesBranch.target` and `noBranch.target` — "go to Result X" or "go to Question Y". This is the whole point of the "Decision Flow" editor.

But look at how the resident flow actually computes the result — `TriageFlow.tsx`, `determineResult` (lines 122–147):

```ts
for (const cluster of data?.symptomClusters ?? []) {
  for (const q of cluster.questions ?? []) {
    const answer = answers[q.id];
    if (answer === undefined) continue;
    const branch = answer ? q.yesBranch : q.noBranch;
    if (urgencyRank[branch.urgency] > urgencyRank[highestUrgency]) {
      highestUrgency = branch.urgency;      // <-- just takes the max
    }
  }
}
```

It loops over **every answered question in every cluster** and returns the single highest urgency. It never reads `branch.target`. And in Step 4 the UI renders *all* questions in a cluster at once (`.map` over `cluster.questions`), so residents don't get walked down the tree either — they see a flat list.

**Why this matters (plain terms):** the `target` links ("if Yes → go to Q102", "if No → Result: Non-Urgent") are cosmetic. The admin thinks they authored a guided protocol; the engine runs a much blunter "answer anything, take the worst answer" rule. This is directly relevant to your age-aware goal because *whatever you build for age-awareness has to plug into this same `determineResult` function* — so you should decide now whether to (a) keep the flat "max urgency" model and just make it age-aware, or (b) also fix the traversal so the tree is real. My recommendation is in §1 and the roadmap: **do age-awareness on the flat model first (fast, safe), then fix traversal as a separate phase.**

Two smaller correctness notes in the same function:
- **Step 4 lets you finish after a single answer** — `canNext()` returns `true` when `Object.keys(answers).length > 0` (line 198). A resident can answer one question and get a result.
- **A resident who meaningfully answers nothing falls through to "Non-Urgent — Home Care"** (line 144–145 fallback to the last `resultConfig`). A falsely-reassuring result is a safety concern; see §4.

---

## 1. TRIAGE DEEP-DIVE — making triage age-aware

### 1a. What the data model looks like today

From `types.ts`:

```ts
SymptomCluster { id, name, description, questions: ClusterQuestion[] }
ClusterQuestion { id, question, yesBranch: BranchOutcome, noBranch: BranchOutcome }
BranchOutcome { label, urgency, action, target }
AgeGroup { id, label, rangeDesc, enabled }
```

`AgeGroup` and `UserType` exist, are selected by the resident in Step 2, are shown as informational chips on the result screen, and are logged to `triage_sessions` for analytics — **but they are never read by `determineResult`.** Confirmed: `selectedAge` appears only in label lookups and the analytics insert. So today, "fever" produces the same urgency for a newborn and a 40-year-old. That is exactly the gap you described.

The whole config is stored as a single JSON blob in the Supabase `triage_config.data` column (JSONB) and mirrored into Dexie `triageConfig`. **This is good news for migration:** there is no rigid SQL schema for the triage content, so adding fields to the TypeScript types requires *no database migration* — old saved blobs just won't have the new (optional) fields.

### 1b. Proposed design — additive, backward-compatible, safety-biased

I recommend a **two-mechanism** approach, both expressed as *optional* fields so every existing saved config keeps working untouched.

**Mechanism A — age visibility (which questions/categories show for which age).**
Add an optional age filter to clusters and questions:

```ts
interface SymptomCluster {
  // ...existing
  ageGroupIds?: number[];   // NEW — if set, cluster only shows for these ages; undefined/empty = all ages
}
interface ClusterQuestion {
  // ...existing
  ageGroupIds?: number[];   // NEW — same semantics at the question level
}
```

Example use: hide "Maternal Health" for Newborn/Young Child/Child; show a "Newborn danger signs" question only for Newborn + Infant.

**Mechanism B — age-based urgency escalation (weighting).**
Add an optional per-branch override that can *raise* urgency for vulnerable ages:

```ts
interface BranchOutcome {
  // ...existing
  ageEscalations?: { ageGroupIds: number[]; urgency: Urgency }[];  // NEW
}
```

Example: the fever question's `yesBranch` is normally `Urgent`, but with `ageEscalations: [{ ageGroupIds: [Newborn, Infant], urgency: "Emergency" }]`, a fever in a newborn becomes Emergency. This is the "fever in a newborn ≠ fever in an adult" behaviour you asked for.

**Optional Mechanism C — age-specific question wording** (nice-to-have, lower priority): an optional `questionByAge?: Record<number, string>` so "Fast breathing for age group?" can show the actual per-age threshold ("Infant: more than 50 breaths/min?"). Currently Q201 asks about "fast breathing for age group" but gives the BHW no age-specific number, which pushes clinical judgment onto the worker.

### 1c. The one safety invariant that makes this safe to ship

**Age adjustments may only ever raise urgency, never lower it.** In `determineResult`, when you resolve a branch's urgency, compute:

```
effectiveUrgency = max(baseUrgency, anyMatchingAgeEscalation)   // by urgencyRank
```

Never *replace* with a lower value. This guarantees that even a misconfigured escalation cannot downgrade an emergency to "home care." For a health tool this is the difference between a safe feature and a dangerous one — call it out in your defense.

### 1d. Runtime changes required (`TriageFlow.tsx`)

1. **Filter clusters** shown in Step 4 by `selectedAge` (cluster.ageGroupIds undefined → show to all).
2. **Filter questions** inside each cluster the same way.
3. In `determineResult`, apply the `max(base, escalation)` rule using `selectedAge`.
4. (Recommended alongside) require at least one *relevant* cluster to be answered before "Get Result" is enabled, and reconsider the silent fall-through to Non-Urgent (§4).

Because Step 2 already forces an age selection before Step 3 (`canNext` case 2 requires `selectedAge !== null`), `selectedAge` is guaranteed to exist by the time questions render. Good — no null-handling headaches.

### 1e. Admin editor changes (`StepSymptomClusters.tsx`, `StepPatientContext.tsx`)

- In the **cluster modal** and the **question modal** (`QuestionFormEditor`), add an "Applies to age groups" multi-select (chips of the enabled `AgeGroup`s). Empty = all ages. You already pass `ageGroups` into the wizard via `TriagePage`, so it's available — you'd thread it into `StepSymptomClusters` as a new prop.
- In **`BranchEditor`**, add a small "Age escalation" sub-section: pick age group(s) + the raised urgency. Keep it collapsed by default so the common case stays simple.
- Add a **config lint**: warn the admin if, for any enabled age group, a cluster ends up with zero applicable questions (a dead-end for that age). This is cheap and prevents a resident from reaching an empty assessment.

### 1f. Migration / data-model impact

- **No SQL migration.** All new fields are optional additions to a JSONB blob.
- **Add versioning now.** `TriageFlowData` has no `schemaVersion`. Add one (`schemaVersion: 2`) so future changes are detectable and you can write a tiny normaliser on load. Cheap insurance.
- **`initialData.ts`** can seed 1–2 example escalations (fever → Emergency for Newborn/Infant) so the feature is discoverable, but keep thresholds admin-configurable and attributed to DOH/IMCI rather than hardcoded by you.
- **ID generation caveat (pre-existing):** new clusters/questions/age-groups use `Date.now()` as `id` (`StepSymptomClusters` line 90/166, `StepPatientContext` line 30/40). Two items created in the same millisecond collide. Low probability, but since age filters reference age-group IDs, an ID collision would mis-target a filter. Consider `crypto.randomUUID()` or a counter. MEDIUM.

### 1g. Effort estimate (student-realistic)

| Phase | Scope | Effort | Risk |
|---|---|---|---|
| **A** | Age visibility (types + admin multiselect + resident filter) | ~1–2 days | Low |
| **B** | Age escalation weighting (types + branch editor + `max()` in determineResult) | ~2–3 days | Low–Med |
| **C** | Fix true tree traversal (honor `branch.target`, walk one question at a time) | ~3–5 days | Med–High |
| **C+** | Config lint + schemaVersion + test matrix | ~1 day | Low |

Do A+B first — they deliver the feature you asked for and are safe. C is the "make the decision-tree real" fix from §0 and is worth doing but is a bigger, separately-tested change.

### 1h. Clinical-safety framing (keep it guidance, not diagnosis)

The app already frames itself well (disclaimer step, "This is NOT a medical diagnosis" repeated on the result screen). Preserve that. For the age work specifically: escalate-only (§1c); attribute thresholds to DOH/IMCI protocols; keep the BHW/clinician in the loop as the decision-maker; and never let the tool present an age-adjusted result as more authoritative than "seek professional care."

**Safe to do now (no schema change):** the `max()` escalation logic and the visibility filters are all TypeScript/JSONB — no DB change. **Needs coordination, not schema:** admin-editor UX for the new fields, and a re-save of the config to populate them.

---

## 2. AI AUTO-DIAGNOSIS — feasibility & verdict

**Verdict: Do NOT build black-box "auto-diagnosis." DO build a limited, clearly-scoped AI assist — and keep the resident triage 100% deterministic and offline.**

### Why not auto-diagnosis
- **Safety & liability / regulatory scope.** An app that outputs a *diagnosis* is functionally "Software as a Medical Device." That invites PhilFDA / medical-device-style scrutiny and real liability if a wrong call causes harm. Decision-*support* run by a trained BHW keeps a human accountable in the loop. For a barangay tool — and for a capstone you have to defend — support is the responsible framing.
- **Offline-first constraint (your core value prop).** On-device LLM inference in a React PWA is not realistic on the phones a barangay will use: usable models are hundreds of MB to several GB, browser inference (WebLLM/WASM) is slow and memory-hungry, and it would bloat your service-worker cache. A cloud API needs connectivity — which defeats offline-first exactly when a poorly-connected barangay needs the tool most, and adds latency.
- **Privacy regression.** Today TALA stores **zero** PII (you say so on the Home screen, in Settings/About, and the Analytics banner — and the code backs it: `logTriageSession` sends only age-group label, user-type label, red-flag count, cluster names, urgency). Sending free-text symptoms to a cloud LLM would start transmitting health information off-device — a direct contradiction of your privacy promise and Data Privacy Act considerations.
- **Accuracy & maintenance.** LLMs hallucinate; for triage that's unacceptable. A deterministic, admin-authored protocol is auditable and defensible. A student capstone also can't sustain per-call costs, prompt maintenance, and — crucially — clinician QA of model outputs.

### What IS worth doing (pick 1–2, all optional, all online-only, all non-blocking)
1. **LLM-assisted protocol authoring for the ADMIN (best fit).** In `TriagePage`, an online-only "Suggest questions for this category" or "Draft an escalation for newborns" helper. The AI never touches a patient; it helps the BHW author the deterministic tree, which is then reviewed and saved. No offline dependency, no patient PII, high value.
2. **Plain-language summary of the deterministic result.** After `determineResult`, optionally rephrase the already-computed `resultConfig` into simpler Tagalog/English for the resident — clearly labelled, online-only, with a graceful offline fallback to the existing static text. The *decision* stays deterministic; AI only rewords it.
3. **Symptom-cluster analytics assist (admin).** Over the anonymous `triage_sessions` aggregates, an AI summary of trends ("Respiratory assessments up this week"). Zero PII, pure analytics.

Frame all three as "AI assists the health worker," never "AI decides for the patient."

---

## 3. MOCK / HARDCODED DATA AUDIT

Good news first: **the pages you'd most worry about are already wired to real data.** I checked each for its data source.

| Area | File | Data source | Status |
|---|---|---|---|
| Admin Dashboard | `DashboardPage.tsx` | Supabase (`health_articles`, `emergency_contacts`, `health_alerts`, `triage_sessions`) | ✅ Real |
| Analytics | `AnalyticsPage.tsx` | Supabase `triage_sessions`, aggregated client-side | ✅ Real |
| Alerts | `AlertsPage.tsx` | Supabase `health_alerts` (full CRUD) | ✅ Real |
| Articles | `ArticlesPage.tsx` | Supabase `health_articles` (full CRUD) | ✅ Real |
| Contacts | `ContactsPage.tsx` | Supabase `emergency_contacts` (full CRUD) | ✅ Real |
| Resident Home | `HomeScreen.tsx` | Dexie (`alerts`, `articles`) | ✅ Real |
| Resident Articles/Contacts | `MobileArticles.tsx`, `MobileContacts.tsx` | Dexie | ✅ Real |

So there is **no fake dashboard data** left — that's already been cleaned up. What remains is **hardcoded defaults / fallbacks**, which are more subtle. Ranked:

1. **`SettingsPage.tsx` — hardcoded facility defaults (MEDIUM).** Initial state and the load-fallback bake in `"Barangay Malinta" / "Valenzuela City" / "Metro Manila" / "Malinta Health Center" / "NCR"` (lines 98–99, 147) and `"BHW Admin"` (line 84). If a `bhw_users` row is missing those columns, the admin silently sees *another barangay's* details as if they were their own — misleading in a multi-barangay deployment. **Fix:** default to empty strings / "Not set" and prompt the admin to complete their profile; don't ship a real-looking placeholder.

2. **`MobileContacts.tsx` line 49 — `location: "Valenzuela City"` fallback (LOW).** A contact with no location is labelled with a specific city. **Fix:** fall back to `""` or the barangay from settings, not a hardcoded city.

3. **`initialData.ts` — seed protocol used as the editor's starting content and TriagePage fallback (LOW–MEDIUM, by design but worth a decision).** `TriagePage` initialises `useState(initialData)` and only overwrites it if Supabase has a saved row. That's a reasonable seed, but note the resident flow does **not** fall back to `initialData` — if `triage_config` is empty in Supabase/Dexie, residents get the "Hindi Pa Available" screen (`TriageFlow` lines 254–275). So make sure the admin actually saves once. Decide explicitly whether `initialData` is "sample content to be replaced" or "the real default protocol" — and if the latter, get it clinician-reviewed.

4. **`MobileArticles.tsx` lines 82–90 — category color map is hardcoded to 4 categories (LOW).** Only Prevention / First Aid / Nutrition / Chronic get themed colors; any admin-created category falls back to gray. Not "fake data," but the UI silently won't reflect new categories. **Fix:** derive a color from a hash, or let the admin pick a category color.

5. **`HomeScreen.tsx` line 66 — hardcoded default health tip (LOW, acceptable).** Sensible offline fallback when no articles are cached. Fine to leave.

Everything else flagged by the text search (`placeholder=` attributes, `emptyForm` constants, `const types = [...]` filter options in Contacts/Alerts) is legitimate UI code, not mock data.

---

## 4. WHAT ELSE TO ADD — prioritized gaps

**CRITICAL**
- **Decision-tree not executed at runtime** (§0). The admin's branching is cosmetic; results come from flat "max urgency." Rationale: the product's core promise (authored protocols) isn't what runs.
- **Single-answer completion + silent Non-Urgent fallback** (`canNext` line 198; fallback line 144). Rationale: a resident can reach a falsely-reassuring "home care" result after one or zero meaningful answers — a real safety risk for a triage tool.

**HIGH**
- **Offline triage sessions are lost, not queued.** `logTriageSession` does a fire-and-forget Supabase insert (lines 160–176); if offline it's dropped. The Analytics footer even admits undercounting. Rationale: offline-first is your value prop, yet the one write path residents generate isn't offline-durable. **Fix:** queue sessions in Dexie and flush on reconnect (you already listen for `online` in `main.tsx`).
- **Verify Supabase RLS policies (can't see them from the client).** The anon key is public and correctly used, but safety depends entirely on RLS: (a) `triage_sessions` must allow anonymous INSERT but not arbitrary READ of anything sensitive; (b) `triage_config`, `health_articles`, `health_alerts`, `emergency_contacts` need anon READ but admin-only WRITE; (c) `bhw_users` must be locked to the owning user. Rationale: with RLS misconfigured, the public anon key is a data-exposure or spam-insert vector. Please confirm each table's policies before wider rollout.
- **No validation that a saved config is runnable.** Admin can save a config with dangling `target.questionId`, empty clusters, or (soon) age groups with no questions. Rationale: silent dead-ends in a health flow.

**MEDIUM**
- **`Date.now()` IDs can collide** (§1f). Rationale: mis-targeted branches/age-filters.
- **Settings hardcoded facility defaults** (§3 #1). Rationale: cross-barangay data confusion.
- **Accessibility for low-literacy / older users.** Small font sizes (many `0.65–0.72rem`), color-only urgency cues, English-heavy resident copy mixed with Tagalog. Rationale: your users include elderly residents and BHWs; add larger touch targets, text labels alongside color, and consistent Tagalog. (You have `design:accessibility-review` available as a skill.)
- **No automated tests.** `determineResult`, age escalation, and the sync/self-repair logic are exactly the kind of pure functions that deserve unit tests before you touch them. Rationale: you're about to change the safety-critical core; tests let you refactor without fear.

**LOW**
- Article/category color map hardcoding (§3 #4).
- `logTriageSession` `useCallback` deps omit nothing critical, but consider abandoned-session logging (currently only completed sessions insert, so "Abandoned" in Analytics is inferred, not measured).
- Consider a "last updated" timestamp shown to residents so a BHW knows how fresh the cached protocol is.

---

## 5. Prioritized roadmap (what to build, in order)

1. **Safety hardening of the current engine (CRITICAL, ~1–2 days).** Require completing at least one relevant cluster before a result; remove/rework the silent Non-Urgent fall-through so an under-answered assessment prompts "please continue" or "consult a BHW" rather than "home care." This protects users *today*, independent of everything else.
2. **Age-aware triage — Phase A + B (HIGH, ~3–5 days).** Add optional `ageGroupIds` (visibility) and `ageEscalations` (escalate-only weighting) to the types; wire the admin multiselect + branch escalation UI; apply `max(base, escalation)` and age filters in `determineResult`. Add `schemaVersion`. This is the feature you asked for, and it's safe and migration-free.
3. **Offline session queue (HIGH, ~1 day).** Persist triage sessions to Dexie and flush on reconnect. Makes analytics honest and offline-first real.
4. **Confirm/repair RLS policies (HIGH, hours).** Audit each table's anon vs admin permissions.
5. **Config validation + dead-end lint (MEDIUM, ~1 day).** Catch dangling targets, empty clusters, and age groups with no questions at save time.
6. **Fix true decision-tree traversal — Phase C (MEDIUM, ~3–5 days).** Make `branch.target` actually drive the flow (one question at a time), so the admin's authored tree is what runs.
7. **Accessibility + Tagalog consistency + unit tests (MEDIUM, ongoing).**
8. **Optional AI assist for the ADMIN only (LOW/nice-to-have).** Protocol-authoring helper and/or result-rewording, online-only, no patient PII.

### The single highest-impact thing to do first

**Fix the safety behaviour of the result engine (roadmap #1) — specifically the "one answer → result" completion rule and the silent fall-through to *Non-Urgent — Home Care*.** It's small, needs no schema change, and it closes the most dangerous gap for a health tool: a resident being told they're fine after barely engaging with the assessment. Do this *before* the age-aware work, because the age-aware logic plugs into the very same `determineResult` path — hardening it first means you build the new feature on a safe foundation.
