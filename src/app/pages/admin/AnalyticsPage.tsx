import { useState } from "react";
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  ClipboardCheck,
  AlertCircle,
  AlertTriangle,
  Home,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  BarChart3,
  Users,
  CalendarDays,
  Info,
  ChevronDown,
} from "lucide-react";

// ── Aggregated mock data ──

const triageOutcomes = [
  { name: "Emergency", value: 47, color: "#ef4444" },
  { name: "Urgent", value: 128, color: "#f97316" },
  { name: "Semi-Urgent", value: 214, color: "#eab308" },
  { name: "Home Care", value: 389, color: "#10b981" },
];

const totalAssessments = 778;
const completedAssessments = 712;
const abandonedAssessments = 66;
const avgTimeSeconds = 142;
const redFlagTriggers = 23;

const weeklyTrend = [
  { week: "Week 1", assessments: 168, completed: 155 },
  { week: "Week 2", assessments: 192, completed: 178 },
  { week: "Week 3", assessments: 201, completed: 184 },
  { week: "Week 4", assessments: 217, completed: 195 },
];

const dailyVolume = [
  { day: "Mon", count: 42 },
  { day: "Tue", count: 38 },
  { day: "Wed", count: 55 },
  { day: "Thu", count: 47 },
  { day: "Fri", count: 31 },
  { day: "Sat", count: 18 },
  { day: "Sun", count: 12 },
];

const topSymptoms = [
  { symptom: "Fever / High Temperature", count: 218, pct: 28 },
  { symptom: "Cough & Respiratory", count: 164, pct: 21 },
  { symptom: "Diarrhea & Dehydration", count: 127, pct: 16 },
  { symptom: "Skin Rash / Irritation", count: 89, pct: 11 },
  { symptom: "Headache & Body Pain", count: 72, pct: 9 },
  { symptom: "Wound / Injury", count: 54, pct: 7 },
  { symptom: "Eye / Ear Infection", count: 31, pct: 4 },
  { symptom: "Maternal Complaint", count: 23, pct: 3 },
];

const ageDistribution = [
  { group: "0–4", count: 186 },
  { group: "5–12", count: 124 },
  { group: "13–17", count: 67 },
  { group: "18–39", count: 198 },
  { group: "40–59", count: 132 },
  { group: "60+", count: 71 },
];

const outcomeByMonth = [
  { month: "Oct", emergency: 8, urgent: 24, semiUrgent: 41, homeCare: 78 },
  { month: "Nov", emergency: 11, urgent: 30, semiUrgent: 49, homeCare: 88 },
  { month: "Dec", emergency: 14, urgent: 36, semiUrgent: 58, homeCare: 97 },
  { month: "Jan", emergency: 9, urgent: 28, semiUrgent: 52, homeCare: 92 },
  { month: "Feb", emergency: 12, urgent: 32, semiUrgent: 61, homeCare: 101 },
  { month: "Mar", emergency: 5, urgent: 22, semiUrgent: 48, homeCare: 86 },
];

const timeRange = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];

// ── Component ──

