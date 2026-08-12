import { useState } from "react";
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

// Mga bagong imports para sa Offline DB
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../services/localDB"; // I-check kung tama ang folder path
import { SyncIndicator } from "../../components/shared/SyncIndicator";

interface MobileContactsProps {
  onBack: () => void;
}

// Updated interface para tumugma sa Dexie DB natin
interface Contact {
  id: string; // naging string dahil UUID galing Supabase/Dexie
  name: string;
  role: string;
  phone: string;
  location: string;
  type: string;
}

export function MobileContacts({ onBack }: MobileContactsProps) {
  // 1. Kumuha ng contacts galing sa lokal na bodega (Dexie)
  const rawContacts = useLiveQuery(() => db.contacts.toArray(), []) || [];

  // 2. I-filter at i-format ang data
  const contacts: Contact[] = rawContacts
    .filter(
      (c) =>
        !c.status || 
        c.status.toLowerCase() === "active" || 
        c.status.toLowerCase() === "published"
    )
    .map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role || c.facility || "Contact Person", // Fallback kung walang role
      phone: c.phone,
      location: c.location || "Valenzuela City",
      type: c.type || "General",
    }));

  // 3. Awtomatikong kunin ang mga unique na contact types mula sa database
  const contactTypes = [
    "All",
    ...Array.from(new Set(contacts.map((c) => c.type))),
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const filtered = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "All" || contact.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeConfig = (type: string) => {
    const configs: Record<
      string,
      { icon: any; bg: string; text: string; border: string }
    > = {
      Emergency: {
        icon: Shield,
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      },
      Hospital: {
        icon: Building2,
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      "Health Center": {
        icon: Heart,
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      },
      Government: {
        icon: Building2,
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
      },
    };
    // Fallback styling kung may bagong type na nilagay ang admin
    return (
      configs[type] || {
        icon: Phone,
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      }
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="mx-auto flex w-full max-w-[430px] items-center gap-3 mb-3">
          <button
            type="button"
            title="Go back"
            aria-label="Go back"
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <p
            className="text-gray-800 font-semibold"
            style={{ fontSize: "0.95rem" }}
          >
            Emergency Contacts
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-auto w-full max-w-[430px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, facility, or location..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            style={{ fontSize: "0.85rem" }}
          />
          {searchQuery && (
            <button
              type="button"
              title="Clear search"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto flex-1 w-full max-w-[430px] overflow-auto px-4 py-4 space-y-4">
        {/* Last-updated + manual refresh */}
        <SyncIndicator />

        {/* Dynamic Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-4 px-4">
          {contactTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                selectedType === type
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              style={{ fontSize: "0.78rem", fontWeight: 500 }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Contacts List */}
        <div className="space-y-3">
          {filtered.map((contact) => {
            const config = getTypeConfig(contact.type);
            const TypeIcon = config.icon;

            return (
              <div
                key={contact.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="p-4 flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${config.bg} shrink-0`}>
                    <TypeIcon className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3
                      className="text-gray-900 font-bold mb-0.5 truncate group-hover:text-emerald-700 transition-colors"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {contact.name}
                    </h3>
                    <p
                      className="text-gray-500 font-medium"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {contact.role}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-300" />
                      <span
                        className="text-gray-400"
                        style={{ fontSize: "0.65rem" }}
                      >
                        {contact.location}
                      </span>
                    </div>
                  </div>
                  <a
                    // Tinatanggal natin ang anumang letters at spaces para malinis ang pag-dial
                    href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
                      contact.type === "Emergency" || contact.type === "Critical"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                    } transition-colors shadow-sm`}
                    style={{ fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                </div>
                <div
                  className={`px-4 py-2.5 ${config.bg} border-t ${config.border} flex items-center justify-between`}
                >
                  <p
                    className={`${config.text} font-medium`}
                    style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}
                  >
                    {contact.phone}
                  </p>
                  <span
                    className={`${config.text} opacity-70`}
                    style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase" }}
                  >
                    {contact.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500" style={{ fontSize: "0.85rem" }}>
              No contacts found
            </p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "0.72rem" }}>
              {searchQuery || selectedType !== "All"
                ? "Try a different search term or category"
                : "Walang pang nai-publish na contact ang BHW."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}