import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function InstallPrompt() {
  // Dito natin ise-save yung event galing sa browser
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Aabangan natin kung papayag si Chrome na i-install ang app
    const handleBeforeInstallPrompt = (e: Event) => {
      // Pipigilan natin yung default na behavior ng browser
      e.preventDefault();
      // Ise-save natin yung event para magamit natin sa button natin
      setDeferredPrompt(e);
      // Ipapalabas natin yung custom banner natin
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 2. Aabangan kung successful ang pag-install
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      console.log("[TALA] PWA was installed successfully!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Ipapalabas na natin yung totoong Google Chrome install prompt
    deferredPrompt.prompt();

    // Hihintayin natin ang sagot ng user (kung in-accept o kinancel)
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[TALA] User install choice: ${outcome}`);

    // Pagkatapos sumagot ng user, itatago na natin ang banner
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Kung hindi installable (or na-install na), huwag magpakita ng kahit ano
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-start gap-4 transition-all duration-300">
      <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 flex-shrink-0">
        <Download className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h4 className="text-gray-800 font-bold text-sm">I-install ang TALA</h4>
        <p className="text-gray-500 text-xs mt-1 mb-3">
          Idagdag sa home screen ng phone mo para mas mabilis buksan at magamit offline.
        </p>
        <button
          onClick={handleInstallClick}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          Install Now
        </button>
      </div>
      <button
        onClick={() => setShowPrompt(false)}
        aria-label="Close install prompt"
        title="Close install prompt"
        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}