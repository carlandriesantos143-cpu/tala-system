import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HomeScreen } from "../../pages/resident/HomeScreen";
import { TriageFlow } from "../../pages/resident/TriageFlow";
import { EmergencyScreen } from "../../pages/resident/EmergencyScreen";
import { MobileArticles } from "../../pages/resident/MobileArticles";
import { MobileContacts } from "../../pages/resident/MobileContacts";
import {
  Home,
  Activity,
  FileText,
  Phone,
  Wifi,
  WifiOff,
  Sparkles,
} from "lucide-react";

type MobileScreen = "home" | "triage" | "articles" | "contacts" | "emergency";

const CHARCOAL = "#1E293B";
const EMERALD = "#10B981";

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
    <div
      className="h-full flex flex-col overflow-hidden relative"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        backgroundColor: "#F8FAFC",
      }}
    >
      {/* Soft organic teal blobs in far corners only */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: -120,
          left: -120,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Status bar */}
      <div
        className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(40px) saturate(160%)",
          WebkitBackdropFilter: "blur(40px) saturate(160%)",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderTop: "none",
          boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: EMERALD,
              boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
            }}
          >
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2.4} />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                letterSpacing: "0.12em",
                color: CHARCOAL,
              }}
            >
              TALA
            </span>
          </div>
        </button>

        <section
          className="flex items-center gap-2 cursor-pointer px-3 py-1.5"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid #E2E8F0",
            borderRadius: 999,
          }}
        >
          <span></span>
          {isOnline ? (
            <>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: EMERALD,
                  boxShadow: "0 0 8px rgba(16,185,129,0.7)",
                }}
              />
              <Wifi
                className="w-3.5 h-3.5"
                style={{ color: EMERALD }}
                strokeWidth={2.4}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: CHARCOAL,
                }}
              >
                Online
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "#94A3B8",
                }}
              />
              <WifiOff
                className="w-3.5 h-3.5"
                style={{ color: "#64748B" }}
                strokeWidth={2.4}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#64748B",
                }}
              >
                Offline
              </span>
            </>
          )}
        </section>
      </div>

      {/* Screen content */}
      <div className="flex-1 overflow-auto min-h-0" style={{ paddingTop: 72 }}>
        {renderScreen()}
      </div>

      {/* Bottom navigation */}
      {showNav && (
        <nav
          className="px-3 py-2.5 flex items-center justify-around shrink-0 z-30"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(40px) saturate(160%)",
            WebkitBackdropFilter: "blur(40px) saturate(160%)",
            borderTop: "1px solid #E2E8F0",
          }}
        >
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
                className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all cursor-pointer"
                style={{
                  background: isActive
                    ? "rgba(16,185,129,0.10)"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(16,185,129,0.28)"
                    : "1px solid transparent",
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: isActive ? EMERALD : "#94A3B8",
                  }}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? EMERALD : "#64748B",
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
