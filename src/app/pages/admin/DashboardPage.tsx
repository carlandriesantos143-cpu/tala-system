import { FileText, Phone, Bell, Activity, TrendingUp, ThermometerSun, HeartPulse, Stethoscope } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const summaryCards = [
  { label: "Total Articles", value: 24, icon: FileText, color: "emerald", change: "+3 this week" },
  { label: "Total Contacts", value: 18, icon: Phone, color: "blue", change: "+1 this week" },
  { label: "Active Alerts", value: 5, icon: Bell, color: "amber", change: "2 urgent" },
  { label: "Triage Status", value: "Active", icon: Activity, color: "red", change: "All protocols set" },
];

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-600" },
  blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-600" },
  amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", text: "text-amber-600" },
  red: { bg: "bg-red-50", iconBg: "bg-red-100", text: "text-red-600" },
};

const symptomData = [
  { name: "Fever", count: 45 },
  { name: "Cough", count: 38 },
  { name: "Headache", count: 32 },
  { name: "Diarrhea", count: 22 },
  { name: "Skin Rash", count: 15 },
  { name: "Body Pain", count: 28 },
];

const triageData = [
  { name: "Non-Urgent", value: 42, color: "#10b981" },
  { name: "Semi-Urgent", value: 28, color: "#f59e0b" },
  { name: "Urgent", value: 18, color: "#f97316" },
  { name: "Emergency", value: 8, color: "#ef4444" },
];

const recentActivity = [
  { action: "New article published", detail: "Dengue Prevention Tips", time: "2 hours ago", icon: FileText },
  { action: "Alert activated", detail: "Measles Outbreak Warning", time: "5 hours ago", icon: Bell },
  { action: "Contact updated", detail: "Rural Health Unit #3", time: "1 day ago", icon: Phone },
  { action: "Triage protocol updated", detail: "Fever Assessment v2.1", time: "2 days ago", icon: Activity },
];

export function DashboardPage() {
  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gray-50/50">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-5">
        {summaryCards.map((card) => {
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
          <h3 className="text-gray-800 mb-4">Most Common Symptoms</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={symptomData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-800 mb-4">Triage Result Counts</h3>
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
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-800 mb-4">Recent Activity</h3>
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
      </div>
    </div>
  );
}