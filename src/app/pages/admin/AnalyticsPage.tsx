import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/app/utils/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  ClipboardCheck,
  AlertCircle,
  ShieldCheck,
  TrendingDown,
  CalendarDays,
  Info,
  ChevronDown,
  Loader2,
  BarChart3,
  Download,
  Printer,
} from "lucide-react";

// ── Session row shape (anonymous aggregate — walang PII) ──
interface TriageSession {
  id: string;
  urgency_result: string | null;
  age_group: string | null;
  user_type: string | null;
  red_flag_count: number | null;
  flagged_clusters: string[] | null;
  completed: boolean | null;
  is_offline: boolean | null;
  created_at: string;
}

const URGENCY_META: Record<string, { label: string; color: string }> = {
  Emergency: { label: "Emergency", color: "#ef4444" },
  Urgent: { label: "Urgent", color: "#f97316" },
  "Semi-Urgent": { label: "Semi-Urgent", color: "#eab308" },
  "Non-Urgent": { label: "Non-Urgent", color: "#10b981" },
};
const URGENCY_ORDER = ["Emergency", "Urgent", "Semi-Urgent", "Non-Urgent"];

const timeRange = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];
const rangeDays: Record<string, number | null> = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 90 Days": 90,
  "All Time": null,
};

// ── Aggregation helpers ──────────────────────────────────────
function computeWeekly(sessions: TriageSession[]) {
  const now = Date.now();
  const buckets = [0, 1, 2, 3].map(() => ({ assessments: 0, completed: 0 }));
  sessions.forEach((s) => {
    const w = Math.floor(
      (now - new Date(s.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000),
    );
    if (w >= 0 && w < 4) {
      buckets[w].assessments++;
      if (s.completed) buckets[w].completed++;
    }
  });
  // w=3 pinakaluma → w=0 pinakabago; i-order pakaliwa(luma)→pakanan(bago)
  return [3, 2, 1, 0].map((w, i) => ({
    week: `Week ${i + 1}`,
    assessments: buckets[w].assessments,
    completed: buckets[w].completed,
  }));
}

function computeMonthly(sessions: TriageSession[]) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const months = [] as {
    key: string; month: string; emergency: number; urgent: number; semiUrgent: number; nonUrgent: number;
  }[];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: monthNames[d.getMonth()], emergency: 0, urgent: 0, semiUrgent: 0, nonUrgent: 0 });
  }
  const idxByKey: Record<string, number> = {};
  months.forEach((m, i) => (idxByKey[m.key] = i));
  sessions.forEach((s) => {
    const d = new Date(s.created_at);
    const idx = idxByKey[`${d.getFullYear()}-${d.getMonth()}`];
    if (idx === undefined) return;
    if (s.urgency_result === "Emergency") months[idx].emergency++;
    else if (s.urgency_result === "Urgent") months[idx].urgent++;
    else if (s.urgency_result === "Semi-Urgent") months[idx].semiUrgent++;
    else if (s.urgency_result === "Non-Urgent") months[idx].nonUrgent++;
  });
  return months;
}

