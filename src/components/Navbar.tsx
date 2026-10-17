import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import {
  ShoppingBag,
  PhoneCall,
  MapPin,
  Menu,
  X,
  Flame,
  Pizza,
  UtensilsCrossed,
  CookingPot,
  Drumstick,
  Soup,
  Megaphone,
  UserRound,
} from "lucide-react";
import { AnnouncementConfig, isAnnouncementActive, subscribeToAnnouncement } from "../firebase/data";
import { isFirebaseConfigured } from "../firebase/client";

export const Navbar: React.FC = () => {
  const { totalItems, totalAmount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<AnnouncementConfig | null>(null);
  const [, refresh] = useState(0);
  useEffect(() => isFirebaseConfigured ? subscribeToAnnouncement(setAnnouncement) : undefined, []);
  useEffect(() => {
    if (!announcement) return;
    const timer = window.setInterval(() => refresh((value) => value + 1), 5000);
    return () => window.clearInterval(timer);
  }, [announcement]);
  const showAnnouncement = isAnnouncementActive(announcement);

  return (
    <header className="sticky top-0 z-40 bg-[#0d5335] text-white border-b border-emerald-900/60 shadow-md">
      {/* Top micro announcement bar */}
      {showAnnouncement ? <div className={`relative overflow-hidden border-b border-black/10 px-3 py-2.5 text-sm shadow-sm ${announcement!.style === "highlight" ? "ring-2 ring-inset ring-amber-300" : ""}`} style={{ backgroundColor: announcement!.backgroundColor, color: announcement!.textColor, backgroundImage: announcement!.style === "gradient" ? `linear-gradient(100deg, ${announcement!.backgroundColor}, #064e3b)` : undefined }}>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/10 to-transparent" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-center gap-2.5 sm:gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-400 text-emerald-950 shadow-sm"><Megaphone className="h-4 w-4 animate-pulse" /></span>
          <span className="min-w-0 font-black leading-5">{announcement!.text}</span>
          {announcement!.linkUrl && <a href={announcement!.linkUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black hover:bg-white/25">{announcement!.linkLabel || "اعرف أكثر"}</a>}
          <span className="hidden rounded-full border border-current/20 px-2 py-0.5 text-[9px] font-black sm:inline-flex">إعلان</span>
        </div>
      </div> : <div className="bg-[#093c26] text-amber-300 text-xs py-1.5 px-4 text-center font-medium border-b border-emerald-900/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1.5 mx-auto">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>التوصيل متاح في حلوان والرشاح — اطلب عبر واتساب</span>
          </span>
          <a
            href={`tel:${RESTAURANT_CONFIG.phoneNumbers[0]}`}
            className="hidden md:inline-flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span dir="ltr" className="tabular-nums font-semibold">{RESTAURANT_CONFIG.phoneNumbers[0]}</span>
          </a>
        </div>
      </div>}

      {/* Main 3-Zone Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand wordmark */}
        <a href="#hero" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/mr-zinger-logo.jpg"
            alt="شعار مستر زنجر"
            className="w-11 h-11 rounded-full shadow-sm group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white font-cairo leading-none">
              MR. ZINGER
            </span>
            <span className="text-[10px] font-semibold text-amber-300 tracking-wider uppercase leading-tight">
              {RESTAURANT_CONFIG.brandSubtitle}
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-emerald-100">
          <a href="#menu" className="hover:text-amber-300 transition-colors whitespace-nowrap">المنيو الكامل</a>
          <a href="#menu" className="hover:text-amber-300 transition-colors whitespace-nowrap">البيتزا</a>
          <a href="#menu" className="hover:text-amber-300 transition-colors whitespace-nowrap">الكريب</a>
          <a href="#branches" className="hover:text-amber-300 transition-colors whitespace-nowrap flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>الفروع والتواصل</span>
          </a>
        </nav>

        {/* Zone 3: Primary Action (Cart Drawer Trigger) */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="/account" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/40 px-3 py-2 text-xs font-bold text-emerald-50 hover:bg-white/10" aria-label="حسابي وطلباتي"><UserRound className="h-4 w-4" /><span className="hidden sm:inline">حسابي</span></a>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3.5 py-2 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            aria-label="عرض سلة الطلبات"
          >
            <ShoppingBag className="w-5 h-5 text-stone-950" />
            <span className="text-sm hidden sm:inline">السلة</span>
            {totalItems > 0 && (
              <span className="bg-red-600 text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center tabular-nums shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
            {totalAmount > 0 && (
              <span className="text-xs font-extrabold border-r border-stone-800/30 pr-2 hidden sm:inline tabular-nums">
                {totalAmount} ج
              </span>
            )}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-emerald-200 hover:text-white rounded-lg focus:outline-none cursor-pointer"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#093c26] border-b border-emerald-800 px-4 py-4 space-y-3 animate-in fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 flex items-center justify-center gap-2 font-semibold text-white transition-colors"
            >
              <Pizza className="w-4 h-4 text-amber-400" />
              <span>البيتزا</span>
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 flex items-center justify-center gap-2 font-semibold text-white transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              <span>الكريب الحادق</span>
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 flex items-center justify-center gap-2 font-semibold text-white transition-colors"
            >
              <CookingPot className="w-4 h-4 text-amber-400" />
              <span>الوجبات</span>
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 flex items-center justify-center gap-2 font-semibold text-white transition-colors"
            >
              <Drumstick className="w-4 h-4 text-amber-400" />
              <span>الفرايد تشكن</span>
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 flex items-center justify-center gap-2 font-semibold text-white transition-colors"
            >
              <Soup className="w-4 h-4 text-amber-400" />
              <span>الوايت صوص</span>
            </a>
            <a
              href="#branches"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>الفروع والأرقام</span>
            </a>
          </div>
          <div className="pt-2 border-t border-emerald-800 flex justify-between items-center text-xs text-emerald-300">
            <span>دليفري سريع لحلوان والرشاح</span>
            <a href={`tel:${RESTAURANT_CONFIG.phoneNumbers[0]}`} className="font-bold text-amber-300 tabular-nums">
              {RESTAURANT_CONFIG.phoneNumbers[0]}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
