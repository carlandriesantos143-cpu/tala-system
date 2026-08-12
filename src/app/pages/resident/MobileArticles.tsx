import { useState } from "react";
import {
  ArrowLeft,
  Search,
  FileText,
  ChevronRight,
  X,
  BookOpen,
  Clock,
} from "lucide-react";

// Mga bagong imports para sa Offline DB
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../services/localDB";
import { SyncIndicator } from "../../components/shared/SyncIndicator";

interface MobileArticlesProps {
  onBack: () => void;
}

// Updated interface para tumugma sa Dexie DB natin
interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  date: string;
  readTime: string;
}

export function MobileArticles({ onBack }: MobileArticlesProps) {
  // 1. Kumuha ng articles galing sa lokal na bodega (Dexie)
  const rawArticles = useLiveQuery(() => db.articles.toArray(), []) || [];

  // 2. I-filter ang mga "Published" o "Active" na articles, tapos i-convert sa UI format
  const articles: Article[] = rawArticles
    .filter(
      (a) =>
        a.status.toLowerCase() === "published" ||
        a.status.toLowerCase() === "active"
    )
    .map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category || "General",
      // Awtomatikong kumukuha ng unang 90 letters para sa summary
      summary: a.content
        ? a.content.substring(0, 90) + "..."
        : "Walang karagdagang detalye.",
      content: a.content,
      // Pormat ng petsa (e.g., Apr 15, 2026)
      date: new Date(a.created_at || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      // Awtomatikong nagko-compute ng read time (assuming 200 words per minute ang bilis magbasa)
      readTime: a.content
        ? Math.max(1, Math.ceil(a.content.split(" ").length / 200)) + " min"
        : "1 min",
    }));

  // 3. Awtomatikong kunin ang mga unique na categories mula sa published articles
  const categories = [
    "All",
    ...Array.from(new Set(articles.map((a) => a.category))),
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColors = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Prevention: { bg: "bg-emerald-100", text: "text-emerald-700" },
      "First Aid": { bg: "bg-red-100", text: "text-red-700" },
      Nutrition: { bg: "bg-orange-100", text: "text-orange-700" },
      Chronic: { bg: "bg-blue-100", text: "text-blue-700" },
    };
    return colors[category] || { bg: "bg-gray-100", text: "text-gray-700" };
  };

  // Article Reader View (Modal)
  if (selectedArticle) {
    const colors = getCategoryColors(selectedArticle.category);
    return (
      <div className="flex min-h-full flex-col bg-white animate-in slide-in-from-right-2 duration-200">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSelectedArticle(null)}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-50 text-gray-500 cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium" style={{ fontSize: "0.85rem" }}>
              Back
            </span>
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open article options"
              className="p-2 -mr-2 rounded-xl hover:bg-gray-50 text-gray-400 cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[430px] p-5 pb-24">
          <div className="mb-6">
            <span
              className={`inline-block px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} mb-3`}
              style={{ fontSize: "0.7rem", fontWeight: 600 }}
            >
              {selectedArticle.category}
            </span>
            <h1
              className="text-gray-900 leading-tight mb-3"
              style={{ fontSize: "1.4rem", fontWeight: 800 }}
            >
              {selectedArticle.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span style={{ fontSize: "0.75rem" }}>
                {selectedArticle.date}
              </span>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <span
                className="flex items-center gap-1.5"
                style={{ fontSize: "0.75rem" }}
              >
                <Clock className="w-3.5 h-3.5" />
                {selectedArticle.readTime} read
              </span>
            </div>
          </div>

          <div
            className="prose prose-sm prose-emerald max-w-none text-gray-700 leading-relaxed"
            style={{ fontSize: "0.9rem" }}
          >
            <p className="whitespace-pre-line">{selectedArticle.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
        <div className="mx-auto flex w-full max-w-[430px] items-center gap-3 mb-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            title="Go back"
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <p
            className="text-gray-800 font-semibold"
            style={{ fontSize: "0.95rem" }}
          >
            Health Articles
          </p>
        </div>

        {/* Search bar */}
        <div className="mx-auto w-full max-w-[430px] relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, symptoms..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            style={{ fontSize: "0.85rem" }}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
              style={{ fontSize: "0.78rem", fontWeight: 500 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div className="space-y-3">
          {filtered.map((article) => {
            const colors = getCategoryColors(article.category);
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-left hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-gray-900 font-bold mb-1.5 leading-tight group-hover:text-emerald-700 transition-colors"
                      style={{ fontSize: "0.95rem" }}
                    >
                      {article.title}
                    </h3>
                    <p
                      className="text-gray-500 line-clamp-2 leading-relaxed"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}
                        style={{ fontSize: "0.62rem", fontWeight: 600 }}
                      >
                        {article.category}
                      </span>
                      <span
                        className="text-gray-300 flex items-center gap-1"
                        style={{ fontSize: "0.62rem" }}
                      >
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500" style={{ fontSize: "0.85rem" }}>
              No articles found
            </p>
            <p className="text-gray-400 mt-1" style={{ fontSize: "0.72rem" }}>
              {searchQuery || selectedCategory !== "All"
                ? "Try a different search term or category"
                : "Walang pang nai-publish na article ang BHW."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}