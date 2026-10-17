import React, { useState, useMemo, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ShowcaseGallery } from "./components/ShowcaseGallery";
import { CategoryFilter } from "./components/CategoryFilter";
import { MenuItemCard } from "./components/MenuItemCard";
import { BranchesSection } from "./components/BranchesSection";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { StickyMobileCartBar } from "./components/StickyMobileCartBar";
import { ToastNotification } from "./components/ToastNotification";
import { SplashScreen } from "./components/SplashScreen";
import { CategoryIcon } from "./components/CategoryIcon";
import { useRestaurantMenu } from "./hooks/useRestaurantMenu";
import { useRestaurantSettings } from "./hooks/useRestaurantSettings";
import { AdminDashboard } from "./admin/AdminDashboard";
import { CustomerAccountPage } from "./components/CustomerAccountPage";
import { SupportWidget } from "./components/SupportChat";
import { defaultQuantityPromotion, QuantityPromotion, subscribeToQuantityPromotion } from "./firebase/data";
import { isFirebaseConfigured } from "./firebase/client";
import { UtensilsCrossed, RefreshCw } from "lucide-react";

function MainMenuContent() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("pizza");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quickFilter, setQuickFilter] = useState<"all" | "popular" | "spicy">("all");

  const menu = useRestaurantMenu();
  const settings = useRestaurantSettings();
  const [quantityPromotion, setQuantityPromotion] = useState<QuantityPromotion>(defaultQuantityPromotion);

  useEffect(() => isFirebaseConfigured ? subscribeToQuantityPromotion(setQuantityPromotion) : undefined, []);

  useEffect(() => {
    if (menu.categories.length && !menu.categories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(menu.categories[0].id);
    }
  }, [menu.categories, activeCategoryId]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    let items = menu.items;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    } else {
      // Category filter
      items = items.filter((item) => item.categoryId === activeCategoryId);
    }

    // Quick filter (popular or spicy)
    if (quickFilter === "popular") {
      items = items.filter((item) => item.isPopular);
    } else if (quickFilter === "spicy") {
      items = items.filter((item) => item.isSpicy);
    }

    return items;
  }, [activeCategoryId, searchQuery, quickFilter, menu.items]);

  const activeCategory = menu.categories.find((c) => c.id === activeCategoryId);

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-stone-900 flex flex-col">
      {/* Intro Splash Screen */}
      <SplashScreen />

      <Navbar />
      <Hero />
      <ShowcaseGallery categoryCount={menu.categories.length} onSelectCategory={(catId) => {
        setActiveCategoryId(catId);
        setSearchQuery("");
        const el = document.getElementById("menu");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }} />

      {/* Menu Section */}
      <main id="menu" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full flex-1">
        {/* Section Header */}
        <div className="mb-8 space-y-2 text-center sm:text-right">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0d5335] bg-emerald-100/70 px-3 py-1 rounded-full">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-800" />
            <span>منيو مستر زنجر الكامل</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 font-cairo">
            قائمة الطعام والأسعار
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            جميع الأسعار بالجنيه المصري ومطابقة لأحدث قائمة معتمدة للمطعم
          </p>
        </div>

        {/* Filters and search with Drag & Arrows */}
        <div className="mb-8">
          <CategoryFilter
            categories={menu.categories}
            activeCategory={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
          />
        </div>

        {/* Current Category Banner if not searching */}
        {!searchQuery && activeCategory && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-[#0d5335] shrink-0 shadow-2xs">
                <CategoryIcon categoryId={activeCategory.id} icon={activeCategory.icon} className="text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {activeCategory.title}
                </h3>
                <p className="text-xs text-stone-500">
                  {activeCategory.subtitle}
                </p>
              </div>
            </div>

            {/* Size availability hints */}
            {activeCategory.hasSizes && activeCategory.availableSizes && (
              <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                <span className="font-semibold">الأحجام المتاحة:</span>
                <span className="font-bold">
                  {activeCategory.availableSizes.map((s) => s.label).join(" · ")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Search Results Summary if searching */}
        {searchQuery && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <span>
              نتائج البحث عن: <strong className="font-bold text-stone-900">"{searchQuery}"</strong> (تم العثور على {filteredItems.length} صنف)
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-amber-800 hover:underline font-bold cursor-pointer"
            >
              إلغاء البحث
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 my-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto text-2xl font-bold">
              🔍
            </div>
            <h3 className="text-lg font-bold text-stone-800">لا توجد نتائج مطابقة</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              لم نعثر على أصناف تطابق بحثك. جرّب البحث بكلمة أخرى أو اختر قسماً من الأقسام بالأعلى.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setQuickFilter("all");
              }}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة عرض القائمة</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} promotion={quantityPromotion} />
            ))}
          </div>
        )}
      </main>

      <BranchesSection settings={settings} />
      <Footer />

      {/* Cart & Checkout Drawers and Overlays */}
      <CartDrawer promotion={quantityPromotion} />
      <CheckoutModal settings={settings} />
      <StickyMobileCartBar />
      <ToastNotification />
      <SupportWidget />
    </div>
  );
}

export default function App() {
  if (window.location.pathname.replace(/\/$/, "") === "/admin") {
    return <AdminDashboard />;
  }
  if (window.location.pathname.replace(/\/$/, "") === "/account") {
    return <CustomerAccountPage />;
  }

  return (
    <CartProvider>
      <MainMenuContent />
    </CartProvider>
  );
}
