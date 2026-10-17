import React from "react";
import pizzaImg from "../assets/images/pizza_showcase_1791898602174.jpg";
import crepeImg from "../assets/images/crepe_showcase_1791898602841.jpg";
import chickenImg from "../assets/images/fried_chicken_zinger_1791898604943.jpg";
import { ArrowLeft, Sparkles } from "lucide-react";

interface ShowcaseGalleryProps {
  onSelectCategory: (categoryId: string) => void;
  categoryCount: number;
}

export const ShowcaseGallery: React.FC<ShowcaseGalleryProps> = ({ onSelectCategory, categoryCount }) => {
  return (
    <section className="py-10 bg-white border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>أصناف مستر زنجر المميزة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-cairo">
              أشهر أقسام المنيو
            </h2>
          </div>
          <a
            href="#menu"
            className="text-xs font-bold text-[#0d5335] hover:underline flex items-center gap-1"
          >
            <span>عرض كل الأقسام ({categoryCount} قسم)</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Pizza */}
          <div
            onClick={() => onSelectCategory("pizza")}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-stone-200/80 bg-stone-900"
          >
            <div className="h-48 sm:h-56 overflow-hidden">
              <img
                src={pizzaImg}
                alt="بيتزا إيطالية هشة"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-amber-400 text-xs font-bold">23 نوع بيتزا</span>
              <h3 className="text-lg font-black font-cairo">البيتزا الإيطالية</h3>
              <p className="text-xs text-stone-300 line-clamp-1">
                عجينة هشة خفيفة مع جبنة موتزاريلا سايحة ومكونات غنية
              </p>
            </div>
          </div>

          {/* Card 2: Crepe */}
          <div
            onClick={() => onSelectCategory("crepe-savory")}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-stone-200/80 bg-stone-900"
          >
            <div className="h-48 sm:h-56 overflow-hidden">
              <img
                src={crepeImg}
                alt="كريب حادق محشو بالزنجر والجبن"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-amber-400 text-xs font-bold">حجمين وسط وكبير</span>
              <h3 className="text-lg font-black font-cairo">الكريب الحادق</h3>
              <p className="text-xs text-stone-300 line-clamp-1">
                كريب محمص بحشوات متنوعة من الدجاج واللحوم والجبن
              </p>
            </div>
          </div>

          {/* Card 3: Fried Chicken */}
          <div
            onClick={() => onSelectCategory("fried-chicken")}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-stone-200/80 bg-stone-900"
          >
            <div className="h-48 sm:h-56 overflow-hidden">
              <img
                src={chickenImg}
                alt="فرايد تشكن وزنجر كرانشي"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-amber-400 text-xs font-bold">تتبيلة الشيف السرية</span>
              <h3 className="text-lg font-black font-cairo">الفرايد تشكن والكرانشي</h3>
              <p className="text-xs text-stone-300 line-clamp-1">
                دجاج مقرمش مع صوصات تكساس ورانش وشيدر
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
