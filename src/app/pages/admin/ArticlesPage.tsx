import React, { useState } from "react";
import { Plus, Search, Edit2, Trash2, X, FileText } from "lucide-react";

interface Article {
  id: number;
  title: string;
  category: string;
  status: "Published" | "Draft";
  date: string;
  content: string;
}

type ArticleForm = Pick<Article, "title" | "content" | "category" | "status">;

const initialArticles: Article[] = [
  { id: 1, title: "Dengue Prevention Tips", category: "Prevention", status: "Published", date: "2026-04-15", content: "Tips on preventing dengue fever in your community..." },
  { id: 2, title: "First Aid for Burns", category: "First Aid", status: "Published", date: "2026-04-14", content: "Steps to treat minor burns at home..." },
  { id: 3, title: "Nutrition for Children", category: "Nutrition", status: "Draft", date: "2026-04-12", content: "Essential nutrients for growing children..." },
  { id: 4, title: "Measles Vaccination Guide", category: "Vaccination", status: "Published", date: "2026-04-10", content: "When and where to get measles vaccines..." },
  { id: 5, title: "Managing Hypertension", category: "Chronic Care", status: "Draft", date: "2026-04-08", content: "Daily management tips for high blood pressure..." },
  { id: 6, title: "Safe Drinking Water", category: "Prevention", status: "Published", date: "2026-04-05", content: "How to ensure your water is safe to drink..." },
  { id: 7, title: "Prenatal Care Basics", category: "Maternal Health", status: "Published", date: "2026-04-03", content: "Essential prenatal care for expecting mothers..." },
  { id: 8, title: "TB Awareness Campaign", category: "Prevention", status: "Draft", date: "2026-04-01", content: "Understanding tuberculosis signs and symptoms..." },
];

const categories = ["Prevention", "First Aid", "Nutrition", "Vaccination", "Chronic Care", "Maternal Health"];

const emptyForm: ArticleForm = { title: "", content: "", category: "Prevention", status: "Draft" };

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || a.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (article: Article) => {
    setForm({ title: article.title, content: article.content, category: article.category, status: article.status });
    setEditingId(article.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingId) {
      setArticles((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
    } else {
      const newArticle: Article = {
        id: Date.now(),
        ...form,
        date: new Date().toISOString().split("T")[0],
      };
      setArticles((prev) => [newArticle, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };

  const publishedCount = articles.filter((a) => a.status === "Published").length;
  const draftCount = articles.filter((a) => a.status === "Draft").length;

  return (
    <div className="p-8 space-y-6 overflow-auto h-full bg-gray-50/50">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>Total Articles</p>
              <p className="text-gray-900" style={{ fontSize: "1.5rem" }}>{articles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>Published</p>
              <p className="text-gray-900" style={{ fontSize: "1.5rem" }}>{publishedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-xl">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500" style={{ fontSize: "0.8rem" }}>Drafts</p>
              <p className="text-gray-900" style={{ fontSize: "1.5rem" }}>{draftCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <select
            id="articles-filter-category"
            title="Filter Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer"
            style={{ fontSize: "0.875rem" }}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          title="Add Article"
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
          style={{ fontSize: "0.875rem" }}
        >
          <Plus className="w-4 h-4" />
          Add Article
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>TITLE</th>
              <th className="text-left px-6 py-4 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>CATEGORY</th>
              <th className="text-left px-6 py-4 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>STATUS</th>
              <th className="text-left px-6 py-4 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>DATE</th>
              <th className="text-right px-6 py-4 text-gray-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((article) => (
              <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-gray-800" style={{ fontSize: "0.875rem" }}>{article.title}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg" style={{ fontSize: "0.75rem" }}>
                    {article.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-lg ${
                      article.status === "Published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500" style={{ fontSize: "0.8rem" }}>{article.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Edit Article"
                      onClick={() => openEdit(article)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {deleteConfirm === article.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded-lg cursor-pointer"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg cursor-pointer"
                          style={{ fontSize: "0.7rem" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        title="Delete Article"
                        onClick={() => setDeleteConfirm(article.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400" style={{ fontSize: "0.875rem" }}>
                  No articles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-800">{editingId ? "Edit Article" : "Add New Article"}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer" aria-label="Close Modal">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter article title"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write article content..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                  style={{ fontSize: "0.875rem" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Category</label>
                  <select
                    id="articles-category"
                    title="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1.5" style={{ fontSize: "0.8rem" }}>Status</label>
                  <select title="Status" aria-label="Status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "Published" | "Draft" })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 cursor-pointer"
                    style={{ fontSize: "0.875rem" }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                style={{ fontSize: "0.875rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                title="Save Article"
                onClick={handleSave}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                style={{ fontSize: "0.875rem" }}
              >
                {editingId ? "Save Changes" : "Create Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
