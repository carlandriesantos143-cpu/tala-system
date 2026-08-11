import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { fetchAndStore, selfRepair, flushPendingSessions } from "./app/services/syncService";

// 1. I-render ang React App
createRoot(document.getElementById("root")!).render(<App />);

// --- OFFLINE-FIRST AT SELF-REPAIR LOGIC ---

// Auto-sync preference (itinatakda sa Settings → Offline & Sync).
// Default ay naka-ON; kapag "false", hindi awtomatikong magsi-sync.
const autoSyncEnabled = () => localStorage.getItem("tala_auto_sync") !== "false";

// 2. Initial Sync: kumuha ng data kung may internet pagbukas ng app
if (autoSyncEnabled() && navigator.onLine) {
  fetchAndStore();
}

// 2b. I-flush ang naka-queue na offline triage sessions pagbukas kung online.
// Hindi naka-gate sa auto-sync — maliit na outgoing data ito (sariling records),
// at layunin nitong huwag mawala ang sessions.
if (navigator.onLine) {
  flushPendingSessions();
}

// 3. Self-Repair: kapag bumalik ang internet, mag-sync ulit (kung naka-ON ang auto-sync)
window.addEventListener("online", () => {
  // Laging subukang ipadala ang naka-queue na sessions pagbalik ng net.
  flushPendingSessions();
  if (!autoSyncEnabled()) return;
  selfRepair();
});

// 4. Persistent Storage: para hindi basta-basta burahin ng browser ang local data
if (navigator.storage?.persist) {
  navigator.storage.persist();
}
