const SECTION_VISIBLE = {
  dashboard: true,
  articles: true,
  emergencyContacts: true,
  alerts: true,
  triage: false,
  analytics: false,
  settings: false,
};


import React, { useState } from "react";
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
      {/* <Sidebar active={activePage} onNavigate={setActivePage} /> */}
      <Sidebar
          active={activePage}
          onNavigate={(page) => {
            if (!SECTION_VISIBLE[page as keyof typeof SECTION_VISIBLE]) return;
            setActivePage(page);
          }}
        />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitles[activePage] || "TALA Admin"} />
        <main className="flex-1 overflow-hidden">{renderPage()}</main>
      </div>
    </div>
  );
}
