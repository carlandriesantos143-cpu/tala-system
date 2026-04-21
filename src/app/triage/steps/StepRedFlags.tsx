import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import type { RedFlag } from "../types";

interface Props {
  redFlags: RedFlag[];
  onChange: (flags: RedFlag[]) => void;
}

const severityConfig = {
  Critical: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", icon: AlertCircle },
  High: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", icon: AlertTriangle },
};

const emptyForm = { symptom: "", severity: "Critical" as "Critical" | "High", instruction: "" };

export function StepRedFlags({ redFlags, onChange }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (f: RedFlag) => { setForm({ symptom: f.symptom, severity: f.severity, instruction: f.instruction }); setEditingId(f.id); setShowModal(true); };

  const handleSave = () => {
    if (!form.symptom.trim() || !form.instruction.trim()) return;
    if (editingId) {
      onChange(redFlags.map((f) => f.id === editingId ? { ...f, ...form } : f));
    } else {
      onChange([...redFlags, { id: Date.now(), ...form }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => { onChange(redFlags.filter((f) => f.id !== id)); setDeleteConfirm(null); };

  const criticalCount = redFlags.filter((f) => f.severity === "Critical").length;
  const highCount = redFlags.filter((f) => f.severity === "High").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-800 font-semibold" style={{ fontSize: "1.05rem" }}>Red Flag Checklist</h3>
          <p className="text-gray-400 mt-1" style={{ fontSize: "0.8rem" }}>
            Emergency symptoms that bypass normal triage and trigger immediate action. These are checked first.
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer" style={{ fontSize: "0.85rem" }}>
          <Plus className="w-4 h-4" /> Add Red Flag
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-red-700" style={{ fontSize: "0.75rem" }}>Critical: <strong>{criticalCount}</strong></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-orange-700" style={{ fontSize: "0.75rem" }}>High: <strong>{highCount}</strong></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <span className="text-gray-500" style={{ fontSize: "0.75rem" }}>Total: <strong>{redFlags.length}</strong></span>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {redFlags.map((flag, idx) => {
          const config = severityConfig[flag.severity];
          const SevIcon = config.icon;
          return (
            <div key={flag.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex">
                <div className={`w-1.5 ${config.dot} shrink-0`} />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${config.bg} p-2 rounded-lg shrink-0 mt-0.5`}>
                        <SevIcon className={`w-4 h-4 ${config.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md" style={{ fontSize: "0.65rem", fontWeight: 600 }}>#{idx + 1}</span>
                          <span className={`px-2.5 py-0.5 rounded-lg ${config.bg} ${config.text}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>{flag.severity}</span>
                        </div>
                        <p className="text-gray-800 font-medium mt-1.5" style={{ fontSize: "0.875rem" }}>{flag.symptom}</p>
                        <div className="mt-2.5 bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-400 uppercase tracking-wide mb-1" style={{ fontSize: "0.6rem", fontWeight: 600 }}>Instruction</p>
                          <p className="text-gray-600 leading-relaxed" style={{ fontSize: "0.8rem" }}>{flag.instruction}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(flag)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Edit red flag ${flag.symptom}`}
                        title={`Edit red flag ${flag.symptom}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === flag.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(flag.id)} className="px-2.5 py-1 bg-red-500 text-white rounded-lg cursor-pointer" style={{ fontSize: "0.65rem" }}>Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer" style={{ fontSize: "0.65rem" }}>Cancel</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(flag.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          aria-label={`Delete red flag ${flag.symptom}`}
                          title={`Delete red flag ${flag.symptom}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {redFlags.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400" style={{ fontSize: "0.85rem" }}>No red flags defined yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-800 font-semibold" style={{ fontSize: "0.95rem" }}>{editingId ? "Edit Red Flag" : "Add Red Flag"}</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"
                aria-label="Close modal"
                title="Close modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Emergency Symptom</label>
                <input type="text" value={form.symptom} onChange={(e) => setForm({ ...form, symptom: e.target.value })} placeholder="e.g. Unconscious or unresponsive" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Severity</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Critical", "High"] as const).map((s) => {
                    const c = severityConfig[s];
                    const sel = form.severity === s;
                    return (
                      <button key={s} type="button" onClick={() => setForm({ ...form, severity: s })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${sel ? `${c.bg} border-current ${c.text}` : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${sel ? c.dot : "bg-gray-300"}`} />
                        <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Instruction for BHW</label>
                <textarea value={form.instruction} onChange={(e) => setForm({ ...form, instruction: e.target.value })} placeholder="What should the BHW do immediately?" rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none" style={{ fontSize: "0.875rem" }} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer" style={{ fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={handleSave} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer" style={{ fontSize: "0.85rem" }}>{editingId ? "Save Changes" : "Add Red Flag"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
