import { supabase } from "@/app/utils/supabase/client";
import { db, type PendingTriageSession } from "./localDB";

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

// ── Triage session OUTBOX (offline-durable logging) ─────────
// Ini-save muna ang session sa Dexie BAGO subukang ipadala, para hindi
// kailanman mawala kahit offline. Awtomatikong ipapadala pagbalik ng net.

let flushing = false; // in-flight guard — iwas double-send kung sabay-sabay ang triggers

export async function queueTriageSession(
  payload: Omit<PendingTriageSession, "id">,
): Promise<void> {
  try {
    await db.pendingSessions.add(payload);
  } catch (err) {
    console.error("[TALA Outbox] Failed to queue session:", err);
    return;
  }
  // Best-effort na agarang padala kung online (tahimik lang kung mabigo).
  if (navigator.onLine) void flushPendingSessions();
}

export async function flushPendingSessions(): Promise<void> {
  if (!navigator.onLine || flushing) return;
  flushing = true;
  try {
    const pending = await db.pendingSessions.toArray();
    if (pending.length === 0) return;

    for (const row of pending) {
      const { id, ...payload } = row;
      const { error } = await supabase.from("triage_sessions").insert([payload]);
      if (error) {
        // Server/permission issue — itigil muna at subukan ulit sa susunod na trigger.
        console.error("[TALA Outbox] Flush failed, will retry later:", error.message);
        break;
      }
      if (id !== undefined) await db.pendingSessions.delete(id);
    }
    console.log("[TALA Outbox] Flush complete");
  } catch (err) {
    console.error("[TALA Outbox] Flush error:", err);
  } finally {
    flushing = false;
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