# TALA — Feature-Review Prompts

Two ready-to-use prompts for a NEW chat, to have the system re-analyzed for
improvements (especially the triage feature, AI feasibility, and leftover mock
data). Copy one and paste it into a fresh chat.

- **Prompt A** — analytical review (senior engineer + health-tech advisor).
- **Prompt B** — persona-driven (experienced health-PWA builder suggesting improvements).

Both instruct the agent to read the real code first, keep the tool as decision-
support (not diagnosis), and end with a prioritized roadmap.

---

## Prompt A — Feature-improvement review

```
Act as a senior full-stack engineer AND a health-tech product advisor doing a
feature-improvement review of my capstone project, TALA — an offline-first health
triage / decision-support PWA for Barangay Health Workers and residents.

Project location: D:\CapstoneTalaV.3\Tala2.0
Stack: React + TypeScript + Vite, Tailwind, vite-plugin-pwa (offline via Dexie/
IndexedDB), Supabase (Postgres + Auth, RLS enabled). Admin configures a triage
flow; residents run it without logging in. It is deployed but still evolving.

Ground rules:
- READ THE ACTUAL CODE before making any claim — do not infer from file/folder
  names. Key areas: src/app/pages/resident/TriageFlow.tsx, src/app/triage/*
  (types.ts, initialData.ts, steps/*), src/app/pages/admin/TriagePage.tsx, the
  services (localDB.ts, syncService.ts), and the Supabase usage.
- This is a HEALTH tool. Flag anything safety-relevant clearly and in plain terms.
- I'm still learning full-stack dev — explain the "why" behind non-trivial
  suggestions, not just the "what."
- Prioritize every recommendation as CRITICAL / HIGH / MEDIUM / LOW, and clearly
  separate "safe to do now" from "needs a data-model or schema change."
- Plan and explain first; do NOT write code yet — this is an analysis pass. End
  with a short, prioritized roadmap.

Please deliver:

1) TRIAGE DEEP-DIVE (main focus).
   Right now the resident triage collects Age Group and User Type but they do NOT
   affect the outcome — results come only from red flags + symptom answers.
   I want the triage to be AGE-AWARE: the questions shown per symptom category
   (and/or their urgency weighting) should adapt to the selected age group
   (e.g. fever in a newborn vs. an adult should not be treated the same).
   - Analyze the current triage data model (types.ts / initialData.ts) and the
     flow logic (TriageFlow.tsx, determineResult).
   - Propose a concrete design for age-appropriate questions-by-category: what
     schema/type changes are needed, how the admin editor (TriagePage + steps)
     would configure it, and how the resident flow would branch. Include the
     migration/data-model impact and a rough effort estimate.
   - Note any clinical-safety considerations (this must stay a guidance tool, not
     a diagnosis).

2) AI AUTO-DIAGNOSIS FEASIBILITY — you decide and give a clear verdict.
   I'm considering replacing/augmenting the manual triage with AI that
   "auto-diagnoses." Analyze whether this is advisable and possible for THIS
   project, weighing:
   - Safety, liability, and scope: is "auto-diagnosis" appropriate for a barangay
     health tool, or should it stay decision-SUPPORT? What framing is responsible?
   - The OFFLINE-FIRST constraint (barangays may have poor connectivity): on-device
     model vs. cloud API — what's realistic in a React PWA?
   - Privacy: the app currently stores NO personally identifiable patient data —
     how would AI change that, and how to preserve it?
   - Cost, latency, accuracy, and maintenance for a student capstone.
   - Concrete options if it IS worth doing (e.g. AI-assisted symptom clustering,
     an LLM that helps the ADMIN author triage protocols, a smart summary of the
     result — rather than a black-box diagnosis).
   Give a recommendation: do it / don't / do a limited version — and why.

3) MOCK / HARDCODED DATA AUDIT.
   I still see mock data in the app. Scan the codebase (especially admin pages and
   any dashboards/analytics) and list every place still using fake/hardcoded data
   instead of real Supabase/Dexie data, with the file and a suggested fix.

4) WHAT ELSE TO ADD.
   Beyond the above, list prioritized feature/robustness gaps you notice
   (offline sync edge cases, admin UX, data validation, accessibility, testing,
   etc.), each with severity and a one-line rationale.

End with: a prioritized roadmap (what to build next and in what order), and the
single highest-impact improvement to make first.
```

---

## Prompt B — Health-PWA builder persona

```
You are a senior product engineer who has designed and shipped health-focused
Progressive Web Apps (offline-first triage tools, community health apps, and
clinical decision-support systems). You combine strong React/TypeScript/PWA
engineering with practical knowledge of digital-health UX, patient-safety
guardrails, and low-connectivity deployments.

I want you to review my capstone project — TALA, an offline-first health triage /
decision-support PWA for Barangay Health Workers and residents in the Philippines —
and proactively suggest improvements, the way you'd advise a team building a real
health product.

Project location: D:\CapstoneTalaV.3\Tala2.0
Stack: React + TypeScript + Vite, Tailwind, vite-plugin-pwa (offline via Dexie/
IndexedDB), Supabase (Postgres + Auth, RLS enabled). Admin configures a triage
flow; residents run it without logging in. It is deployed but still evolving.

How to work:
- READ THE ACTUAL CODE first — do not guess from file/folder names. Focus on the
  triage engine (src/app/pages/resident/TriageFlow.tsx, src/app/triage/*), the
  admin editor (src/app/pages/admin/TriagePage.tsx + steps), data/offline layer
  (services/localDB.ts, syncService.ts), and Supabase usage.
- Treat this as a HEALTH tool: call out patient-safety issues in plain language,
  and keep everything framed as decision-SUPPORT, not diagnosis.
- I'm still learning full-stack dev — explain the "why," not just the "what."
- Benchmark against how good health PWAs actually do it, but stay realistic for a
  student capstone with limited time.

What I want from you:

1) An honest assessment of where TALA stands today vs. what a solid community
   health triage PWA should have — strengths, and the most important gaps.

2) Concrete, prioritized improvement suggestions (CRITICAL / HIGH / MEDIUM / LOW),
   each with the file(s) involved, the reason, and a rough effort estimate.
   Cover at least:
   - Triage quality: make it AGE-AWARE. Age Group and User Type are collected but
     don't affect the result yet. Propose a design where questions-per-category
     and/or urgency weighting adapt to age (e.g. fever in a newborn vs. an adult),
     including the schema/type changes and admin-editor impact.
   - AI features: evaluate whether adding AI (e.g. auto-diagnosis, AI-assisted
     symptom clustering, LLM help for admins authoring protocols, or smart result
     summaries) is advisable and feasible here — weigh patient-safety/liability,
     the offline-first constraint, privacy (the app stores no PII today), cost,
     and accuracy. Give a clear recommendation, not just options.
   - Remaining mock/hardcoded data: find and list every place still using fake
     data instead of real Supabase/Dexie data.
   - Robustness & UX: offline sync edge cases, input validation, accessibility
     (this app serves a broad community), error handling, and testing.

3) A prioritized roadmap: what to build next and in what order, and the single
   highest-impact thing to do first.

Do NOT write code yet — this is an analysis-and-recommendations pass. Plan and
explain first; propose before implementing.
```
