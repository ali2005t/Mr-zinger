import React from "react";
import { useCart } from "../context/CartContext";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import { ArrowDown, ShoppingBag, MapPin, MessageCircle, Clock } from "lucide-react";
import heroBanner from "../assets/images/mr_zinger_hero_banner_1791898584169.jpg";

export const Hero: React.FC = () => {
  const { setIsCartOpen, totalItems } = useCart();

  return (
    <section id="hero" className="relative overflow-hidden bg-[#0a442b] text-white">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-radial-gradient from-emerald-800/40 via-transparent to-black/80 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12 sm:pt-14 sm:pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (in RTL, Right visually): Content & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            
            {/* Trust Kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold shadow-inner">
              <span>كريب وبيتزا وزنجر بطعم مميز منذ 2019</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-cairo leading-tight sm:leading-tight tracking-tight text-white">
              اختار وجبتك المفضلة <br className="hidden sm:inline" />
              <span className="text-amber-400 inline-block drop-shadow-sm">
                واطلبها بسهولة
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              تصفح قائمة مستر زنجر، أضف أصنافك إلى السلة، وأرسل طلبك إلى الفرع عبر واتساب.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <a
                href="#menu"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base active:scale-95 cursor-pointer"
              >
                <span>تصفح القائمة واطلب</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </a>

              <button
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold px-5 py-3.5 rounded-xl border border-emerald-700/80 shadow transition-all duration-200 text-base active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>سلة المشتريات {totalItems > 0 ? `(${totalItems})` : ""}</span>
              </button>

              <a
                href="#branches"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-200 hover:text-white px-3 py-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>فروعنا في حلوان والرشاح</span>
              </a>
            </div>

            {/* Ordering details */}
            <div className="pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-emerald-200">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>حلوان والرشاح</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-100">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>الطلب عبر واتساب</span>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-100">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{RESTAURANT_CONFIG.openingHours}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5">
            <div className="relative group">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition duration-500" />
              
              {/* Main Banner Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-emerald-700/60 bg-stone-900">
                <img
                  src={heroBanner}
                  alt="وجبات مستر زنجر الشهية - بيتزا، كريب وزنجر"
                  className="w-full h-[280px] sm:h-[360px] object-cover transform group-hover:scale-102 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-stone-950/85 backdrop-blur-md rounded-xl p-3 border border-amber-500/30 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍕</span>
                    <div>
                      <p className="text-xs font-bold text-amber-400">كريب • بيتزا • زنجر</p>
                      <p className="text-[11px] text-stone-300">أصناف متنوعة بطعم شهي</p>
                    </div>
                  </div>
                  <a
                    href="#menu"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black px-3 py-1.5 rounded-lg transition-colors"
                  >
                    اطلب الآن
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
