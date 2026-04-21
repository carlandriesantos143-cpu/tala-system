import React, { useState } from "react";
import { Edit2, X, Save, AlertCircle, AlertTriangle, Info, CheckCircle, ArrowUpRight, Clock, CalendarCheck } from "lucide-react";
import type { ResultConfig, Urgency } from "../types";
import { urgencyConfig } from "../types";

interface Props {
  configs: ResultConfig[];
  onChange: (configs: ResultConfig[]) => void;
}

const urgencyIcons: Record<Urgency, typeof AlertCircle> = {
  Emergency: AlertCircle,
  Urgent: AlertTriangle,
  "Semi-Urgent": Info,
  "Non-Urgent": CheckCircle,
};

export function StepResultConfig({ configs, onChange }: Props) {
  const [editingUrgency, setEditingUrgency] = useState<Urgency | null>(null);
  const [form, setForm] = useState({ title: "", description: "", defaultAction: "", escalationNote: "", timeframe: "", followUp: "" });

  const openEdit = (c: ResultConfig) => {
    setForm({ title: c.title, description: c.description, defaultAction: c.defaultAction, escalationNote: c.escalationNote, timeframe: c.timeframe || "", followUp: c.followUp || "" });
    setEditingUrgency(c.urgency);
  };

  const handleSave = () => {
    if (!editingUrgency) return;
    onChange(configs.map((c) => c.urgency === editingUrgency ? { ...c, ...form } : c));
    setEditingUrgency(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-gray-800 font-semibold" style={{ fontSize: "1.05rem" }}>Result Configuration</h3>
        <p className="text-gray-400 mt-1" style={{ fontSize: "0.8rem" }}>
          Configure the instructions shown for each urgency level when a triage assessment is complete.
        </p>
      </div>

      <div className="space-y-4">
        {configs.map((config) => {
          const ucfg = urgencyConfig[config.urgency];
          const Icon = urgencyIcons[config.urgency];
          const isEditing = editingUrgency === config.urgency;

          return (
            <div key={config.urgency} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${ucfg.border}`}>
              {/* Color header bar */}
              <div className={`${ucfg.bg} px-5 py-3.5 flex items-center justify-between border-b ${ucfg.border}`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/70">
                    <Icon className={`w-4.5 h-4.5 ${ucfg.text}`} />
                  </div>
                  <div>
                    <span className={`block font-semibold ${ucfg.text}`} style={{ fontSize: "0.9rem" }}>{config.title}</span>
                    <span className="text-gray-500" style={{ fontSize: "0.72rem" }}>{config.description}</span>
                  </div>
                </div>
                {!isEditing && (
                  <button onClick={() => openEdit(config)} className={`flex items-center gap-1.5 px-3 py-1.5 bg-white/80 ${ucfg.text} rounded-lg hover:bg-white transition-colors cursor-pointer`} style={{ fontSize: "0.78rem" }}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="p-5 space-y-4">
                  <div>
                    <label htmlFor="result-config-title" className="block text-gray-600 mb-1.5 text-[0.8rem]">Title</label>
                    <input id="result-config-title" title="Title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-[0.875rem]" />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Description</label>
                    <input id="result-config-description" title="Description" type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 text-[0.875rem]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>
                        <Clock className="w-3.5 h-3.5 inline mr-1" />Response Timeframe
                      </label>
                      <input type="text" value={form.timeframe} onChange={(e) => setForm({ ...form, timeframe: e.target.value })} placeholder="e.g. Within 4 hours" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>
                        <CalendarCheck className="w-3.5 h-3.5 inline mr-1" />Follow-up Schedule
                      </label>
                      <input type="text" value={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.value })} placeholder="e.g. Daily check-in" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Default Action</label>
                    <textarea id="result-config-default-action" title="Default Action" value={form.defaultAction} onChange={(e) => setForm({ ...form, defaultAction: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none text-[0.875rem]" />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Escalation Note</label>
                    <textarea id="result-config-escalation-note" title="Escalation Note" value={form.escalationNote} onChange={(e) => setForm({ ...form, escalationNote: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none text-[0.875rem]" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditingUrgency(null)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 cursor-pointer" style={{ fontSize: "0.85rem" }}><X className="w-3.5 h-3.5" /> Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer" style={{ fontSize: "0.85rem" }}><Save className="w-3.5 h-3.5" /> Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Timeframe & Follow-up pills */}
                  {(config.timeframe || config.followUp) && (
                    <div className="flex flex-wrap gap-2">
                      {config.timeframe && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600" style={{ fontSize: "0.75rem" }}>{config.timeframe}</span>
                        </div>
                      )}
                      {config.followUp && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                          <CalendarCheck className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600" style={{ fontSize: "0.75rem" }}>{config.followUp}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 uppercase tracking-wide mb-1.5" style={{ fontSize: "0.65rem", fontWeight: 600 }}>Default Action</p>
                    <p className="text-gray-700 leading-relaxed" style={{ fontSize: "0.85rem" }}>{config.defaultAction}</p>
                  </div>
                  <div className={`${ucfg.bg} rounded-xl p-3.5 flex items-start gap-2.5`}>
                    <ArrowUpRight className={`w-4 h-4 ${ucfg.text} shrink-0 mt-0.5`} />
                    <div>
                      <p className={`${ucfg.text} font-medium mb-0.5`} style={{ fontSize: "0.75rem" }}>Escalation Note</p>
                      <p className="text-gray-600" style={{ fontSize: "0.8rem" }}>{config.escalationNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
