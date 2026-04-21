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

interface MobileArticlesProps {
  onBack: () => void;
}

interface Article {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  date: string;
  readTime: string;
}

const articles: Article[] = [
  {
    id: 1,
    title: "Dengue Prevention Tips",
    category: "Prevention",
    summary: "Simple steps to protect your family from dengue fever.",
    content:
      "Dengue fever is spread by Aedes mosquitoes. Remove stagnant water from around your home — check flower pots, tires, gutters, and water containers. Use mosquito nets and repellent, especially during dawn and dusk. Wear long sleeves when possible. If you have fever with body pain and rash, visit your health center immediately. Early detection saves lives.",
    date: "Apr 15, 2026",
    readTime: "3 min",
  },
  {
    id: 2,
    title: "First Aid for Burns",
    category: "First Aid",
    summary: "How to safely treat minor burns at home.",
    content:
      "For minor burns: Cool the burn under clean running water for at least 10 minutes. Do NOT apply ice, butter, or toothpaste. Cover loosely with a sterile bandage. Take paracetamol for pain. For burns larger than your palm, with blisters, or on the face/hands/joints — go to the hospital. For chemical or electrical burns, always seek emergency care.",
    date: "Apr 14, 2026",
    readTime: "4 min",
  },
  {
    id: 3,
    title: "Nutrition for Children",
    category: "Nutrition",
    summary: "Essential nutrients for healthy growing kids.",
    content:
      "Children need balanced meals with protein (fish, eggs, beans), carbohydrates (rice, bread), and vitamins from fruits and vegetables. Iron-rich foods like liver and green leafy vegetables prevent anemia. Vitamin A from yellow and orange vegetables supports immunity. Encourage breastfeeding for the first 6 months. Avoid sugary drinks and processed snacks.",
    date: "Apr 12, 2026",
    readTime: "5 min",
  },
  {
    id: 4,
    title: "Measles Vaccination Guide",
    category: "Vaccination",
    summary: "When and where to get measles vaccines for children.",
    content:
      "The measles vaccine is given at 9 months and again at 12 months as part of the National Immunization Program. It's free at all health centers. Measles is highly contagious and can cause serious complications. Symptoms include high fever, cough, rash, and red eyes. If your child has these symptoms, visit the nearest health facility.",
    date: "Apr 10, 2026",
    readTime: "3 min",
  },
  {
    id: 5,
    title: "Managing Hypertension",
    category: "Chronic Care",
    summary: "Daily tips for controlling high blood pressure.",
    content:
      "High blood pressure usually has no symptoms but can lead to stroke and heart attack. Monitor your BP regularly. Reduce salt and fatty foods. Exercise for at least 30 minutes daily. Take your maintenance medication as prescribed — do not stop even if you feel fine. Avoid alcohol and smoking. Regular checkups at your health center are important.",
    date: "Apr 8, 2026",
    readTime: "4 min",
  },
  {
    id: 6,
    title: "Safe Drinking Water",
    category: "Prevention",
    summary: "How to make sure your water is safe to drink.",
    content:
      "Boil water for at least 1 minute to kill bacteria and parasites. Store clean water in covered containers. Never drink from rivers or streams without treatment. If you have access to chlorine tablets, use as directed. Signs of waterborne illness include diarrhea, vomiting, and stomach cramps — seek medical help if symptoms are severe.",
    date: "Apr 5, 2026",
    readTime: "3 min",
  },
  {
    id: 7,
    title: "Prenatal Care Basics",
    category: "Maternal Health",
    summary: "Essential care for expecting mothers.",
    content:
      "Visit your health center as soon as you know you're pregnant. At least 4 prenatal visits are recommended. Take iron and folic acid supplements daily. Eat nutritious foods and rest well. Watch for danger signs: vaginal bleeding, severe headache, blurred vision, or swelling. If any occur, go to the hospital immediately. Plan your birth with a skilled attendant.",
    date: "Apr 3, 2026",
    readTime: "5 min",
  },
  {
    id: 8,
    title: "TB Awareness",
    category: "Prevention",
    summary: "Recognizing signs of tuberculosis early.",
    content:
      "Tuberculosis (TB) is caused by bacteria spread through the air. Symptoms include cough lasting more than 2 weeks, blood in sputum, weight loss, night sweats, and fever. TB is curable with 6 months of treatment. Free treatment is available at DOH-accredited health facilities. If you or someone you know has a persistent cough, get tested immediately.",
    date: "Apr 1, 2026",
    readTime: "4 min",
  },
];

const categories = [
  "All",
  "Prevention",
  "First Aid",
  "Nutrition",
  "Vaccination",
  "Chronic Care",
  "Maternal Health",
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  Prevention: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "First Aid": { bg: "bg-red-100", text: "text-red-700" },
  Nutrition: { bg: "bg-orange-100", text: "text-orange-700" },
  Vaccination: { bg: "bg-blue-100", text: "text-blue-700" },
  "Chronic Care": { bg: "bg-violet-100", text: "text-violet-700" },
  "Maternal Health": { bg: "bg-pink-100", text: "text-pink-700" },
};

export function MobileArticles({ onBack }: MobileArticlesProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || a.category === category;
    return matchSearch && matchCategory;
  });

  if (selectedArticle) {
    const colors = categoryColors[selectedArticle.category] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
    };
    return (
      <div className="min-h-full bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <div className="mx-auto flex w-full max-w-[430px] items-center gap-3">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => setSelectedArticle(null)}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <p
              className="truncate text-gray-800 font-semibold"
              style={{ fontSize: "0.9rem" }}
            >
              {selectedArticle.title}
            </p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[430px] px-5 py-5 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text}`}
              style={{ fontSize: "0.68rem", fontWeight: 600 }}
            >
              {selectedArticle.category}
            </span>
            <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "0.68rem" }}>
              <Clock className="w-3 h-3" />
              {selectedArticle.readTime} read
            </span>
          </div>
          <h1
            className="text-gray-800 mb-2"
            style={{ fontSize: "1.25rem", fontWeight: 700 }}
          >
            {selectedArticle.title}
          </h1>
          <p className="text-gray-400 mb-5" style={{ fontSize: "0.75rem" }}>
            {selectedArticle.date}
          </p>
          <p
            className="text-gray-600 leading-relaxed"
            style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
          >
            {selectedArticle.content}
          </p>
          <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <p className="text-emerald-700" style={{ fontSize: "0.78rem" }}>
              <strong>Tip:</strong> Share this article with your family and
              neighbors to spread awareness in your community.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <div className="mx-auto flex w-full max-w-[430px] items-center gap-3">
          <button
            type="button"
            aria-label="Go back"
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <p
              className="text-gray-800 font-semibold"
              style={{ fontSize: "0.95rem" }}
            >
              Health Articles
            </p>
            <p className="text-gray-400" style={{ fontSize: "0.68rem" }}>
              {filtered.length} articles available
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[430px] space-y-4 px-5 py-4 pb-24">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            style={{ fontSize: "0.85rem" }}
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                category === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div className="space-y-3">
          {filtered.map((article) => {
            const colors = categoryColors[article.category] || {
              bg: "bg-gray-100",
              text: "text-gray-700",
            };
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2.5 rounded-xl shrink-0">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-gray-800 font-medium"
                      style={{ fontSize: "0.88rem" }}
                    >
                      {article.title}
                    </p>
                    <p
                      className="text-gray-400 mt-1 line-clamp-2"
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
              Try a different search term or category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
