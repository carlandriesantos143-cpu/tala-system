import { useState, useEffect } from "react";
import { WifiOff, X } from "lucide-react";

export function OfflineBadge() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOnline = () => { setIsOffline(false); setDismissed(false); };
    const goOffline = () => { setIsOffline(true); setDismissed(false); };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[420px]">
      <div className="bg-gray-800/95 backdrop-blur-sm text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        {/* Icon */}
        <div className="bg-amber-500/20 p-2 rounded-xl shrink-0">
          <WifiOff className="w-4 h-4 text-amber-400" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white" style={{ fontSize: "0.8rem" }}>
            Offline Mode    
          </p>
          <p className="text-gray-400 leading-snug" style={{ fontSize: "0.7rem" }}>
            No internet — TALA is still fully usable offline.
          </p>
        </div>

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-gray-300 shrink-0 cursor-pointer"
          aria-label="Dismiss offline notice"
          title="Dismiss offline notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}