export function AnalyticsPage() {
  const [range, setRange] = useState("Last 30 Days");
  const [rangeOpen, setRangeOpen] = useState(false);

  const completionRate = Math.round((completedAssessments / totalAssessments) * 100);
  const avgMinutes = Math.floor(avgTimeSeconds / 60);
  const avgSecs = avgTimeSeconds % 60;

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

        {/* Privacy banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <p className="text-emerald-700" style={{ fontSize: "0.78rem" }}>
            <strong>Privacy Notice:</strong> All data shown is aggregated at the community level. TALA does not collect, store, or display any personally identifiable patient information.
          </p>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total Assessments", value: totalAssessments.toLocaleString(), icon: Activity, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", trend: "+12%", trendUp: true },
            { label: "Completed", value: completedAssessments.toLocaleString(), icon: ClipboardCheck, iconBg: "bg-blue-100", iconColor: "text-blue-600", trend: `${completionRate}% rate`, trendUp: true },
            { label: "Avg. Time", value: `${avgMinutes}m ${avgSecs}s`, icon: Clock, iconBg: "bg-violet-100", iconColor: "text-violet-600", trend: "-8s", trendUp: true },
            { label: "Red Flags Triggered", value: redFlagTriggers.toString(), icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-600", trend: "-4", trendUp: true },
            { label: "Abandoned", value: abandonedAssessments.toString(), icon: TrendingDown, iconBg: "bg-amber-100", iconColor: "text-amber-600", trend: `${Math.round((abandonedAssessments / totalAssessments) * 100)}%`, trendUp: false },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                    <Icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${card.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`} style={{ fontSize: "0.68rem", fontWeight: 500 }}>
                    {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {card.trend}
                  </span>
                </div>
                <p className="text-gray-800 font-bold" style={{ fontSize: "1.4rem" }}>{card.value}</p>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.75rem" }}>{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* ── Row: Triage Outcomes (Pie) + Triage Outcomes (Bar) ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pie chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Triage Results Distribution</h4>
            <p className="text-gray-400 mb-4" style={{ fontSize: "0.72rem" }}>Breakdown of all assessment outcomes</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={triageOutcomes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {triageOutcomes.map((entry, index) => (
                      <Cell key={`analytics-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.8rem" }}
                    formatter={(value: number, name: string) => [`${value} (${Math.round((value / totalAssessments) * 100)}%)`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Summary cards under pie */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {triageOutcomes.map((o) => (
                <div key={o.name} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: `${o.color}10` }}>
                  <p className="font-bold" style={{ fontSize: "1rem", color: o.color }}>{o.value}</p>
                  <p className="text-gray-500 mt-0.5" style={{ fontSize: "0.62rem" }}>{o.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Outcomes over time stacked bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Outcomes Over Time</h4>
            <p className="text-gray-400 mb-4" style={{ fontSize: "0.72rem" }}>Monthly triage results trend</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outcomeByMonth} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.8rem" }} />
                  <Bar dataKey="homeCare" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Home Care" />
                  <Bar dataKey="semiUrgent" stackId="a" fill="#eab308" name="Semi-Urgent" />
                  <Bar dataKey="urgent" stackId="a" fill="#f97316" name="Urgent" />
                  <Bar dataKey="emergency" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Emergency" />
                  <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{v}</span>} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row: Top Symptoms + Assessment Volume ── */}
        <div className="grid grid-cols-5 gap-4">
          {/* Top symptoms — 3 cols */}
          <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-gray-700 font-semibold" style={{ fontSize: "0.9rem" }}>Most Common Symptoms</h4>
                <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.72rem" }}>Ranked by frequency across all assessments</p>
              </div>
              <span className="text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg" style={{ fontSize: "0.7rem" }}>{topSymptoms.length} symptoms</span>
            </div>
            <div className="space-y-2.5">
              {topSymptoms.map((s, i) => {
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
          </div>

          {/* Daily volume + Age distribution — 2 cols */}
          <div className="col-span-2 space-y-4">
            {/* Daily volume */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Daily Assessment Volume</h4>
              <p className="text-gray-400 mb-3" style={{ fontSize: "0.72rem" }}>Average assessments per day of week</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "0.78rem" }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Assessments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Age distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Age Group Distribution</h4>
              <p className="text-gray-400 mb-3" style={{ fontSize: "0.72rem" }}>Assessments by patient age bracket</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="group" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={35} />
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
          {/* Weekly trend area chart */}
          <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Weekly Assessment Trend</h4>
            <p className="text-gray-400 mb-4" style={{ fontSize: "0.72rem" }}>Total vs completed assessments by week</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
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

          {/* Completion rate card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <h4 className="text-gray-700 font-semibold mb-1" style={{ fontSize: "0.9rem" }}>Completion Rate</h4>
            <p className="text-gray-400" style={{ fontSize: "0.72rem" }}>Assessments finished vs started</p>

            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${completionRate * 3.14} ${314 - completionRate * 3.14}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-gray-800 font-bold" style={{ fontSize: "1.6rem" }}>{completionRate}%</span>
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
                <span className="text-gray-800 font-semibold" style={{ fontSize: "0.78rem" }}>{completedAssessments}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-gray-600" style={{ fontSize: "0.78rem" }}>Abandoned</span>
                </div>
                <span className="text-gray-800 font-semibold" style={{ fontSize: "0.78rem" }}>{abandonedAssessments}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="bg-gray-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-gray-500 leading-relaxed" style={{ fontSize: "0.75rem" }}>
            Data reflects aggregated community-level patterns only. Individual assessment details are not stored or retrievable. All statistics are generated from anonymous interaction logs to help administrators improve triage protocols and resource allocation.
          </p>
        </div>
      </div>
    </div>
  );
}