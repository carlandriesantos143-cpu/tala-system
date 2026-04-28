import { supabase } from "@/app/utils/supabase/client";
import { db } from "./localDB";

// ── Pull Supabase → write to IndexedDB ──────────────────────
export async function fetchAndStore(): Promise<void> {
  try {
    const [articles, alerts, contacts, triage] = await Promise.all([
      supabase.from("health_articles").select("*").eq("status", "Published"),
      supabase.from("health_alerts").select("*").eq("status", "Active"),
      supabase.from("emergency_contacts").select("*").eq("status", "Active"),
      supabase.from("triage_config").select("*").order("updated_at", { ascending: false }).limit(1),
    ]);

    if (articles.data?.length)  await db.articles.bulkPut(articles.data);
    if (alerts.data?.length)    await db.alerts.bulkPut(alerts.data);
    if (contacts.data?.length)  await db.contacts.bulkPut(contacts.data);
    if (triage.data?.length)    await db.triageConfig.bulkPut(triage.data);

    console.log("[TALA Sync] fetchAndStore complete");
  } catch (err) {
    console.error("[TALA Sync] fetchAndStore failed:", err);
  }
}

// ── Self-Repair: if IndexedDB empty + online → re-sync ──────
export async function selfRepair(): Promise<void> {
  if (!navigator.onLine) return;

  const [articleCount, contactCount, triageCount] = await Promise.all([
    db.articles.count(),
    db.contacts.count(),
    db.triageConfig.count(),
  ]);

  const isEmpty = articleCount === 0 || contactCount === 0 || triageCount === 0;

  if (isEmpty) {
    console.warn("[TALA Self-Repair] Empty local DB detected — re-syncing...");
    await fetchAndStore();
  } else {
    console.log("[TALA Self-Repair] Local DB OK");
  }
}