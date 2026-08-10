import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase/client";
import { FileText, Phone, Bell, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-600" },
  blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-600" },
  amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", text: "text-amber-600" },
  red: { bg: "bg-red-50", iconBg: "bg-red-100", text: "text-red-600" },
};

const URGENCY_COLORS: Record<string, string> = {
  "Non-Urgent": "#10b981",
  "Semi-Urgent": "#f59e0b",
  Urgent: "#f97316",
  Emergency: "#ef4444",
};
const URGENCY_ORDER = ["Non-Urgent", "Semi-Urgent", "Urgent", "Emergency"];

interface ActivityItem { action: string; detail: string; time: string; icon: typeof FileText; ts: number; }

function timeAgo(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

export function DashboardPage() {
  const [stats, setStats] = useState({ articles: 0, contacts: 0, alerts: 0, isLoading: true });
  const [triageData, setTriageData] = useState(() =>
    URGENCY_ORDER.map((u) => ({ name: u, value: 0, color: URGENCY_COLORS[u] })),
  );
  const [symptomData, setSymptomData] = useState<{ name: string; count: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [articlesRes, contactsRes, alertsRes, sessionsRes, recentArticlesRes, recentAlertsRes] =
          await Promise.all([
            supabase.from("health_articles").select("*", { count: "exact", head: true }),
            supabase.from("emergency_contacts").select("*", { count: "exact", head: true }),
            supabase.from("health_alerts").select("*", { count: "exact", head: true }).eq("status", "Active"),
            supabase.from("triage_sessions").select("urgency_result, flagged_clusters"),
            supabase.from("health_articles").select("title, created_at").order("created_at", { ascending: false }).limit(3),
            supabase.from("health_alerts").select("title, created_at").order("created_at", { ascending: false }).limit(3),
          ]);

        setStats({
          articles: articlesRes.count || 0,
          contacts: contactsRes.count || 0,
          alerts: alertsRes.count || 0,
          isLoading: false,
        });

        // ── Triage outcomes + top symptom categories (galing sa totoong sessions) ──
        const sessions = (sessionsRes.data ?? []) as { urgency_result: string | null; flagged_clusters: string[] | null }[];
        const counts: Record<string, number> = { "Non-Urgent": 0, "Semi-Urgent": 0, Urgent: 0, Emergency: 0 };
        const symptomMap: Record<string, number> = {};
        sessions.forEach((s) => {
          if (s.urgency_result && s.urgency_result in counts) counts[s.urgency_result]++;
          (s.flagged_clusters ?? []).forEach((c) => { symptomMap[c] = (symptomMap[c] ?? 0) + 1; });
        });
        setTriageData(URGENCY_ORDER.map((u) => ({ name: u, value: counts[u], color: URGENCY_COLORS[u] })));
        setSymptomData(
          Object.entries(symptomMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count })),
        );

        // ── Recent activity (totoong pinakabagong articles + alerts) ──
        const recentArticles = (recentArticlesRes.data ?? []) as { title: string; created_at: string }[];
        const recentAlerts = (recentAlertsRes.data ?? []) as { title: string; created_at: string }[];
        const acts: ActivityItem[] = [
          ...recentArticles.map((a) => ({ action: "Article published", detail: a.title, time: timeAgo(a.created_at), icon: FileText, ts: new Date(a.created_at).getTime() })),
          ...recentAlerts.map((a) => ({ action: "Alert posted", detail: a.title, time: timeAgo(a.created_at), icon: Bell, ts: new Date(a.created_at).getTime() })),
        ];
        acts.sort((a, b) => b.ts - a.ts);
        setRecentActivity(acts.slice(0, 4));
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchAll();
  }, []);

  const dynamicSummaryCards = [
    { label: "Total Articles", value: stats.isLoading ? "…" : stats.articles, icon: FileText, color: "emerald", change: "Published + drafts" },
    { label: "Total Contacts", value: stats.isLoading ? "…" : stats.contacts, icon: Phone, color: "blue", change: "Directory count" },
    { label: "Active Alerts", value: stats.isLoading ? "…" : stats.alerts, icon: Bell, color: "amber", change: "Currently active" },
    { label: "Triage Status", value: "Active", icon: Activity, color: "red", change: "System online" },
  ];

  const hasTriageData = triageData.some((t) => t.value > 0);

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gray-50/50">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-5">
        {dynamicSummaryCards.map((card) => {
          const Icon = card.icon;
          const colors = colorMap[card.color];
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{card.label}</p>
                  <p className="text-gray-900 mt-1" style={{ fontSize: "1.75rem" }}>{card.value}</p>
                  <p className={`${colors.text} mt-1`} style={{ fontSize: "0.75rem" }}>{card.change}</p>
                </div>
                <div className={`${colors.iconBg} p-3 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-800 mb-4">Most Common Symptom Categories</h3>
          {symptomData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-gray-400" style={{ fontSize: "0.85rem" }}>
              Wala pang triage data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={symptomData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-800 mb-4">Triage Result Counts</h3>
          {!hasTriageData ? (
            <div className="h-[260px] flex items-center justify-center text-gray-400" style={{ fontSize: "0.85rem" }}>
              Wala pang triage data
            </div>
          ) : (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                  <Pie data={triageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" id="dashboard-pie">
                    {triageData.map((entry, index) => (
                      <Cell key={`dashboard-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {triageData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600" style={{ fontSize: "0.8rem" }}>{item.name}</span>
                    <span className="text-gray-900 ml-1" style={{ fontSize: "0.8rem" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-800 mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-400 py-6 text-center" style={{ fontSize: "0.85rem" }}>No recent activity yet.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800" style={{ fontSize: "0.875rem" }}>{item.action}</p>
                    <p className="text-gray-400" style={{ fontSize: "0.75rem" }}>{item.detail}</p>
                  </div>
                  <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>{item.time}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
