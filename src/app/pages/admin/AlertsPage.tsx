import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, Bell, AlertTriangle, AlertCircle, Info, Megaphone, Clock, MapPin } from "lucide-react";

type Priority = "Critical" | "High" | "Medium" | "Low";
type AlertStatus = "Active" | "Resolved" | "Monitoring";

interface Alert {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: AlertStatus;
  area: string;
  date: string;
  source: string;
}

const initialAlerts: Alert[] = [
  { id: 1, title: "Measles Outbreak Warning", description: "Confirmed measles cases detected in Barangay San Jose. Immediate vaccination campaign needed for unvaccinated children aged 6 months to 5 years.", priority: "Critical", status: "Active", area: "Barangay San Jose", date: "2026-04-17", source: "DOH Regional Office" },
  { id: 2, title: "Dengue Case Surge", description: "Dengue cases rising above threshold. Fogging operations scheduled. Community clean-up drives required in all sitios.", priority: "High", status: "Active", area: "Municipal-wide", date: "2026-04-16", source: "Municipal Health Office" },
  { id: 3, title: "Contaminated Water Supply", description: "Water supply in Sitio Maligaya tested positive for E. coli. Residents advised to boil water before consumption until further notice.", priority: "Critical", status: "Active", area: "Sitio Maligaya", date: "2026-04-15", source: "LWUA" },
  { id: 4, title: "Flu Season Advisory", description: "Increased influenza-like illness cases reported. Health workers to distribute face masks and vitamin C supplements.", priority: "Medium", status: "Monitoring", area: "Municipal-wide", date: "2026-04-14", source: "BHW Network" },
  { id: 5, title: "Leptospirosis Risk After Flooding", description: "Post-flood leptospirosis prevention measures needed. Distribute prophylaxis medication to affected areas.", priority: "High", status: "Active", area: "Barangay Riverside", date: "2026-04-13", source: "Municipal DRRM Office" },
  { id: 6, title: "Rabies Vaccination Drive", description: "Free anti-rabies vaccination available at all health centers this month. Prioritize high-risk barangays.", priority: "Low", status: "Monitoring", area: "All Barangays", date: "2026-04-10", source: "Provincial Veterinary Office" },
  { id: 7, title: "TB Contact Tracing", description: "Active TB case identified. Contact tracing for household and close contacts completed. Monitoring ongoing.", priority: "Medium", status: "Resolved", area: "Barangay Lumina", date: "2026-04-08", source: "Rural Health Unit" },
  { id: 8, title: "Heat Index Warning", description: "PAGASA issued extreme heat advisory. Cancel outdoor community activities and ensure hydration stations are available.", priority: "High", status: "Resolved", area: "Municipal-wide", date: "2026-04-05", source: "PAGASA" },
];

const priorityConfig: Record<Priority, { bg: string; text: string; border: string; dot: string; icon: typeof AlertCircle; barColor: string }> = {
  Critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", icon: AlertCircle, barColor: "bg-red-500" },
  High: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500", icon: AlertTriangle, barColor: "bg-orange-500" },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", icon: Info, barColor: "bg-amber-500" },
  Low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", icon: Info, barColor: "bg-emerald-500" },
};

const statusConfig: Record<AlertStatus, { bg: string; text: string }> = {
  Active: { bg: "bg-red-50", text: "text-red-600" },
  Monitoring: { bg: "bg-amber-50", text: "text-amber-600" },
  Resolved: { bg: "bg-emerald-50", text: "text-emerald-600" },
};

const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];
const statuses: AlertStatus[] = ["Active", "Monitoring", "Resolved"];

