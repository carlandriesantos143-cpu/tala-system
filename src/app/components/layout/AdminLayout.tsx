import React, { useState } from "react";
import { Activity } from "lucide-react"; 
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardPage } from "../../pages/admin/DashboardPage";
import { ArticlesPage } from "../../pages/admin/ArticlesPage";
import { ContactsPage } from "../../pages/admin/ContactsPage";
import { AlertsPage } from "../../pages/admin/AlertsPage";
import { TriagePage } from "../../pages/admin/TriagePage";
import { AnalyticsPage } from "../../pages/admin/AnalyticsPage";
import { SettingsPage } from "../../pages/admin/SettingsPage";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  articles: "Articles Management",
  contacts: "Emergency Contacts",
  alerts: "Alerts",
  triage: "Triage Protocol",
  analytics: "Analytics",
  settings: "Settings",
};

export function AdminLayout() {
  const [activePage, setActivePage] = useState("dashboard");

  // 🚧 ADVANCEMENT BLOCKER🚧
  const pagesUnderConstruction = ["analytics"]; 

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "articles":
        return <ArticlesPage />;
      case "contacts":
        return <ContactsPage />;
      case "alerts":
        return <AlertsPage />;
      case "triage":
        return <TriagePage />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active={activePage} onNavigate={setActivePage} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitles[activePage] || "TALA Admin"} />
        
        <main className="flex-1 overflow-hidden">
          {/* Dito tinitignan kung kasali sa listahan ang pinindot na page */}
          {pagesUnderConstruction.includes(activePage) ? (
            /* 🚧 UNDER CONSTRUCTION SCREEN 🚧 */
            <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 space-y-5">
              <div className="p-5 bg-emerald-100 rounded-full animate-pulse shadow-sm">
                <Activity className="w-14 h-14 text-emerald-600" />
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-black text-gray-800 tracking-widest uppercase mb-2">Di pa tapos !!!</h1>
                <p className="text-gray-500 font-medium" style={{ fontSize: "0.9rem" }}>
                  This module is currently under construction.
                </p>
              </div>
            </div>
          ) : (
            /* 🚀 REAL SYSTEM CONTENT 🚀 */
            renderPage()
          )}
        </main>
      </div>
    </div>
  );
}