function computeStats(sessions: TriageSession[]) {
  const total = sessions.length;
  const completed = sessions.filter((s) => s.completed).length;
  const abandoned = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const redFlagTriggers = sessions.filter((s) => (s.red_flag_count ?? 0) > 0).length;

  const outcomeCounts: Record<string, number> = { Emergency: 0, Urgent: 0, "Semi-Urgent": 0, "Non-Urgent": 0 };
  sessions.forEach((s) => {
    if (s.urgency_result && s.urgency_result in outcomeCounts) outcomeCounts[s.urgency_result]++;
  });
  const triageOutcomes = URGENCY_ORDER.map((u) => ({
    name: URGENCY_META[u].label, value: outcomeCounts[u], color: URGENCY_META[u].color,
  }));

  const ageMap: Record<string, number> = {};
  sessions.forEach((s) => {
    const g = s.age_group ?? "Unknown";
    ageMap[g] = (ageMap[g] ?? 0) + 1;
  });
  const ageDistribution = Object.entries(ageMap).map(([group, count]) => ({ group, count }));

  const symptomMap: Record<string, number> = {};
  sessions.forEach((s) => (s.flagged_clusters ?? []).forEach((c) => { symptomMap[c] = (symptomMap[c] ?? 0) + 1; }));
  const symptomEntries = Object.entries(symptomMap).sort((a, b) => b[1] - a[1]);
  const symptomTotal = symptomEntries.reduce((sum, [, c]) => sum + c, 0);
  const topSymptoms = symptomEntries.slice(0, 8).map(([symptom, count]) => ({
    symptom, count, pct: symptomTotal > 0 ? Math.round((count / symptomTotal) * 100) : 0,
  }));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  sessions.forEach((s) => { dayCounts[new Date(s.created_at).getDay()]++; });
  const dailyVolume = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day, count: dayCounts[dayNames.indexOf(day)],
  }));

  return {
    total, completed, abandoned, completionRate, redFlagTriggers,
    triageOutcomes, ageDistribution, topSymptoms, dailyVolume,
    weeklyTrend: computeWeekly(sessions),
    outcomeByMonth: computeMonthly(sessions),
  };
}

