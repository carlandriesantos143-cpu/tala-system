import React, { useState } from "react";
import {
  User,
  Lock,
  Building2,
  MapPin,
  Heart,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Info,
  Save,
  Edit2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Shield,
  Clock,
  Database,
  HardDrive,
  ChevronRight,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Zap,
  CircleDot,
} from "lucide-react";

interface AccountData {
  name: string;
  email: string;
  role: string;
}

interface SystemInfo {
  barangay: string;
  city: string;
  province: string;
  healthCenter: string;
  region: string;
}

export function SettingsPage() {
  // Account
  const [account, setAccount] = useState<AccountData>({
    name: "Maria Santos",
    email: "maria.santos@bhw.gov.ph",
    role: "BHW Admin",
  });
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountDraft, setAccountDraft] = useState(account);

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwSaved, setPwSaved] = useState(false);

  // System info
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    barangay: "Barangay San Isidro",
    city: "Quezon City",
    province: "Metro Manila",
    healthCenter: "San Isidro Health Center",
    region: "NCR – National Capital Region",
  });
  const [editingSystem, setEditingSystem] = useState(false);
  const [systemDraft, setSystemDraft] = useState(systemInfo);

  // Offline & Sync
  const [isOnline, setIsOnline] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "failed">("idle");
  const [lastSyncTime] = useState(new Date(2026, 3, 17, 14, 34, 0));
  const offlineDataSize = "24.3 MB";
  const cachedArticles = 42;
  const cachedProtocols = 4;
  const cachedContacts = 8;

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const formatTimestamp = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) +
    " — " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  // Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 3000);
  };

  const saveAccount = () => {
    setAccount(accountDraft);
    setEditingAccount(false);
    showToast("Account settings saved");
  };

  const savePassword = () => {
    if (!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm) return;
    setPwSaved(true);
    setTimeout(() => {
      setShowPasswordForm(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
      setPwSaved(false);
      showToast("Password updated successfully");
    }, 1200);
  };

  const saveSystem = () => {
    setSystemInfo(systemDraft);
    setEditingSystem(false);
    showToast("System information updated");
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      if (isOnline) {
        setSyncStatus("success");
        showToast("Offline data synced successfully");
      } else {
        setSyncStatus("failed");
        showToast("Sync failed — no internet connection", "error");
      }
    }, 2000);
  };

  const handleClear = () => {
    setShowClearConfirm(false);
    showToast("Offline cache cleared");
  };

  const handleReset = () => {
    setShowResetConfirm(false);
    showToast("System reset to defaults");
  };

  // Reusable section wrapper
  const Section = ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div id={id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {children}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, description, action }: { icon: typeof User; title: string; description: string; action?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-100 p-2.5 rounded-xl">
          <Icon className="w-4.5 h-4.5 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-gray-800 font-semibold" style={{ fontSize: "0.92rem" }}>{title}</h4>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.72rem" }}>{description}</p>
        </div>
      </div>
      {action}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-gray-400 mb-1" style={{ fontSize: "0.72rem", fontWeight: 500 }}>{label}</p>
      <p className="text-gray-700" style={{ fontSize: "0.875rem" }}>{value}</p>
    </div>
  );

  const InputField = ({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div>
      <label className="block text-gray-500 mb-1.5" style={{ fontSize: "0.78rem" }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
        style={{ fontSize: "0.875rem" }} />
    </div>
  );

  // Sidebar nav items
  const sideNavItems = [
    { id: "account", label: "Account", icon: User },
    { id: "system", label: "System Info", icon: Building2 },
    { id: "offline", label: "Offline & Sync", icon: Wifi },
    { id: "data", label: "Data Management", icon: Database },
    { id: "about", label: "About TALA", icon: Info },
  ];

  const [activeSection, setActiveSection] = useState("account");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50/50">
      {/* Settings sidebar nav */}
      <div className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-gray-800 font-semibold" style={{ fontSize: "0.95rem" }}>Settings</h3>
          <p className="text-gray-400 mt-1" style={{ fontSize: "0.72rem" }}>Manage your system configuration</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sideNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
              >
                <Icon className="w-4 h-4" />
                <span style={{ fontSize: "0.82rem" }}>{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-6 space-y-6">

          {/* ── 1. Account Settings ── */}
          <div id="settings-account">
            <Section>
              <SectionHeader
                icon={User}
                title="Account Settings"
                description="Your admin profile and credentials"
                action={!editingAccount ? (
                  <button onClick={() => { setAccountDraft(account); setEditingAccount(true); }} className="flex items-center gap-1.5 px-3.5 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer" style={{ fontSize: "0.8rem" }}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : undefined}
              />
              <div className="p-6">
                {editingAccount ? (
                  <div className="space-y-4">
                    <InputField label="Full Name" value={accountDraft.name} onChange={(v) => setAccountDraft({ ...accountDraft, name: v })} />
                    <InputField label="Email Address" value={accountDraft.email} onChange={(v) => setAccountDraft({ ...accountDraft, email: v })} />
                    <div>
                      <label className="block text-gray-500 mb-1.5" style={{ fontSize: "0.78rem" }}>Role</label>
                      <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500" style={{ fontSize: "0.875rem" }}>{accountDraft.role} <span className="text-gray-400 ml-1" style={{ fontSize: "0.72rem" }}>(read-only)</span></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => setEditingAccount(false)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 cursor-pointer" style={{ fontSize: "0.82rem" }}><X className="w-3.5 h-3.5" /> Cancel</button>
                      <button onClick={saveAccount} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer" style={{ fontSize: "0.82rem" }}><Save className="w-3.5 h-3.5" /> Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-6">
                    <Field label="Full Name" value={account.name} />
                    <Field label="Email" value={account.email} />
                    <Field label="Role" value={account.role} />
                  </div>
                )}
              </div>

              {/* Password section */}
              <div className="border-t border-gray-100">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Lock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium" style={{ fontSize: "0.85rem" }}>Password</span>
                      <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>Last changed 30 days ago</p>
                    </div>
                  </div>
                  {!showPasswordForm && (
                    <button onClick={() => setShowPasswordForm(true)} className="px-3.5 py-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer" style={{ fontSize: "0.8rem" }}>
                      Change Password
                    </button>
                  )}
                </div>
                {showPasswordForm && (
                  <div className="px-6 pb-6 space-y-4">
                    {([ 
                      { key: "current" as const, label: "Current Password" },
                      { key: "newPw" as const, label: "New Password" },
                      { key: "confirm" as const, label: "Confirm New Password" },
                    ]).map((f) => (
                      <div key={f.key}>
                        <label className="block text-gray-500 mb-1.5" style={{ fontSize: "0.78rem" }}>{f.label}</label>
                        <div className="relative">
                          <input
                            title={f.label}
                            placeholder={f.label}
                            type={showPw[f.key] ? "text" : "password"}
                            value={pwForm[f.key]}
                            onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 pr-11"
                            style={{ fontSize: "0.875rem" }}
                          />
                          <button onClick={() => setShowPw({ ...showPw, [f.key]: !showPw[f.key] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                            {showPw[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                      <p className="text-red-500" style={{ fontSize: "0.75rem" }}>Passwords do not match</p>
                    )}
                    <div className="flex justify-end gap-3 pt-1">
                      <button onClick={() => { setShowPasswordForm(false); setPwForm({ current: "", newPw: "", confirm: "" }); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 cursor-pointer" style={{ fontSize: "0.82rem" }}>Cancel</button>
                      <button
                        onClick={savePassword}
                        disabled={!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontSize: "0.82rem" }}
                      >
                        {pwSaved ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</> : <><Lock className="w-3.5 h-3.5" /> Update Password</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* ── 2. System Information ── */}
          <div id="settings-system">
            <Section>
              <SectionHeader
                icon={Building2}
                title="System Information"
                description="Health facility and location details"
                action={!editingSystem ? (
                  <button onClick={() => { setSystemDraft(systemInfo); setEditingSystem(true); }} className="flex items-center gap-1.5 px-3.5 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer" style={{ fontSize: "0.8rem" }}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : undefined}
              />
              <div className="p-6">
                {editingSystem ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Barangay Name" value={systemDraft.barangay} onChange={(v) => setSystemDraft({ ...systemDraft, barangay: v })} />
                      <InputField label="City / Municipality" value={systemDraft.city} onChange={(v) => setSystemDraft({ ...systemDraft, city: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Province" value={systemDraft.province} onChange={(v) => setSystemDraft({ ...systemDraft, province: v })} />
                      <InputField label="Region" value={systemDraft.region} onChange={(v) => setSystemDraft({ ...systemDraft, region: v })} />
                    </div>
                    <InputField label="Health Center Name" value={systemDraft.healthCenter} onChange={(v) => setSystemDraft({ ...systemDraft, healthCenter: v })} />
                    <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => setEditingSystem(false)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 cursor-pointer" style={{ fontSize: "0.82rem" }}><X className="w-3.5 h-3.5" /> Cancel</button>
                      <button onClick={saveSystem} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer" style={{ fontSize: "0.82rem" }}><Save className="w-3.5 h-3.5" /> Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                      <Field label="Barangay" value={systemInfo.barangay} />
                      <Field label="City / Municipality" value={systemInfo.city} />
                      <Field label="Province" value={systemInfo.province} />
                      <Field label="Region" value={systemInfo.region} />
                    </div>
                    <div className="pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-2.5 mt-3">
                        <Heart className="w-4 h-4 text-emerald-500" />
                        <span className="text-gray-700 font-medium" style={{ fontSize: "0.85rem" }}>{systemInfo.healthCenter}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* ── 3. Offline & Sync ── */}
          <div id="settings-offline">
            <Section>
              <SectionHeader icon={Wifi} title="Offline & Sync Settings" description="Manage cached data and synchronization" />
              <div className="p-6">
                {/* Connection status indicator */}
                <div className={`flex items-center gap-3 mb-5 p-4 rounded-xl border ${isOnline ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                  <div className={`p-2.5 rounded-lg ${isOnline ? "bg-emerald-200" : "bg-red-200"}`}>
                    {isOnline ? <Wifi className="w-4.5 h-4.5 text-emerald-700" /> : <WifiOff className="w-4.5 h-4.5 text-red-700" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                      <p className={`font-semibold ${isOnline ? "text-emerald-800" : "text-red-800"}`} style={{ fontSize: "0.88rem" }}>
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                    <p className={`mt-0.5 ${isOnline ? "text-emerald-600" : "text-red-600"}`} style={{ fontSize: "0.72rem" }}>
                      {isOnline ? "Connected — Auto sync enabled" : "No internet connection — Using local data"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${isOnline ? "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-white border-red-200 text-red-700 hover:bg-red-100"}`}
                    style={{ fontSize: "0.7rem" }}
                  >
                    {isOnline ? "Simulate Offline" : "Simulate Online"}
                  </button>
                </div>

                {/* Sync controls row */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Sync now */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 text-blue-600 ${syncing ? "animate-spin" : ""}`} />
                        <span className="text-gray-700 font-medium" style={{ fontSize: "0.85rem" }}>Manual Sync</span>
                      </div>
                      <button
                        onClick={handleSync}
                        disabled={syncing || !isOnline}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontSize: "0.78rem" }}
                      >
                        <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Now"}
                      </button>
                    </div>
                    <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>Fetch latest data from server</p>

                    {/* Sync feedback */}
                    {syncStatus === "success" && !syncing && (
                      <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700" style={{ fontSize: "0.7rem", fontWeight: 500 }}>Sync successful</span>
                      </div>
                    )}
                    {syncStatus === "failed" && !syncing && (
                      <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-red-700" style={{ fontSize: "0.7rem", fontWeight: 500 }}>Sync failed — No internet</span>
                      </div>
                    )}
                    {!isOnline && syncStatus === "idle" && (
                      <div className="flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-amber-700" style={{ fontSize: "0.7rem", fontWeight: 500 }}>Sync unavailable while offline</span>
                      </div>
                    )}
                  </div>

                  {/* Auto sync toggle */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-700 font-medium" style={{ fontSize: "0.85rem" }}>Auto Sync</span>
                      </div>
                      <button
                        onClick={() => setAutoSync(!autoSync)}
                        className="cursor-pointer"
                      >
                        {autoSync ? (
                          <ToggleRight className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>
                      {autoSync
                        ? "System syncs automatically when online"
                        : "Automatic syncing is disabled"}
                    </p>
                    <div className={`flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg ${autoSync ? "bg-emerald-50 border border-emerald-100" : "bg-gray-100 border border-gray-200"}`}>
                      <CircleDot className={`w-3.5 h-3.5 ${autoSync ? "text-emerald-600" : "text-gray-400"}`} />
                      <span className={`${autoSync ? "text-emerald-700" : "text-gray-500"}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                        Auto Sync: {autoSync ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last synced detail */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium" style={{ fontSize: "0.85rem" }}>
                      Last synced: {getRelativeTime(lastSyncTime)}
                    </p>
                    <p className="text-blue-500 mt-0.5" style={{ fontSize: "0.68rem" }}>
                      {formatTimestamp(lastSyncTime)}
                    </p>
                  </div>
                </div>

                {/* Cache stats grid */}
                <p className="text-gray-500 font-medium mb-3" style={{ fontSize: "0.78rem" }}>Cached Data</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Cache Size", value: offlineDataSize, icon: HardDrive, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
                    { label: "Articles", value: cachedArticles.toString(), icon: Database, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
                    { label: "Protocols", value: cachedProtocols.toString(), icon: Shield, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
                    { label: "Contacts", value: cachedContacts.toString(), icon: MapPin, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                  ].map((stat) => {
                    const SIcon = stat.icon;
                    return (
                      <div key={stat.label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                        <div className={`${stat.iconBg} p-1.5 rounded-lg w-fit mb-2`}>
                          <SIcon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
                        </div>
                        <p className="text-gray-800 font-bold" style={{ fontSize: "1rem" }}>{stat.value}</p>
                        <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.68rem" }}>{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Section>
          </div>

          {/* ── 4. Data Management ── */}
          <div id="settings-data">
            <Section>
              <SectionHeader icon={Database} title="Data Management" description="Clear cache or reset the system to defaults" />
              <div className="p-6 space-y-4">
                {/* Clear offline data */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2.5 rounded-lg">
                        <Trash2 className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium" style={{ fontSize: "0.85rem" }}>Clear Offline Cache</p>
                        <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>Remove all cached articles, protocols, and contacts from this device</p>
                      </div>
                    </div>
                    <button onClick={() => setShowClearConfirm(true)} className="px-4 py-2 text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer shrink-0" style={{ fontSize: "0.82rem" }}>
                      Clear Cache
                    </button>
                  </div>
                  <p className="text-gray-400 mt-2.5 ml-14 pl-0.5" style={{ fontSize: "0.68rem" }}>
                    Cached data will be re-downloaded automatically on the next sync when you're online.
                  </p>
                </div>

                {/* Reset system — visually distinct destructive action */}
                <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2.5 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-red-700 font-semibold" style={{ fontSize: "0.85rem" }}>Reset System</p>
                        <p className="text-red-500" style={{ fontSize: "0.72rem" }}>This action is permanent and cannot be reversed</p>
                      </div>
                    </div>
                    <button onClick={() => setShowResetConfirm(true)} className="px-4 py-2 text-white bg-red-500 border border-red-600 hover:bg-red-600 rounded-xl transition-colors cursor-pointer shrink-0 font-medium" style={{ fontSize: "0.82rem" }}>
                      Reset System
                    </button>
                  </div>
                  <div className="mt-3 ml-14 pl-0.5 flex items-start gap-2 bg-red-100/60 rounded-lg p-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-600" style={{ fontSize: "0.68rem", lineHeight: 1.5 }}>
                      This will remove all cached data and restore default settings. Your admin account will remain, but all local triage data, articles, contacts, and preferences will be permanently erased.
                    </p>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* ── 5. About System ── */}
          <div id="settings-about">
            <Section>
              <SectionHeader icon={Info} title="About TALA" description="System version and information" />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-sm">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 font-bold" style={{ fontSize: "1.05rem" }}>TALA</h4>
                    <p className="text-gray-400" style={{ fontSize: "0.78rem" }}>Triage and Localized health Assistance</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Version", value: "1.0.0-beta" },
                    { label: "Build", value: "2026.04.17" },
                    { label: "Environment", value: "Production" },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3.5">
                      <p className="text-gray-400" style={{ fontSize: "0.68rem", fontWeight: 500 }}>{item.label}</p>
                      <p className="text-gray-700 font-medium mt-1" style={{ fontSize: "0.85rem" }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-emerald-800 leading-relaxed" style={{ fontSize: "0.8rem" }}>
                    TALA is an offline-first health decision support system designed for Barangay Health Workers.
                    It provides triage protocols, health articles, emergency contacts, and community alerts
                    to support primary healthcare delivery at the grassroots level. TALA does not collect,
                    store, or transmit any personally identifiable patient data.
                  </p>
                </div>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>Developed for DOH Community Health Programs</p>
                  <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>© 2026 TALA Health Systems</p>
                </div>
              </div>
            </Section>
          </div>

        </div>
      </div>

      {/* ── Confirmation Modals ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-gray-800 font-semibold" style={{ fontSize: "0.95rem" }}>Clear Offline Data?</h4>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.75rem" }}>Cached content will need to re-download on next sync</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 cursor-pointer" style={{ fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={handleClear} className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 cursor-pointer" style={{ fontSize: "0.85rem" }}>Clear Data</button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2.5 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-gray-800 font-semibold" style={{ fontSize: "0.95rem" }}>Reset System?</h4>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.75rem" }}>All settings will be restored to defaults. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 cursor-pointer" style={{ fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={handleReset} className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 cursor-pointer" style={{ fontSize: "0.85rem" }}>Reset System</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-gray-800 text-white rounded-xl shadow-lg animate-fade-in" style={{ fontSize: "0.85rem" }}>
          {toastType === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          {toast}
        </div>
      )}
    </div>
  );
}