import React, { useRef, useState, useEffect } from "react";
import { MenuCategory } from "../data/menuData";
import { CategoryIcon } from "./CategoryIcon";
import { Search, Flame, Star, X, ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryFilterProps {
  categories: MenuCategory[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  quickFilter: "all" | "popular" | "spicy";
  onQuickFilterChange: (f: "all" | "popular" | "spicy") => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  quickFilter,
  onQuickFilterChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Mouse Drag-to-scroll logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier for smooth momentum
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Scroll buttons (In RTL, scrolling right vs left)
  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;
    // In RTL, positive or negative depending on browser; standard scrollBy handles both gracefully
    scrollContainerRef.current.scrollBy({ left: 220, behavior: "smooth" });
  };

  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -220, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Quick Toggles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="ابحث عن صنف بالاسم (مثال: رانش، شاورما، نوتيلا، بسطرمة)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-9 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-[#0d5335] focus:ring-2 focus:ring-emerald-700/20 text-xs sm:text-sm outline-none transition-all placeholder:text-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Toggles: All / Popular / Spicy */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl self-start sm:self-auto shrink-0">
          <button
            onClick={() => onQuickFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              quickFilter === "all"
                ? "bg-white text-stone-900 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => onQuickFilterChange("popular")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              quickFilter === "popular"
                ? "bg-amber-500 text-stone-950 shadow-2xs font-extrabold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>الأكثر طلبًا</span>
          </button>
          <button
            onClick={() => onQuickFilterChange("spicy")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              quickFilter === "spicy"
                ? "bg-red-600 text-white shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current text-red-500" />
            <span>حار</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Categories Container with Navigation Arrows */}
      <div className="relative group/scroll flex items-center gap-1.5">
        
        {/* Right Arrow Button (in RTL: scrolls to right / previous items) */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="shrink-0 w-9 h-9 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-[#0d5335] shadow-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer z-10"
          aria-label="تمرير لليمين"
          title="تمرير لليمين"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable / Draggable Track */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`flex-1 flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none select-none scroll-smooth ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (!hasMoved) {
                    onSelectCategory(cat.id);
                    if (searchQuery) onSearchChange("");
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#0d5335] text-white shadow-md scale-102 border border-emerald-900"
                    : "bg-white text-stone-700 border border-stone-200/90 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <CategoryIcon
                  categoryId={cat.id}
                  icon={cat.icon}
                  className="text-base"
                />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Left Arrow Button (in RTL: scrolls to left / next items) */}
        <button
          type="button"
          onClick={handleScrollLeft}
          className="shrink-0 w-9 h-9 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 hover:text-[#0d5335] shadow-sm flex items-center justify-center transition-all active:scale-95 cursor-pointer z-10"
          aria-label="تمرير لليسار"
          title="تمرير لليسار"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
