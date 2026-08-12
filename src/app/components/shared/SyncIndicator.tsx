import { useEffect, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { fetchAndStore, LAST_SYNC_KEY, SYNCED_EVENT } from "../../services/syncService";

// Maliit na "last updated + refresh" na bar para sa resident screens.
// Ipinapakita nito kung kailan huling nag-sync ang lokal na data, at nagbibigay ng
// paraan para pilit na i-refresh. Offline-aware — malinaw na sinasabi kapag saved
// data lang ang ipinapakita (hindi mananatiling nakaikot ang spinner nang walang net).

function relativeTime(iso: string | null): string {
  if (!iso) return "Not synced yet";
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Updated just now";
  if (min < 60) return `Updated ${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `Updated ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `Updated ${days}d ago`;
}

export function SyncIndicator() {
  const [lastSync, setLastSync] = useState<string | null>(() =>
    localStorage.getItem(LAST_SYNC_KEY),
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  // Ginagamit lang para pilitin ang re-render kada minuto (para tumpak ang "Xm ago").
  const [, setTick] = useState(0);

  useEffect(() => {
    const onSynced = () => setLastSync(localStorage.getItem(LAST_SYNC_KEY));
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    const interval = setInterval(() => setTick((t) => t + 1), 60000);

    window.addEventListener(SYNCED_EVENT, onSynced);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener(SYNCED_EVENT, onSynced);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    try {
      await fetchAndStore();
      setLastSync(localStorage.getItem(LAST_SYNC_KEY));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      <span
        className="flex items-center gap-1.5 text-gray-400"
        style={{ fontSize: "0.68rem", fontWeight: 500 }}
      >
        {!isOnline && <WifiOff className="w-3 h-3 text-gray-400" />}
        {isOnline ? relativeTime(lastSync) : "Offline — showing saved data"}
      </span>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={!isOnline || syncing}
        aria-label="Refresh content"
        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
        style={{ fontSize: "0.68rem", fontWeight: 600 }}
      >
        <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}
