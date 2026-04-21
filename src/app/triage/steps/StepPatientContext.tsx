import { Plus, Edit2, Trash2, X, Users, Calendar } from "lucide-react";
import type { AgeGroup, UserType } from "../types";
import React, { useState } from "react";

interface Props {
  ageGroups: AgeGroup[];
  userTypes: UserType[];
  onChangeAgeGroups: (groups: AgeGroup[]) => void;
  onChangeUserTypes: (types: UserType[]) => void;
}

type ModalMode = null | { kind: "age"; editing: AgeGroup | null } | { kind: "user"; editing: UserType | null };

export function StepPatientContext({ ageGroups, userTypes, onChangeAgeGroups, onChangeUserTypes }: Props) {
  const [modal, setModal] = useState<ModalMode>(null);
  const [ageForm, setAgeForm] = useState({ label: "", rangeDesc: "" });
  const [userForm, setUserForm] = useState({ label: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{ kind: "age" | "user"; id: number } | null>(null);

  const openAddAge = () => { setAgeForm({ label: "", rangeDesc: "" }); setModal({ kind: "age", editing: null }); };
  const openEditAge = (g: AgeGroup) => { setAgeForm({ label: g.label, rangeDesc: g.rangeDesc }); setModal({ kind: "age", editing: g }); };
  const openAddUser = () => { setUserForm({ label: "", description: "" }); setModal({ kind: "user", editing: null }); };
  const openEditUser = (u: UserType) => { setUserForm({ label: u.label, description: u.description }); setModal({ kind: "user", editing: u }); };

  const saveAge = () => {
    if (!ageForm.label.trim()) return;
    if (modal?.kind === "age" && modal.editing) {
      onChangeAgeGroups(ageGroups.map((g) => g.id === modal.editing!.id ? { ...g, ...ageForm } : g));
    } else {
      onChangeAgeGroups([...ageGroups, { id: Date.now(), ...ageForm, enabled: true }]);
    }
    setModal(null);
  };

  const saveUser = () => {
    if (!userForm.label.trim()) return;
    if (modal?.kind === "user" && modal.editing) {
      onChangeUserTypes(userTypes.map((u) => u.id === modal.editing!.id ? { ...u, ...userForm } : u));
    } else {
      onChangeUserTypes([...userTypes, { id: Date.now(), ...userForm, enabled: true }]);
    }
    setModal(null);
  };

  const deleteAge = (id: number) => { onChangeAgeGroups(ageGroups.filter((g) => g.id !== id)); setDeleteConfirm(null); };
  const deleteUser = (id: number) => { onChangeUserTypes(userTypes.filter((u) => u.id !== id)); setDeleteConfirm(null); };

  const toggleAge = (id: number) => onChangeAgeGroups(ageGroups.map((g) => g.id === id ? { ...g, enabled: !g.enabled } : g));
  const toggleUser = (id: number) => onChangeUserTypes(userTypes.map((u) => u.id === id ? { ...u, enabled: !u.enabled } : u));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-gray-800 font-semibold" style={{ fontSize: "1.05rem" }}>Patient Context</h3>
        <p className="text-gray-400 mt-1" style={{ fontSize: "0.8rem" }}>
          Define the age groups and user types available during triage. These determine which protocols and questions are shown.
        </p>
      </div>

      {/* Age Groups */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4.5 h-4.5 text-emerald-600" />
            <span className="text-gray-700 font-medium" style={{ fontSize: "0.9rem" }}>Age Groups</span>
            <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md" style={{ fontSize: "0.7rem" }}>{ageGroups.length}</span>
          </div>
          <button onClick={openAddAge} className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer" style={{ fontSize: "0.8rem" }}>
            <Plus className="w-3.5 h-3.5" /> Add Group
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {ageGroups.map((g) => (
            <div key={g.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleAge(g.id)}
                aria-label={g.enabled ? `Disable ${g.label}` : `Enable ${g.label}`}
                title={g.enabled ? `Disable ${g.label}` : `Enable ${g.label}`}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${g.enabled ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${g.enabled ? "left-4.5" : "left-0.5"}`}
                />
              </button>
                <div>
                  <span className={`block font-medium ${g.enabled ? "text-gray-800" : "text-gray-400"}`} style={{ fontSize: "0.85rem" }}>{g.label}</span>
                  <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>{g.rangeDesc}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditAge(g)}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  aria-label={`Edit age group ${g.label}`}
                  title={`Edit age group ${g.label}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {deleteConfirm?.kind === "age" && deleteConfirm.id === g.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => deleteAge(g.id)} className="px-2 py-1 bg-red-500 text-white rounded-lg cursor-pointer" style={{ fontSize: "0.65rem" }}>Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer" style={{ fontSize: "0.65rem" }}>Cancel</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ kind: "age", id: g.id })}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    aria-label={`Delete age group ${g.label}`}
                    title={`Delete age group ${g.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {ageGroups.length === 0 && <div className="px-5 py-8 text-center text-gray-400" style={{ fontSize: "0.85rem" }}>No age groups defined</div>}
        </div>
      </div>

      {/* User Types */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Users className="w-4.5 h-4.5 text-emerald-600" />
            <span className="text-gray-700 font-medium" style={{ fontSize: "0.9rem" }}>User Types</span>
            <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md" style={{ fontSize: "0.7rem" }}>{userTypes.length}</span>
          </div>
          <button onClick={openAddUser} className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer" style={{ fontSize: "0.8rem" }}>
            <Plus className="w-3.5 h-3.5" /> Add Type
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {userTypes.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <button
                type="button"
                onClick={() => toggleUser(u.id)}
                aria-label={u.enabled ? `Disable ${u.label}` : `Enable ${u.label}`}
                title={u.enabled ? `Disable ${u.label}` : `Enable ${u.label}`}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${u.enabled ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${u.enabled ? "left-4.5" : "left-0.5"}`} />
                </button>
                <div>
                  <span className={`block font-medium ${u.enabled ? "text-gray-800" : "text-gray-400"}`} style={{ fontSize: "0.85rem" }}>{u.label}</span>
                  <span className="text-gray-400" style={{ fontSize: "0.75rem" }}>{u.description}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditUser(u)}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  aria-label={`Edit user type ${u.label}`}
                  title={`Edit user type ${u.label}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {deleteConfirm?.kind === "user" && deleteConfirm.id === u.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => deleteUser(u.id)} className="px-2 py-1 bg-red-500 text-white rounded-lg cursor-pointer" style={{ fontSize: "0.65rem" }}>Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer" style={{ fontSize: "0.65rem" }}>Cancel</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm({ kind: "user", id: u.id })}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    aria-label={`Delete user type ${u.label}`}
                    title={`Delete user type ${u.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {userTypes.length === 0 && <div className="px-5 py-8 text-center text-gray-400" style={{ fontSize: "0.85rem" }}>No user types defined</div>}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-gray-800 font-semibold" style={{ fontSize: "0.95rem" }}>
                {modal.kind === "age"
                  ? modal.editing ? "Edit Age Group" : "Add Age Group"
                  : modal.editing ? "Edit User Type" : "Add User Type"
                }
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Close modal"
                title="Close modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {modal.kind === "age" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Group Name</label>
                  <input type="text" value={ageForm.label} onChange={(e) => setAgeForm({ ...ageForm, label: e.target.value })} placeholder="e.g. Infant" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Age Range Description</label>
                  <input type="text" value={ageForm.rangeDesc} onChange={(e) => setAgeForm({ ...ageForm, rangeDesc: e.target.value })} placeholder="e.g. 1 – 11 months" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>User Type Name</label>
                  <input type="text" value={userForm.label} onChange={(e) => setUserForm({ ...userForm, label: e.target.value })} placeholder="e.g. Barangay Health Worker" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Description</label>
                  <input type="text" value={userForm.description} onChange={(e) => setUserForm({ ...userForm, description: e.target.value })} placeholder="Brief description of this user type" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" style={{ fontSize: "0.875rem" }} />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModal(null)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer" style={{ fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={modal.kind === "age" ? saveAge : saveUser} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer" style={{ fontSize: "0.85rem" }}>
                {modal.editing ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
