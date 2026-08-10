import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Phone,
  Bell,
  Activity,
  BarChart3,
  Settings,
  Heart,
} from "lucide-react";
import icon from "@/assets/icons/Star-green.svg";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "contacts", label: "Emergency Contacts", icon: Phone },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "triage", label: "Triage Protocol", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-11 h-11 overflow-hidden">
          <img src= {icon} alt="" />
        </div>
        <div>
          <h1 className="text-emerald-700" style={{ fontSize: "1.125rem" }}>TALA</h1>
          <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>Health Decision Support</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span style={{ fontSize: "0.875rem" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 mx-3 mb-4 bg-emerald-50 rounded-xl">
        <p className="text-emerald-800" style={{ fontSize: "0.8rem" }}>Offline Mode Ready</p>
        <p className="text-emerald-600 mt-1" style={{ fontSize: "0.7rem" }}>
          All data synced locally
        </p>
        <div className="mt-2 h-1.5 bg-emerald-200 rounded-full">
          <div className="h-full w-full bg-emerald-500 rounded-full" />
        </div>
      </div>
    </aside>
  );
}