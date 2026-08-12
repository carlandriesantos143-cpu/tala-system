import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import {
  fetchAndStore,
  flushPendingSessions,
} from "./app/services/syncService";

// 1. I-render ang React App
createRoot(document.getElementById("root")!).render(<App />);

// --- OFFLINE-FIRST AT SELF-REPAIR LOGIC ---
// Laging naka-ON ang auto-sync — walang toggle. Nakasalalay lang ito sa online status.

// 2. Initial Sync: kumuha ng data kung may internet pagbukas ng app
if (navigator.onLine) {
  fetchAndStore();
}

// 2b. I-flush ang naka-queue na offline triage sessions pagbukas kung online.
// Hindi naka-gate sa auto-sync — maliit na outgoing data ito (sariling records),
// at layunin nitong huwag mawala ang sessions.
if (navigator.onLine) {
  flushPendingSessions();
}

// 3. Reconnect: kapag bumalik ang internet, mag-full resync para masalo ang mga
//    pagbabagong ginawa ng admin habang offline ang device.
//    (Dating selfRepair lang — na nagre-resync LANG kapag walang laman ang isang table,
//    kaya hindi naa-update ang umiiral nang content sa reconnect.)
window.addEventListener("online", () => {
  // Laging subukang ipadala ang naka-queue na sessions pagbalik ng net.
  flushPendingSessions();
  fetchAndStore();
});

// 4. Persistent Storage: para hindi basta-basta burahin ng browser ang local data
if (navigator.storage?.persist) {
  navigator.storage.persist();
}
