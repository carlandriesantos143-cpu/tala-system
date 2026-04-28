
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { fetchAndStore, selfRepair } from "./app/services/syncService";

  // 1. I-render ang React App mo (Ito yung original na code mo)
  createRoot(document.getElementById("root")!).render(<App />);

  // --- SIMULA NG OFFLINE-FIRST AT SELF-REPAIR LOGIC ---

  // 2. Initial Sync: Kumuha ng data kung may internet pagbukas ng app [cite: 130, 131]
  if (navigator.onLine) {
    fetchAndStore();
  }

  // 3. Self-Repair: Kapag nawalan ng internet tapos bumalik, mag-sync ulit [cite: 133, 134, 136]
  window.addEventListener("online", () => {
    console.log("[TALA] Back online — running self-repair...");
    selfRepair();
  });

  // 4. Persistent Storage: Para hindi basta-basta burahin ni Google Chrome/Browser yung data natin [cite: 138, 139, 140]
  if (navigator.storage?.persist) {
    navigator.storage.persist().then((granted) => {
      console.log("[TALA] Persistent storage:", granted ? "granted" : "denied");
    });
  }
  