// ── Component ──
export function AnalyticsPage() {
  const [range, setRange] = useState("Last 30 Days");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setLoadError(false);
      let query = supabase.from("triage_sessions").select("*").order("created_at", { ascending: false });
      const days = rangeDays[range];
      if (days) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte("created_at", since);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error loading analytics:", error);
        setLoadError(true);
      } else {
        setSessions((data ?? []) as TriageSession[]);
      }
      setLoading(false);
    };
    fetchSessions();
  }, [range]);

  const stats = useMemo(() => computeStats(sessions), [sessions]);

  // ── CSV export (raw anonymous sessions, respects the date range) ──
  const downloadCsv = () => {
    if (!sessions.length) return;
    const headers = [
      "created_at", "urgency_result", "age_group", "user_type",
      "red_flag_count", "status", "connection", "flagged_clusters",
    ];
    const cell = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = sessions.map((s) =>
      [
        s.created_at,
        s.urgency_result ?? "",
        s.age_group ?? "",
        s.user_type ?? "",
        s.red_flag_count ?? 0,
        s.completed ? "completed" : "abandoned",
        s.is_offline ? "offline" : "online",
        (s.flagged_clusters ?? []).join("; "),
      ].map(cell).join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tala-triage-sessions_${range.replace(/\s+/g, "-").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── PDF report (dependency-free: styled HTML → browser print/Save as PDF) ──
  // Design uses TALA tokens: emerald #10B981 / #059669, charcoal #1E293B,
  // Plus Jakarta Sans, rounded cards — to match the system design.
  const printReport = () => {
    if (!sessions.length) return;
    const esc = (s: unknown) =>
      String(s).replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
      );
    const generated = new Date().toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short" });

    const kpis: [string, string | number][] = [
      ["Total Assessments", stats.total.toLocaleString()],
      ["Completed", stats.completed.toLocaleString()],
      ["Abandoned", stats.abandoned.toLocaleString()],
      ["Completion Rate", `${stats.completionRate}%`],
      ["Red Flags", stats.redFlagTriggers.toLocaleString()],
    ];
    const kpiHtml = kpis
      .map(([l, v]) => `<div class="kpi"><div class="lbl">${esc(l)}</div><div class="val">${esc(v)}</div></div>`)
      .join("");

    const outcomeRows = stats.triageOutcomes
      .map((o) => {
        const share = stats.completed ? Math.round((o.value / stats.completed) * 100) : 0;
        return `<tr><td><span class="dot" style="background:${o.color}"></span>${esc(o.name)}</td><td class="num">${o.value}</td><td class="num">${share}%</td></tr>`;
      })
      .join("");

    const ageRows =
      stats.ageDistribution
        .slice()
        .sort((a, b) => b.count - a.count)
        .map((a) => `<tr><td>${esc(a.group)}</td><td class="num">${a.count}</td></tr>`)
        .join("") || `<tr><td colspan="2" style="color:#94A3B8">No data</td></tr>`;

    const symptomRows =
      stats.topSymptoms
        .map((s) => `<tr><td>${esc(s.symptom)}</td><td class="num">${s.count}</td><td class="num">${s.pct}%</td></tr>`)
        .join("") || `<tr><td colspan="3" style="color:#94A3B8">No data</td></tr>`;

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>TALA Triage Analytics Report</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  @page{size:A4;margin:16mm 14mm;}
  body{font-family:'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#1E293B;margin:0;background:#fff;}
  .head{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:2px solid #10B981;}
  .brand{display:flex;align-items:center;gap:10px;}
  .logo{width:34px;height:34px;border-radius:10px;background:#10B981;display:flex;align-items:center;justify-content:center;}
  .brand h1{font-size:18px;font-weight:800;letter-spacing:.14em;margin:0;color:#1E293B;}
  .brand p{margin:2px 0 0;font-size:11px;color:#64748B;font-weight:500;}
  .meta{text-align:right;font-size:10.5px;color:#64748B;line-height:1.5;}
  .range{display:inline-block;margin-top:5px;padding:3px 10px;border-radius:999px;background:rgba(16,185,129,.10);border:1px solid rgba(16,185,129,.28);color:#059669;font-weight:700;font-size:10px;}
  h2.section{font-size:12.5px;font-weight:700;color:#1E293B;margin:22px 0 10px;}
  h2.section span{color:#94A3B8;font-weight:500;font-size:10.5px;}
  .kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:18px;}
  .kpi{border:1px solid #E2E8F0;border-radius:12px;padding:12px;}
  .kpi .lbl{font-size:8.5px;font-weight:600;letter-spacing:.04em;color:#94A3B8;text-transform:uppercase;}
  .kpi .val{font-size:20px;font-weight:800;color:#1E293B;margin-top:6px;}
  .card{border:1px solid #E2E8F0;border-radius:12px;padding:6px 14px;}
  table{width:100%;border-collapse:collapse;font-size:11px;}
  th{text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.04em;color:#94A3B8;font-weight:600;padding:8px;border-bottom:1px solid #E2E8F0;}
  td{padding:7px 8px;border-bottom:1px solid #F1F5F9;color:#334155;}
  td.num,th.num{text-align:right;}
  tr:last-child td{border-bottom:none;}
  .dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:8px;vertical-align:middle;}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:22px;}
  .note{margin-top:24px;padding:12px 14px;background:#F0FDF4;border:1px solid #DCFCE7;border-radius:12px;font-size:10px;color:#047857;line-height:1.5;}
  .foot{margin-top:14px;padding-top:12px;border-top:1px solid #E2E8F0;display:flex;justify-content:space-between;font-size:9px;color:#94A3B8;}
</style></head><body>
  <div class="head">
    <div class="brand">
      <div class="logo"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" fill="#fff"/></svg></div>
      <div><h1>TALA</h1><p>Triage Analytics Report</p></div>
    </div>
    <div class="meta">Generated: ${esc(generated)}<br/>Barangay Malinta, Valenzuela City<br/><span class="range">${esc(range)}</span></div>
  </div>
  <div class="kpis">${kpiHtml}</div>
  <h2 class="section">Triage Outcomes <span>(of completed assessments)</span></h2>
  <div class="card"><table><thead><tr><th>Outcome</th><th class="num">Count</th><th class="num">Share</th></tr></thead><tbody>${outcomeRows}</tbody></table></div>
  <div class="cols">
    <div><h2 class="section">Age Distribution</h2><div class="card"><table><thead><tr><th>Age Group</th><th class="num">Assessments</th></tr></thead><tbody>${ageRows}</tbody></table></div></div>
    <div><h2 class="section">Top Symptom Categories</h2><div class="card"><table><thead><tr><th>Category</th><th class="num">Count</th><th class="num">Share</th></tr></thead><tbody>${symptomRows}</tbody></table></div></div>
  </div>
  <div class="note"><strong>Privacy:</strong> This report contains only aggregated, anonymous data for the selected period. TALA does not collect, store, or display any personally identifiable patient information.</div>
  <div class="foot"><span>TALA — Triage and Localized health Assistance</span><span>Generated by TALA Admin</span></div>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) {
      alert("Please allow pop-ups for this site to generate the PDF report.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // Bigyan ng saglit para ma-load ang font/layout bago i-print.
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="h-full overflow-auto bg-gray-50/50">
      <div className="max-w-[1400px] mx-auto px-8 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-800 font-semibold" style={{ fontSize: "1.15rem" }}>
              Community Health Analytics
            </h3>
            <p className="text-gray-400 mt-1" style={{ fontSize: "0.8rem" }}>
              Aggregated, anonymous insights — no personal patient data is collected or displayed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Export buttons */}
            <button
              onClick={downloadCsv}
              disabled={loading || stats.total === 0}
              title="Download raw sessions as CSV"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "0.85rem" }}
            >
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">CSV</span>
            </button>
            <button
              onClick={printReport}
              disabled={loading || stats.total === 0}
              title="Generate a printable PDF report"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontSize: "0.85rem" }}
            >
              <Printer className="w-4 h-4" />
              <span>PDF Report</span>
            </button>

            {/* Time range selector */}
            <div className="relative">
              <button
                onClick={() => setRangeOpen(!rangeOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer"
              style={{ fontSize: "0.85rem" }}
            >
              <CalendarDays className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{range}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {rangeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRangeOpen(false)} />
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[160px]">
                  {timeRange.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setRange(t); setRangeOpen(false); }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer ${t === range ? "text-emerald-600 font-medium" : "text-gray-600"}`}
                      style={{ fontSize: "0.82rem" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Privacy banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <p className="text-emerald-700" style={{ fontSize: "0.78rem" }}>
            <strong>Privacy Notice:</strong> All data shown is aggregated at the community level. TALA does not collect, store, or display any personally identifiable patient information.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
            <p className="text-gray-500" style={{ fontSize: "0.875rem" }}>Loading analytics…</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
            <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
            <p className="text-gray-600" style={{ fontSize: "0.9rem" }}>Failed to load analytics data.</p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "0.78rem" }}>Check your connection and try again.</p>
          </div>
        ) : stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="bg-gray-50 p-4 rounded-full mb-4"><BarChart3 className="w-8 h-8 text-gray-400" /></div>
            <p className="text-gray-600 font-medium" style={{ fontSize: "0.95rem" }}>Wala pang triage data</p>
            <p className="text-gray-400 mt-1 text-center max-w-[340px]" style={{ fontSize: "0.8rem" }}>
              Lalabas dito ang mga insight kapag may nakumpletong triage sessions na ang mga residente sa napiling panahon.
            </p>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Total Assessments", value: stats.total.toLocaleString(), icon: Activity, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
                { label: "Completed", value: stats.completed.toLocaleString(), icon: ClipboardCheck, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                { label: "Completion Rate", value: `${stats.completionRate}%`, icon: BarChart3, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
                { label: "Red Flags Triggered", value: stats.redFlagTriggers.toString(), icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
                { label: "Abandoned", value: stats.abandoned.toString(), icon: TrendingDown, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className={`p-2.5 rounded-xl w-fit mb-3 ${card.iconBg}`}>
                      <Icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
                    </div>
                    <p className="text-gray-800 font-bold" style={{ fontSize: "1.4rem" }}>{card.value}</p>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.75rem" }}>{card.label}</p>
                  </div>
                );
              })}
            </div>

            {/* ── Row: Outcomes (Pie) + Outcomes over time (Bar) ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Triage Results Distribution</h4>
                <p className="text-gray-400 mb-4" style={{ fontSize: "0.72rem" }}>Breakdown of all assessment outcomes</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.triageOutcomes} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name" stroke="none">
                        {stats.triageOutcomes.map((entry, index) => (
                          <Cell key={`analytics-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.8rem" }}
                        formatter={(value: number, name: string) => [`${value} (${stats.total > 0 ? Math.round((value / stats.total) * 100) : 0}%)`, name]}
                      />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(value: string) => <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {stats.triageOutcomes.map((o) => (
                    <div key={o.name} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: `${o.color}10` }}>
                      <p className="font-bold" style={{ fontSize: "1rem", color: o.color }}>{o.value}</p>
                      <p className="text-gray-500 mt-0.5" style={{ fontSize: "0.62rem" }}>{o.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Outcomes Over Time</h4>
                <p className="text-gray-400 mb-4" style={{ fontSize: "0.72rem" }}>Monthly triage results trend</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.outcomeByMonth} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.8rem" }} />
                      <Bar dataKey="nonUrgent" stackId="a" fill="#10b981" name="Non-Urgent" />
                      <Bar dataKey="semiUrgent" stackId="a" fill="#eab308" name="Semi-Urgent" />
                      <Bar dataKey="urgent" stackId="a" fill="#f97316" name="Urgent" />
                      <Bar dataKey="emergency" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Emergency" />
                      <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{v}</span>} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── Row: Top Symptoms + Daily/Age ── */}
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-gray-700 font-semibold" style={{ fontSize: "0.9rem" }}>Most Common Symptom Categories</h4>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.72rem" }}>Ranked by frequency across all assessments</p>
                  </div>
                  <span className="text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg" style={{ fontSize: "0.7rem" }}>{stats.topSymptoms.length} categories</span>
                </div>
                {stats.topSymptoms.length === 0 ? (
                  <p className="text-gray-400 text-center py-8" style={{ fontSize: "0.82rem" }}>No symptom data yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {stats.topSymptoms.map((s, i) => {
                      const barColor = i === 0 ? "bg-red-400" : i === 1 ? "bg-orange-400" : i === 2 ? "bg-amber-400" : "bg-emerald-400";
                      return (
                        <div key={s.symptom} className="flex items-center gap-3">
                          <span className="w-6 text-right text-gray-400 font-semibold shrink-0" style={{ fontSize: "0.72rem" }}>#{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-700" style={{ fontSize: "0.82rem" }}>{s.symptom}</span>
                              <span className="text-gray-500 font-medium" style={{ fontSize: "0.75rem" }}>{s.count} <span className="text-gray-400 font-normal">({s.pct}%)</span></span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Daily Assessment Volume</h4>
                  <p className="text-gray-400 mb-3" style={{ fontSize: "0.72rem" }}>Assessments per day of week</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.dailyVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.78rem" }} />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Assessments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Age Group Distribution</h4>
                  <p className="text-gray-400 mb-3" style={{ fontSize: "0.72rem" }}>Assessments by age group</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.ageDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="group" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.78rem" }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Assessments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row: Weekly Trend + Completion Rate ── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Weekly Assessment Trend</h4>
                <p className="text-gray-400 mb-4" style={{ fontSize: "0.72rem" }}>Total vs completed assessments (last 4 weeks)</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.weeklyTrend}>
                      <defs>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.8rem" }} />
                      <Area type="monotone" dataKey="assessments" stroke="#10b981" strokeWidth={2} fill="url(#gradTotal)" name="Total" />
                      <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fill="url(#gradCompleted)" name="Completed" />
                      <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{v}</span>} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Completion Rate</h4>
                <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>Assessments finished vs started</p>
                <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${stats.completionRate * 3.14} ${314 - stats.completionRate * 3.14}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-gray-800 font-bold" style={{ fontSize: "1.6rem" }}>{stats.completionRate}%</span>
                      <span className="text-gray-400" style={{ fontSize: "0.68rem" }}>completed</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>Completed</span>
                    </div>
                    <span className="text-gray-800 font-semibold" style={{ fontSize: "0.78rem" }}>{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>Abandoned</span>
                    </div>
                    <span className="text-gray-800 font-semibold" style={{ fontSize: "0.78rem" }}>{stats.abandoned}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer disclaimer */}
            <div className="bg-gray-100 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-gray-500 leading-relaxed" style={{ fontSize: "0.75rem" }}>
                Data reflects aggregated community-level patterns only. Individual assessment details are not stored or retrievable. Note: assessments completed while fully offline may not be captured, so totals can slightly undercount.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
