import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Phone, MapPin, Building2, Loader2 } from "lucide-react";
import { supabase } from "@/app/utils/supabase/client";
import { toast } from "sonner";

interface Contact {
  id: string; 
  name: string;
  role: string;
  facility: string;
  phone: string;
  location: string;
  status: "Active" | "Inactive";
  type: "Hospital" | "Health Center" | "Emergency" | "Government";
}

const types = ["Hospital", "Health Center", "Emergency", "Government"];

type ContactForm = Omit<Contact, "id">;

const emptyForm: ContactForm = { name: "", role: "", facility: "", phone: "", location: "", status: "Active", type: "Health Center" };

const typeColors: Record<string, { bg: string; text: string }> = {
  Hospital: { bg: "bg-blue-50", text: "text-blue-700" },
  "Health Center": { bg: "bg-emerald-50", text: "text-emerald-700" },
  Emergency: { bg: "bg-red-50", text: "text-red-700" },
  Government: { bg: "bg-purple-50", text: "text-purple-700" },
};

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Kukunin ang totoong data sa Supabase pagkabukas ng page
  useEffect(() => {
    fetchContacts();  
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('name', { ascending: true });
      
    if (!error && data) {
      setContacts(data as Contact[]);
    } else if (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load contacts. Check your connection.");
    }
    setLoading(false);
  };

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.facility.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || c.type === filterType;
    return matchSearch && matchType;
  });

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };

  const openEdit = (contact: Contact) => {
    setForm({ name: contact.name, role: contact.role, facility: contact.facility, phone: contact.phone, location: contact.location, status: contact.status, type: contact.type });
    setEditingId(contact.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone number are required.");
      return;
    }
    setSaving(true);

    const { error } = editingId
      ? await supabase.from('emergency_contacts').update(form).eq('id', editingId)
      : await supabase.from('emergency_contacts').insert([form]);

    if (error) {
      console.error("Error saving contact:", error);
      toast.error(`Failed to save contact: ${error.message}`);
    } else {
      await fetchContacts();
      setShowModal(false);
      toast.success(editingId ? "Contact updated." : "Contact added.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    if (error) {
      console.error("Error deleting contact:", error);
      toast.error(`Failed to delete contact: ${error.message}`);
    } else {
      await fetchContacts();
      toast.success("Contact deleted.");
    }
    setDeleteConfirm(null);
  };

  const activeCount = contacts.filter((c) => c.status === "Active").length;

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gray-50/50">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Total Contacts", value: contacts.length, icon: Phone, bg: "bg-emerald-100", iconColor: "text-emerald-600" },
          { label: "Active", value: activeCount, icon: Building2, bg: "bg-blue-100", iconColor: "text-blue-600" },
          { label: "Emergency Lines", value: contacts.filter(c => c.type === "Emergency").length, icon: Phone, bg: "bg-red-100", iconColor: "text-red-600" },
          { label: "Health Facilities", value: contacts.filter(c => c.type === "Hospital" || c.type === "Health Center").length, icon: MapPin, bg: "bg-amber-100", iconColor: "text-amber-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`${s.bg} p-3 rounded-xl`}><Icon className={`w-5 h-5 ${s.iconColor}`} /></div>
                <div>
                  <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>{s.label}</p>
                  <p className="text-gray-900" style={{ fontSize: "1.5rem" }}>{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" style={{ fontSize: "0.875rem" }} />
          </div>
          <select id="contacts-filter-type" title="Filter Type" value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer" style={{ fontSize: "0.875rem" }}>
            <option value="All">All Types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer" style={{ fontSize: "0.875rem" }}>
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {["NAME", "TYPE", "PHONE", "LOCATION", "STATUS", "ACTIONS"].map((h, i) => (
                <th key={h} className={`${i === 5 ? "text-right" : "text-left"} px-6 py-4 text-gray-500`} style={{ fontSize: "0.75rem", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center gap-2 text-emerald-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span style={{ fontSize: "0.875rem" }}>Loading contacts...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400" style={{ fontSize: "0.875rem" }}>No contacts found</td></tr>
            ) : (
              filtered.map((contact) => {
                const tc = typeColors[contact.type] || typeColors["Health Center"];
                return (
                  <tr key={contact.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-gray-800 block" style={{ fontSize: "0.875rem" }}>{contact.name}</span>
                        <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>{contact.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-lg ${tc.bg} ${tc.text}`} style={{ fontSize: "0.75rem" }}>{contact.type}</span></td>
                    <td className="px-6 py-4 text-gray-600" style={{ fontSize: "0.85rem" }}>{contact.phone}</td>
                    <td className="px-6 py-4 text-gray-500" style={{ fontSize: "0.8rem" }}>{contact.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg ${contact.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`} style={{ fontSize: "0.75rem" }}>{contact.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" title="Edit Contact" onClick={() => openEdit(contact)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        {deleteConfirm === contact.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(contact.id)} className="px-2 py-1 bg-red-500 text-white rounded-lg cursor-pointer" style={{ fontSize: "0.7rem" }}>Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer" style={{ fontSize: "0.7rem" }}>Cancel</button>
                          </div>
                        ) : (
                          <button type="button" title="Delete Contact" onClick={() => setDeleteConfirm(contact.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-800">{editingId ? "Edit Contact" : "Add New Contact"}</h3>
              <button type="button" title="Close Modal" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contact or facility name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Primary Care" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Facility</label>
                <input type="text" value={form.facility} onChange={(e) => setForm({ ...form, facility: e.target.value })} placeholder="Facility name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
              </div>
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Address or area" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Type</label>
                  <select id="contacts-type" title="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Contact["type"] })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer" style={{ fontSize: "0.875rem" }}>
                    {types.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Status</label>
                  <select id="contacts-status" title="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer" style={{ fontSize: "0.875rem" }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer" style={{ fontSize: "0.875rem" }}>Cancel</button>
              <button disabled={saving} onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60" style={{ fontSize: "0.875rem" }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}