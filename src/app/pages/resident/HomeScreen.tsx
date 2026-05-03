import {
  Activity,
  FileText,
  Phone,
  AlertTriangle,
  ChevronRight,
  Hand,
  Shield,
  Sparkles,
  Bell,
  Stethoscope,
} from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../services/localDB"; // I-check kung tama ang folder path

interface HomeScreenProps {
  onStartTriage: () => void;
  onArticles: () => void;
  onContacts: () => void;
  onEmergency: () => void;
  isOnline: boolean;
}

const CHARCOAL = "#1E293B";
const MUTED = "#64748B";
const EMERALD = "#10B981";

const glass: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.70)",
  backdropFilter: "blur(40px) saturate(160%)",
  WebkitBackdropFilter: "blur(40px) saturate(160%)",
  border: "1px solid #E2E8F0",
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
  borderRadius: 28,
};

export function HomeScreen({
  onStartTriage,
  onArticles,
  onContacts,
  onEmergency,
  isOnline,
}: HomeScreenProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // 1. Kumukuha ng Alerts gamit ang tamang table name na 'db.alerts'
  const activeAlerts =
    useLiveQuery(
      () =>
        db.alerts
          .filter(
            (alert) => alert.status === "active" || alert.status === "Active",
          )
          .toArray(),
      [],
    ) || [];

  // 2. Kumukuha ng Articles gamit ang tamang table name na 'db.articles'
  const articles = useLiveQuery(() => db.articles.limit(5).toArray(), []) || [];

  const tipOfTheDay =
    articles.length > 0
      ? articles[new Date().getDate() % articles.length].title
      : "Wash hands frequently with soap and water for at least 20 seconds.";

  return (
    <div
      className="px-5 py-5 space-y-4 relative"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: CHARCOAL,
      }}
    >
      {/* Greeting */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 32,
          padding: "36px 28px",
          background:
            "radial-gradient(at 15% 20%, #34d399 0%, transparent 55%), radial-gradient(at 88% 8%, #6ee7b7 0%, transparent 50%), radial-gradient(at 80% 95%, #047857 0%, transparent 60%), radial-gradient(at 8% 92%, #059669 0%, transparent 55%), linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow:
            "0 40px 80px -20px rgba(16,185,129,0.55), 0 28px 50px -12px rgba(5,150,105,0.45), 0 16px 28px -8px rgba(15,23,42,0.18), 0 4px 10px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -10px 30px rgba(2,44,34,0.18), inset 0 0 60px rgba(255,255,255,0.12)",
        }}
      >
        <div className="relative">
          <p className="text-emerald-100 text-xs font-bold tracking-widest uppercase mb-2">
            Welcome back
          </p>
          <h1 className="text-white text-4xl font-extrabold leading-none tracking-tight">
            {greeting}
          </h1>
          <p className="text-emerald-50/80 text-sm mt-3 font-medium">
            How can TALA help you today?
          </p>
        </div>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-xl shrink-0">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p
              className="text-amber-800 font-semibold"
              style={{ fontSize: "0.8rem" }}
            >
              You're Offline
            </p>
            <p className="text-amber-600" style={{ fontSize: "0.7rem" }}>
              Don't worry — all features work offline
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Alert banners (Galing sa localDB) */}
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`${
            alert.priority === "Critical" || alert.priority === "High"
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          } border rounded-2xl p-3.5 flex items-center gap-3`}
        >
          <div
            className={`${
              alert.priority === "Critical" || alert.priority === "High"
                ? "bg-red-100"
                : "bg-amber-100"
            } p-2 rounded-xl shrink-0`}
          >
            <AlertTriangle
              className={`w-4 h-4 ${
                alert.priority === "Critical" || alert.priority === "High"
                  ? "text-red-600"
                  : "text-amber-600"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold ${
                alert.priority === "Critical" || alert.priority === "High"
                  ? "text-red-800"
                  : "text-amber-800"
              }`}
              style={{ fontSize: "0.82rem" }}
            >
              {alert.title}
            </p>
            <p
              className={`${
                alert.priority === "Critical" || alert.priority === "High"
                  ? "text-red-600"
                  : "text-amber-600"
              }`}
              style={{ fontSize: "0.7rem" }}
            >
              {alert.area || "Barangay Alert"}
            </p>
          </div>
          <Bell
            className={`w-4 h-4 shrink-0 ${
              alert.priority === "Critical" || alert.priority === "High"
                ? "text-red-400"
                : "text-amber-400"
            }`}
          />
        </div>
      ))}

      {/* Main CTA — Start Triage */}
      <button
        onClick={onStartTriage}
        className="col-span-2 relative overflow-hidden p-5 flex items-center gap-4 cursor-pointer transition-transform hover:scale-[1.01] text-left"
        style={{
          background: EMERALD,
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: 28,
          boxShadow:
            "0 12px 32px rgba(16,185,129,0.32), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <div
          className="p-3.5 rounded-2xl relative"
          style={{
            background: "rgba(255,255,255,0.22)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <Stethoscope className="w-7 h-7 text-white" strokeWidth={2.2} />
        </div>
        <div className="flex-1 text-left">
          <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
            Start Health Triage
          </p>
          <p
            className="mt-0.5"
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.92)",
              fontWeight: 500,
            }}
          >
            Get guidance on symptoms step-by-step
          </p>
        </div>
        <ChevronRight
          className="w-5 h-5 text-white relative"
          strokeWidth={2.2}
        />
      </button>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onArticles}
          className="p-4 flex flex-col items-start gap-3 cursor-pointer transition-transform hover:scale-[1.02] text-left"
          style={{ ...glass, minHeight: 140 }}
        >
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <FileText
              className="w-5 h-5"
              style={{ color: EMERALD }}
              strokeWidth={2.2}
            />
          </div>
          <div className="mt-auto">
            <p
              style={{ fontSize: "0.92rem", fontWeight: 700, color: CHARCOAL }}
            >
              Health Articles
            </p>
            <p style={{ fontSize: "0.68rem", color: MUTED }}>Tips & guides</p>
          </div>
        </button>

        <button
          onClick={onContacts}
          className="p-4 flex flex-col items-start gap-3 cursor-pointer transition-transform hover:scale-[1.02] text-left"
          style={{ ...glass, minHeight: 140 }}
        >
          <div
            className="p-2.5 rounded-xl"
            style={{
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <Phone
              className="w-5 h-5"
              style={{ color: EMERALD }}
              strokeWidth={2.2}
            />
          </div>
          <div className="mt-auto">
            <p
              style={{ fontSize: "0.92rem", fontWeight: 700, color: CHARCOAL }}
            >
              Contacts
            </p>
            <p style={{ fontSize: "0.68rem", color: MUTED }}>
              Hotlines & hospitals
            </p>
          </div>
        </button>
      </div>

      {/* Emergency button */}
      <button
        onClick={onEmergency}
        className="w-full col-span-2 relative overflow-hidden p-4 flex items-center gap-3 cursor-pointer transition-transform hover:scale-[1.01] text-left"
        style={{
          background: "rgba(254, 226, 226, 0.65)",
          backdropFilter: "blur(40px) saturate(160%)",
          WebkitBackdropFilter: "blur(40px) saturate(160%)",
          border: "1px solid rgba(248, 113, 113, 0.45)",
          borderRadius: 28,
          boxShadow:
            "0 10px 28px rgba(239, 68, 68, 0.18), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        <div
          className="p-2.5 rounded-2xl"
          style={{
            background: "#EF4444",
            boxShadow: "0 4px 14px rgba(239,68,68,0.4)",
          }}
        >
          <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.4} />
        </div>
        <div className="flex-1">
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#991B1B" }}>
            Emergency SOS
          </p>
          <p style={{ fontSize: "0.72rem", color: "#B91C1C", fontWeight: 500 }}>
            Tap for immediate help
          </p>
        </div>
        <ChevronRight className="w-5 h-5" style={{ color: "#B91C1C" }} />
      </button>

      {/* Dynamic Health tips (Galing sa localDB) */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles
            className="w-4 h-4"
            style={{ color: EMERALD }}
            strokeWidth={2.2}
          />
          <span
            style={{ fontSize: "0.82rem", fontWeight: 700, color: CHARCOAL }}
          >
            Daily Health Tip
          </span>
        </div>
        <p
          style={{
            fontSize: "0.85rem",
            lineHeight: 1.65,
            color: "#334155",
          }}
        >
          {tipOfTheDay}
        </p>
      </div>

      {/* Privacy note */}
      <div className="text-center pt-1 pb-2">
        <p style={{ fontSize: "0.65rem", color: "#94A3B8" }}>
          TALA does not collect or store any personal data
        </p>
      </div>
    </div>
  );
}
