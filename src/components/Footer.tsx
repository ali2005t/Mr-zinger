import React from "react";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import { Phone, MapPin, Heart, Facebook } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-10 border-t border-stone-800 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-right">
          
          {/* Brand Info */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <img src="/mr-zinger-logo.jpg" alt="" className="w-10 h-10" />
              <h3 className="text-xl font-black text-white font-cairo">
                {RESTAURANT_CONFIG.brandName}
              </h3>
            </div>
            <p className="text-amber-400 font-semibold text-[11px] uppercase tracking-wider">
              {RESTAURANT_CONFIG.brandSubtitle}
            </p>
            <p className="text-stone-400 leading-relaxed text-xs">
              يقدم مطعم مستر زنجر الكريب والبيتزا والوجبات والسندوتشات في حلوان.
            </p>
            <a href="https://www.facebook.com/mrzienger" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-700/20 px-3 py-2 font-bold text-blue-200 hover:bg-blue-700/35" aria-label="صفحة مستر زنجر على فيسبوك"><Facebook className="h-4 w-4" />تابعنا على فيسبوك</a>
          </div>

          {/* Quick Contact */}
          <div className="space-y-2 text-center md:text-right">
            <h4 className="font-bold text-white text-sm">أرقام الطلبات والتوصيل</h4>
            <div className="flex flex-col gap-1 text-stone-300">
              <a href={`tel:${RESTAURANT_CONFIG.phoneNumbers[0]}`} className="hover:text-amber-400 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span dir="ltr" className="tabular-nums font-semibold">{RESTAURANT_CONFIG.phoneNumbers[0]}</span>
              </a>
              <a href={`tel:${RESTAURANT_CONFIG.phoneNumbers[1]}`} className="hover:text-amber-400 transition-colors flex items-center justify-center md:justify-start gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span dir="ltr" className="tabular-nums font-semibold">{RESTAURANT_CONFIG.phoneNumbers[1]}</span>
              </a>
              <div className="text-[11px] text-stone-400 mt-1">
                شكاوى الشيف مصطفى: <span dir="ltr" className="tabular-nums text-amber-300 font-bold">{RESTAURANT_CONFIG.complaintsPhone}</span>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2 text-center md:text-right">
            <h4 className="font-bold text-white text-sm">الفروع</h4>
            <div className="space-y-1.5 text-stone-400">
              <p className="flex items-center justify-center md:justify-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>فرع شارع الرشاح (خلف سيراميكا كليوباترا)</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>فرع كورنيش حلوان (منشية جمال عبد الناصر)</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} مستر زنجر — جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            <span>صُنِع بكل</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>لعشاق الطعام الشهي</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