const emptyForm = { title: "", description: "", priority: "Medium" as Priority, status: "Active" as AlertStatus, area: "", source: "" };

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = alerts.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "All" || a.priority === filterPriority;
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (alert: Alert) => {
    setForm({ title: alert.title, description: alert.description, priority: alert.priority, status: alert.status, area: alert.area, source: alert.source });
    setEditingId(alert.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setAlerts((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
    } else {
      setAlerts((prev) => [{ id: Date.now(), ...form, date: new Date().toISOString().split("T")[0] }, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => { setAlerts((prev) => prev.filter((a) => a.id !== id)); setDeleteConfirm(null); };

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gray-50/50">
      {/* Priority Summary */}
      <div className="grid grid-cols-4 gap-5">
        {priorities.map((p) => {
          const config = priorityConfig[p];
          const Icon = config.icon;
          const count = alerts.filter((a) => a.priority === p && a.status === "Active").length;
          return (
            <div key={p} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${config.barColor}`} />
              <div className="flex items-center gap-3 ml-2">
                <div className={`${config.bg} p-3 rounded-xl`}><Icon className={`w-5 h-5 ${config.text}`} /></div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{p}</p>
                  <p className="text-gray-900" style={{ fontSize: "1.5rem" }}>{count}</p>
                  <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>active alert{count !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" style={{ fontSize: "0.875rem" }} />
          </div>
          <select id="alerts-filter-priority" title="Filter Priority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" style={{ fontSize: "0.875rem" }}>
            <option value="All">All Priorities</option>
            {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select id="alerts-filter-status" title="Filter Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" style={{ fontSize: "0.875rem" }}>
            <option value="All">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer" style={{ fontSize: "0.875rem" }}>
          <Plus className="w-4 h-4" /> New Alert
        </button>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const pConfig = priorityConfig[alert.priority];
          const sConfig = statusConfig[alert.status];
          const PIcon = pConfig.icon;
          return (
            <div key={alert.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow`}>
              <div className="flex">
                <div className={`w-1.5 ${pConfig.barColor} shrink-0`} />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${pConfig.bg} p-2 rounded-lg shrink-0 mt-0.5`}>
                        <PIcon className={`w-4 h-4 ${pConfig.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-gray-800" style={{ fontSize: "0.95rem" }}>{alert.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-lg ${pConfig.bg} ${pConfig.text}`} style={{ fontSize: "0.7rem" }}>{alert.priority}</span>
                          <span className={`px-2.5 py-0.5 rounded-lg ${sConfig.bg} ${sConfig.text}`} style={{ fontSize: "0.7rem" }}>{alert.status}</span>
                        </div>
                        <p className="text-gray-500 mt-1.5 leading-relaxed" style={{ fontSize: "0.8rem" }}>{alert.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="flex items-center gap-1.5 text-gray-400" style={{ fontSize: "0.75rem" }}><MapPin className="w-3 h-3" />{alert.area}</span>
                          <span className="flex items-center gap-1.5 text-gray-400" style={{ fontSize: "0.75rem" }}><Clock className="w-3 h-3" />{alert.date}</span>
                          <span className="flex items-center gap-1.5 text-gray-400" style={{ fontSize: "0.75rem" }}><Megaphone className="w-3 h-3" />{alert.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 shrink-0">
                      <button type="button" onClick={() => openEdit(alert)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" aria-label="Edit Alert"><Edit2 className="w-4 h-4" /></button>
                      {deleteConfirm === alert.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(alert.id)} className="px-2 py-1 bg-red-500 text-white rounded-lg cursor-pointer" style={{ fontSize: "0.7rem" }}>Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer" style={{ fontSize: "0.7rem" }}>Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setDeleteConfirm(alert.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" aria-label="Delete Alert"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400" style={{ fontSize: "0.875rem" }}>No alerts found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-800">{editingId ? "Edit Alert" : "Create New Alert"}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer" aria-label="Close Modal"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Alert title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the alert..." rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" style={{ fontSize: "0.875rem" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Priority</label>
                  <select id="alerts-priority" title="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" style={{ fontSize: "0.875rem" }}>
                    {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Status</label>
                  <select id="alerts-status" title="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AlertStatus })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" style={{ fontSize: "0.875rem" }}>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Affected Area</label>
                  <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="e.g. Barangay San Jose" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" style={{ fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Source</label>
                  <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. DOH Regional" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" style={{ fontSize: "0.875rem" }} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer" style={{ fontSize: "0.875rem" }}>Cancel</button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer" style={{ fontSize: "0.875rem" }}>{editingId ? "Save Changes" : "Create Alert"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
