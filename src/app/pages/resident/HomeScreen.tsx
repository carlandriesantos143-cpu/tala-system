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
  const activeAlerts = useLiveQuery(
    () => db.alerts.filter((alert) => alert.status === "active" || alert.status === "Active").toArray(),
    []
  ) || [];

  // 2. Kumukuha ng Articles gamit ang tamang table name na 'db.articles'
  const articles = useLiveQuery(
    () => db.articles.limit(5).toArray(),
    []
  ) || [];

  const tipOfTheDay = articles.length > 0
    ? articles[new Date().getDate() % articles.length].title
    : "Wash hands frequently with soap and water for at least 20 seconds.";

  return (
    <div className="mx-auto min-h-full w-full max-w-[430px] space-y-5 px-5 py-6 pb-24">
      {/* Greeting */}
      <div>
        <h1
          className="text-gray-800 flex items-center gap-2"
          style={{ fontSize: "1.5rem", fontWeight: 700 }}
        >
          <span>{greeting}!</span>
          <Hand className="w-5 h-5" />
        </h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: "0.85rem" }}>
          How can TALA help you today?
        </p>
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
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-5 flex items-center gap-4 transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
      >
        <div className="bg-white/20 p-3.5 rounded-xl">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold" style={{ fontSize: "1.05rem" }}>
            Start Health Triage
          </p>
          <p
            className="text-emerald-100 mt-0.5"
            style={{ fontSize: "0.75rem" }}
          >
            Get guidance on symptoms step-by-step
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-200" />
      </button>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onArticles}
          className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="bg-blue-100 p-3 rounded-xl">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <span
            className="text-gray-700 font-medium"
            style={{ fontSize: "0.82rem" }}
          >
            Health Articles
          </span>
          <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>
            Tips & guides
          </span>
        </button>

        <button
          onClick={onContacts}
          className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="bg-violet-100 p-3 rounded-xl">
            <Phone className="w-5 h-5 text-violet-600" />
          </div>
          <span
            className="text-gray-700 font-medium"
            style={{ fontSize: "0.82rem" }}
          >
            Emergency Contacts
          </span>
          <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>
            Hospitals & hotlines
          </span>
        </button>
      </div>

      {/* Emergency button */}
      <button
        onClick={onEmergency}
        className="w-full bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 transition-colors cursor-pointer"
      >
        <div className="bg-red-500 p-2.5 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p
            className="text-red-700 font-bold"
            style={{ fontSize: "0.9rem" }}
          >
            Emergency?
          </p>
          <p className="text-red-500" style={{ fontSize: "0.7rem" }}>
            Tap here for immediate help
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-red-400" />
      </button>

      {/* Dynamic Health tips (Galing sa localDB) */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span
            className="text-emerald-700 font-semibold"
            style={{ fontSize: "0.82rem" }}
          >
            Daily Health Tip
          </span>
        </div>
        <p className="text-emerald-700" style={{ fontSize: "0.82rem", lineHeight: 1.6 }}>
          {tipOfTheDay}
        </p>
      </div>

      {/* Privacy note */}
      <div className="text-center pb-2">
        <p className="text-gray-300" style={{ fontSize: "0.65rem" }}>
          TALA does not collect or store any personal data
        </p>
      </div>
    </div>
  );
}