import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Bell, AlertTriangle, AlertCircle, Info, Megaphone, Clock, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/app/utils/supabase/client";

type Priority = "Critical" | "High" | "Medium" | "Low";
type AlertStatus = "Active" | "Resolved" | "Monitoring";

interface Alert {
  id: string; // Pinalitan ng string kasi UUID ang gamit sa Supabase
  title: string;
  description: string;
  priority: Priority;
  status: AlertStatus;
  area: string;
  date: string;
  source: string;
}

type AlertForm = Omit<Alert, "id">;

const emptyForm: AlertForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Active",
  area: "",
  date: new Date().toISOString().split("T")[0],
  source: "",
};

const priorityColors: Record<Priority, { bg: string; text: string; icon: any }> = {
  Critical: { bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle },
  High: { bg: "bg-orange-50", text: "text-orange-700", icon: Bell },
  Medium: { bg: "bg-amber-50", text: "text-amber-700", icon: AlertCircle },
  Low: { bg: "bg-blue-50", text: "text-blue-700", icon: Info },
};

const statusColors: Record<AlertStatus, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Resolved: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  Monitoring: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AlertForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Kukunin ang totoong data sa database pagkabukas ng page
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("health_alerts")
      .select("*")
      .order("date", { ascending: false }); // Latest alerts muna

    if (!error && data) {
      setAlerts(data as Alert[]);
    }
    setLoading(false);
  };

  const filtered = alerts.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.area.toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === "All" || a.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const openAdd = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().split("T")[0] });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (alert: Alert) => {
    setForm({
      title: alert.title,
      description: alert.description,
      priority: alert.priority,
      status: alert.status,
      area: alert.area,
      date: alert.date,
      source: alert.source,
    });
    setEditingId(alert.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from("health_alerts").update(form).eq("id", editingId);
      if (!error) {
        await fetchAlerts();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase.from("health_alerts").insert([form]);
      if (!error) {
        await fetchAlerts();
        setShowModal(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("health_alerts").delete().eq("id", id);
    if (!error) {
      await fetchAlerts();
    }
    setDeleteConfirm(null);
  };

  const activeCount = alerts.filter((a) => a.status === "Active").length;
  const criticalCount = alerts.filter((a) => a.priority === "Critical" && a.status === "Active").length;

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gray-50/50">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Total Alerts", value: alerts.length, icon: Bell, bg: "bg-blue-100", iconColor: "text-blue-600" },
          { label: "Active Now", value: activeCount, icon: Megaphone, bg: "bg-emerald-100", iconColor: "text-emerald-600" },
          { label: "Critical Priority", value: criticalCount, icon: AlertTriangle, bg: "bg-red-100", iconColor: "text-red-600" },
          { label: "High Priority", value: alerts.filter((a) => a.priority === "High" && a.status === "Active").length, icon: AlertCircle, bg: "bg-orange-100", iconColor: "text-orange-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`${s.bg} p-3 rounded-xl`}><Icon className={`w-5 h-5 ${s.iconColor}`} /></div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{s.label}</p>
                  <p className="text-gray-900" style={{ fontSize: "1.5rem" }}>{s.value}</p>
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
            <input type="text" placeholder="Search alerts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" style={{ fontSize: "0.875rem" }} />
          </div>
          <select id="alerts-filter-priority" title="Filter Priority" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer" style={{ fontSize: "0.875rem" }}>
            <option value="All">All Priorities</option>
            {["Critical", "High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer" style={{ fontSize: "0.875rem" }}>
          <Plus className="w-4 h-4" /> Create Alert
        </button>
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
            <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Loading health alerts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="bg-gray-50 p-4 rounded-full mb-4"><Bell className="w-8 h-8 text-gray-400" /></div>
            <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>No alerts found matching your criteria.</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const priorityConfig = priorityColors[alert.priority];
            const statusConfig = statusColors[alert.status];
            const PriorityIcon = priorityConfig.icon;

            return (
              <div key={alert.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex gap-6">
                  <div className={`${priorityConfig.bg} p-4 rounded-2xl h-fit`}><PriorityIcon className={`w-6 h-6 ${priorityConfig.text}`} /></div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-gray-900" style={{ fontSize: "1.1rem" }}>{alert.title}</h3>
                          <span className={`px-2.5 py-1 rounded-lg ${priorityConfig.bg} ${priorityConfig.text} font-medium`} style={{ fontSize: "0.7rem" }}>{alert.priority} Priority</span>
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusConfig.bg} ${statusConfig.text} font-medium`} style={{ fontSize: "0.7rem" }}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>{alert.status}
                          </span>
                        </div>
                        <p className="text-gray-500" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>{alert.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(alert)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Edit Alert"><Edit2 className="w-4 h-4" /></button>
                        {deleteConfirm === alert.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(alert.id)} className="px-2 py-1 bg-red-500 text-white rounded-lg cursor-pointer" style={{ fontSize: "0.7rem" }}>Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer" style={{ fontSize: "0.7rem" }}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(alert.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete Alert"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-gray-500" style={{ fontSize: "0.8rem" }}><MapPin className="w-3.5 h-3.5" />{alert.area}</div>
                      <div className="flex items-center gap-2 text-gray-500" style={{ fontSize: "0.8rem" }}><Clock className="w-3.5 h-3.5" />{new Date(alert.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2 text-gray-500" style={{ fontSize: "0.8rem" }}><Info className="w-3.5 h-3.5" />Source: {alert.source}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-800">{editingId ? "Edit Alert" : "Create New Alert"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer" title="Close"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Alert Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Dengue Case Surge" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20" style={{ fontSize: "0.875rem" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Priority Level</label>
                  <select id="alert-priority" title="Priority Level" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" style={{ fontSize: "0.875rem" }}>
                    {["Critical", "High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Status</label>
                  <select id="alert-status" title="Alert Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AlertStatus })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer" style={{ fontSize: "0.875rem" }}>
                    {["Active", "Monitoring", "Resolved"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Description & Instructions</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide details and instructions for residents..." rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" style={{ fontSize: "0.875rem" }} />
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
              <button disabled={saving} onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60" style={{ fontSize: "0.875rem" }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Publish Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}