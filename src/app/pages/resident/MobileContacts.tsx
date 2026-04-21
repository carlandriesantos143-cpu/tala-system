import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Phone,
  MapPin,
  Building2,
  X,
  Shield,
  Heart,
  ChevronRight,
} from "lucide-react";

interface MobileContactsProps {
  onBack: () => void;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  phone: string;
  location: string;
  type: "Hospital" | "Health Center" | "Emergency" | "Government";
}

const contacts: Contact[] = [
  { id: 1, name: "Rural Health Unit #1", role: "Primary Care", phone: "(02) 8123-4567", location: "Barangay San Jose", type: "Health Center" },
  { id: 2, name: "Dr. Maria Santos", role: "Municipal Health Officer", phone: "(02) 8234-5678", location: "Municipal Hall", type: "Government" },
  { id: 3, name: "Provincial Hospital", role: "Emergency Services", phone: "(02) 8345-6789", location: "Provincial Capitol", type: "Hospital" },
  { id: 4, name: "PNP Emergency", role: "Police Emergency", phone: "117", location: "Nationwide", type: "Emergency" },
  { id: 5, name: "BFP Fire Rescue", role: "Fire Emergency", phone: "(02) 8426-0219", location: "Municipal Fire Station", type: "Emergency" },
  { id: 6, name: "Red Cross", role: "Disaster Response", phone: "143", location: "City Proper", type: "Emergency" },
  { id: 7, name: "DOH Hotline", role: "Health Information", phone: "(02) 8651-7800", location: "Nationwide", type: "Government" },
];

const typeConfig: Record<string, { bg: string; text: string; icon: typeof Phone; iconBg: string }> = {
  Hospital: { bg: "bg-blue-50", text: "text-blue-700", icon: Building2, iconBg: "bg-blue-100" },
  "Health Center": { bg: "bg-emerald-50", text: "text-emerald-700", icon: Heart, iconBg: "bg-emerald-100" },
  Emergency: { bg: "bg-red-50", text: "text-red-700", icon: Shield, iconBg: "bg-red-100" },
  Government: { bg: "bg-violet-50", text: "text-violet-700", icon: Building2, iconBg: "bg-violet-100" },
};

const filterTabs = ["All", "Emergency", "Hospital", "Health Center", "Government"];

export function MobileContacts({ onBack }: MobileContactsProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.type === filter;
    return matchSearch && matchFilter;
  });

  // Show emergency contacts first
  const sorted = [...filtered].sort((a, b) => {
    if (a.type === "Emergency" && b.type !== "Emergency") return -1;
    if (b.type === "Emergency" && a.type !== "Emergency") return 1;
    return 0;
  });

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button type="button" aria-label="Go back" onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <p className="text-gray-800 font-semibold" style={{ fontSize: "0.95rem" }}>Emergency Contacts</p>
          <p className="text-gray-400" style={{ fontSize: "0.68rem" }}>{filtered.length} contacts</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            style={{ fontSize: "0.85rem" }}
          />
          {search && (
            <button
              type="button"
              title="Clear search"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                filter === tab ? "bg-emerald-600 text-white" : "bg-white text-gray-500 border border-gray-200"
              }`}
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contacts list */}
        <div className="space-y-2.5">
          {sorted.map((contact) => {
            const config = typeConfig[contact.type] || typeConfig.Government;
            const TypeIcon = config.icon;
            return (
              <div
                key={contact.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 flex items-center gap-3">
                  <div className={`${config.iconBg} p-2.5 rounded-xl shrink-0`}>
                    <TypeIcon className={`w-4 h-4 ${config.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium" style={{ fontSize: "0.88rem" }}>
                      {contact.name}
                    </p>
                    <p className="text-gray-400" style={{ fontSize: "0.7rem" }}>
                      {contact.role}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-300" />
                      <span className="text-gray-400" style={{ fontSize: "0.65rem" }}>
                        {contact.location}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
                      contact.type === "Emergency"
                        ? "bg-red-500 text-white"
                        : "bg-emerald-500 text-white"
                    } transition-colors`}
                    style={{ fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                </div>
                <div className={`px-4 py-2 ${config.bg} border-t ${config.text}`}>
                  <p style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                    📞 {contact.phone}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500" style={{ fontSize: "0.85rem" }}>No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
