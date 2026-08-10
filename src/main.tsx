import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { fetchAndStore, selfRepair } from "./app/services/syncService";

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

// 3. Self-Repair: kapag bumalik ang internet, mag-sync ulit (kung naka-ON ang auto-sync)
window.addEventListener("online", () => {
  if (!autoSyncEnabled()) return;
  selfRepair();
});

// 4. Persistent Storage: para hindi basta-basta burahin ng browser ang local data
if (navigator.storage?.persist) {
  navigator.storage.persist();
}
