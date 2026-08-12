import type { Table } from "dexie";
import { supabase } from "@/app/utils/supabase/client";
import { db, type PendingTriageSession } from "./localDB";

// Ang key sa localStorage kung kailan huling matagumpay na nakasync (ISO string).
export const LAST_SYNC_KEY = "tala_last_sync";
// Event na ipapaputok tuwing matagumpay ang isang sync pass, para makapag-refresh
// ang anumang UI (hal. ang resident na "last updated" indicator).
export const SYNCED_EVENT = "tala:synced";

type QueryResult<T> = { data: T[] | null; error: { message: string } | null };

// I-reconcile ang isang Dexie table sa sariwang server data.
// MAHALAGA (offline-first): kung nabigo ang fetch (offline / server error),
// HINDI natin ginagalaw ang lokal na cache — mananatiling buo ang naka-save na data.
// Kapag matagumpay, pinapalitan natin ang buong laman ng table (clear + bulkPut)
// sa loob ng ISANG transaction, para:
//   1) tuluyang matanggal ang mga na-unpublish / na-delete na rows (di kaya ng bulkPut lang), at
//   2) hindi kumislap na "empty" ang listahan — sabay lang nakikita ng useLiveQuery ang huling estado.
async function reconcileTable<T>(
  table: Table<T, string>,
  result: QueryResult<T>,
): Promise<boolean> {
  if (result.error) {
    console.warn(
      `[TALA Sync] Skipped '${table.name}' reconcile (fetch error):`,
      result.error.message,
    );
    return false;
  }
  const rows = result.data ?? [];
  await db.transaction("rw", table, async () => {
    await table.clear();
    if (rows.length) await table.bulkPut(rows);
  });
  return true;
}

// ── Pull Supabase → write to IndexedDB ──────────────────────
// Nagbabalik ng `true` kung MAY kahit isang table na aktwal na nakaabot sa server
// (matagumpay na sync), at `false` kung lahat nabigo (hal. offline / network error).
// Ginagamit ng caller (hal. Settings → Sync Now) para tumpak ang success/failed na UI.
export async function fetchAndStore(): Promise<boolean> {
  try {
    const [articles, alerts, contacts, triage] = await Promise.all([
      supabase.from("health_articles").select("*").eq("status", "Published"),
      supabase.from("health_alerts").select("*").eq("status", "Active"),
      supabase.from("emergency_contacts").select("*").eq("status", "Active"),
      supabase.from("triage_config").select("*").order("updated_at", { ascending: false }).limit(1),
    ]);

    const okArticles = await reconcileTable(db.articles, articles as QueryResult<any>);
    const okAlerts   = await reconcileTable(db.alerts,   alerts   as QueryResult<any>);
    const okContacts = await reconcileTable(db.contacts, contacts as QueryResult<any>);
    const okTriage   = await reconcileTable(db.triageConfig, triage as QueryResult<any>);

    // Itala ang oras kung MAY kahit isang table na aktwal na nakaabot sa server.
    // Kung lahat nabigo (offline), huwag mag-stamp — panatilihing tapat ang "last updated".
    const reachedServer = okArticles || okAlerts || okContacts || okTriage;
    if (reachedServer) {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      window.dispatchEvent(new Event(SYNCED_EVENT));
    }

    console.log("[TALA Sync] fetchAndStore complete; reachedServer =", reachedServer);
    return reachedServer;
  } catch (err) {
    console.error("[TALA Sync] fetchAndStore failed:", err);
    return false;
  }
}

// ── Throttled auto-sync trigger ─────────────────────────────
// Ginagamit ng focus / visibilitychange / reconnect. Nagsi-sync lang kapag online,
// at may maliit na throttle para hindi mag-sunod-sunod na sync kapag mabilis na
// nagpapalit-palit ng focus ang user.
let lastEligibleSyncAt = 0;
export async function syncIfEligible(minIntervalMs = 8000): Promise<void> {
  if (!navigator.onLine) return;
  const now = Date.now();
  if (now - lastEligibleSyncAt < minIntervalMs) return;
  lastEligibleSyncAt = now;
  await fetchAndStore();
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