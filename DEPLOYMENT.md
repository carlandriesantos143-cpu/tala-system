# TALA — Deployment Guide (Vercel)

TALA is a client-side Vite + React PWA backed by Supabase — there's no custom server to run, so it deploys as a static site. Vercel is the recommended host (great Vite/PWA support, free hobby tier, GitHub integration).

The repo already includes `vercel.json` (build command, output dir, and SPA routing rewrite), so most of this is just clicking through the Vercel dashboard.

---

## Prerequisites
- Code pushed to a GitHub repo (commit everything, including `vercel.json`, `.env.example`, and the `supabase/migrations/` folder).
- Your Supabase project up and running with the migrations applied (RLS policies, `triage_config` anon read, `triage_sessions` anon insert).
- **Confirm you ran** the `triage_config` anon-read and `triage_sessions` analytics SQL — without them, residents can't load triage or log analytics on the live site.

---

## Step 1 — Push to GitHub
From the project folder:
```bash
git add .
git commit -m "Pre-launch fixes + deploy config"
git push
```

## Step 2 — Import into Vercel
1. Go to **vercel.com** → sign in with GitHub.
2. **Add New… → Project** → import your TALA repo.
3. Vercel auto-detects **Vite**. Leave the defaults — `vercel.json` already sets:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. First build takes ~1–2 minutes.

> The build runs `tsc --noEmit && vite build`, so a TypeScript error will (intentionally) block a broken deploy. It currently passes clean.

## Step 3 — Environment variables (optional)
The app has a built-in fallback to your current Supabase values, so it will work without any env vars. To point the deploy at a specific Supabase project (recommended for a clean prod setup):

In Vercel → your project → **Settings → Environment Variables**, add:
| Name | Value |
|---|---|
| `VITE_SUPABASE_PROJECT_ID` | your project ref |
| `VITE_SUPABASE_ANON_KEY` | your publishable (anon) key |

Then **Redeploy** so they take effect. (These are safe to expose — the anon key is public by design; RLS is what protects your data.)

## Step 4 — Point Supabase at the live domain
After the first deploy you'll get a URL like `https://tala-xxxx.vercel.app`.
1. Supabase dashboard → **Authentication → URL Configuration**.
2. Set **Site URL** to your Vercel URL (used by auth emails).
3. If you later add a custom domain, update this too.

(Because login is email/password and new sign-ups are disabled, redirect-URL setup is minimal. Create BHW accounts via Supabase → Authentication → Users → Add user.)

---

## Post-deploy smoke test
Open the live URL and verify:
- **Landing → Get Started** loads the resident app.
- **Triage** runs end-to-end and shows a result (not "Hindi Pa Available"). If it shows unavailable, the `triage_config` anon-read policy isn't applied.
- **Emergency / triage result** shows **911**.
- **Admin login** works; Dashboard + Analytics show real data (or "Wala pang triage data" if new).
- **Install prompt** appears on mobile (PWA), and the app still opens **offline** after first load.
- Do a couple of test triages, then confirm counts appear in Analytics (proves `triage_sessions` anon insert works).

## Auto-deploys
Once connected, every `git push` to your main branch triggers a new Vercel build automatically. Preview deploys are created for other branches.

---

## Notes / gotchas
- **SPA routing:** handled by the rewrite in `vercel.json` (all non-file routes serve `index.html`), so refreshing `/admin` or `/login` won't 404.
- **PWA service worker:** ships automatically from the build; no extra config. Users may need one reload to pick up a new version after each deploy (that's normal for `autoUpdate`).
- **Offline analytics:** assessments completed fully offline aren't logged until/unless the device is online at completion — a known limitation, noted in the app.
