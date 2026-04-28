import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HomeScreen } from "../../pages/resident/HomeScreen";
import { TriageFlow } from "../../pages/resident/TriageFlow";
import { EmergencyScreen } from "../../pages/resident/EmergencyScreen";
import { MobileArticles } from "../../pages/resident/MobileArticles";
import { MobileContacts } from "../../pages/resident/MobileContacts";
import { Home, Activity, FileText, Phone, Wifi, WifiOff } from "lucide-react";

type MobileScreen = "home" | "triage" | "articles" | "contacts" | "emergency";

export function MobileLayout() {
  const [screen, setScreen] = useState<MobileScreen>("home");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const goToEmergency = () => setScreen("emergency");

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return (
          <HomeScreen
            onStartTriage={() => setScreen("triage")}
            onArticles={() => setScreen("articles")}
            onContacts={() => setScreen("contacts")}
            onEmergency={goToEmergency}
            isOnline={isOnline}
          />
        );
      case "triage":
        return (
          <TriageFlow
            onBack={() => setScreen("home")}
            onEmergency={goToEmergency}
          />
        );
      case "emergency":
        return <EmergencyScreen onBack={() => setScreen("home")} />;
      case "articles":
        return <MobileArticles onBack={() => setScreen("home")} />;
      case "contacts":
        return <MobileContacts onBack={() => setScreen("home")} />;
      default:
        return null;
    }
  };

  const showNav = screen !== "triage" && screen !== "emergency";

  return (
    <div className="h-dvh max-h-dvh overflow-hidden bg-gray-50 flex flex-col font-['Inter'] max-w-[480px] mx-auto">
      {/* Status bar */}
      <div className="bg-emerald-600 px-4 py-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer"
          aria-label="Go to home"
          title="Go to home"
        >
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center leading-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="block"
              >
                <path
                  d="M9 0C9.36 7.2 10.8 8.64 18 9C10.8 9.36 9.36 10.8 9 18C8.64 10.8 7.2 9.36 0 9C7.2 8.64 8.64 7.2 9 0Z"
                  fill="white"
                />
              </svg>
            </span>
            <span
              className="text-white leading-none"
              style={{
                fontSize: "0.95rem",
                letterSpacing: "0.04em",
                fontFamily: "Inter",
              }}
            >
              TALA
            </span>
          </div>
        </button>
        
        <button className="flex items-center gap-1.5">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-200" />
              <span
                className="text-emerald-200"
                style={{ fontSize: "0.65rem" }}
              >
                Online
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-amber-300" style={{ fontSize: "0.65rem" }}>
                Offline
              </span>
            </>
          )}
        </button>
      </div>

      {/* Screen content */}
      <div className="flex-1 min-h-0 overflow-y-auto">{renderScreen()}</div>

      {/* Bottom navigation */}
      {showNav && (
        <nav className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around shrink-0">
          {[
            { id: "home" as MobileScreen, label: "Home", icon: Home },
            { id: "triage" as MobileScreen, label: "Triage", icon: Activity },
            {
              id: "articles" as MobileScreen,
              label: "Articles",
              icon: FileText,
            },
            { id: "contacts" as MobileScreen, label: "Contacts", icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = screen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setScreen(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  isActive ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
