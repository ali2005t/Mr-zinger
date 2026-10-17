import React from "react";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import { MapPin, Phone, MessageCircle, Clock, ShieldAlert, Navigation } from "lucide-react";
import { RestaurantSettings } from "../firebase/data";

export const BranchesSection: React.FC<{ settings?: RestaurantSettings }> = ({ settings }) => {
  const branches = settings?.branches ?? RESTAURANT_CONFIG.branches;
  return (
    <section id="branches" className="py-14 sm:py-20 bg-stone-100/80 border-t border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-200/70 px-3 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>فروعنا في خدمتكم دائمًا</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 font-cairo">
            الفروع والتواصل المباشر
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            زورنا في أحد فروعنا، أو أرسل طلبك للتوصيل وسنتواصل معك لتأكيد التفاصيل.
          </p>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {branches.map((branch, index) => (
            <div
              key={branch.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-[#0d5335] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {index === 0 ? "📍 الفرع الأول" : "📍 الفرع الثاني"}
                </span>
                <span className="text-xs text-stone-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{settings?.openingHours ?? "12:00 PM - 3:00 AM"}</span>
                </span>
              </div>

              {/* Branch Name & Address */}
              <div className="space-y-2.5 mb-6">
                <h3 className="text-xl font-bold text-stone-900">
                  {branch.name}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {branch.address}
                </p>
                <div className="inline-block bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs text-stone-700">
                  <span className="font-semibold text-stone-900">بالقرب من: </span>
                  <span>{branch.landmark}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-2.5">
                <a
                  href={`tel:${branch.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0d5335] hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span dir="ltr" className="tabular-nums font-bold">{branch.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${branch.whatsappNumber || ('2' + branch.phone)}?text=${encodeURIComponent("السلام عليكم، عايز استفسر عن منيو وطلبات مستر زنجر")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>واتساب</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors"
                  title="الموقع على خرائط جوجل"
                >
                  <Navigation className="w-4 h-4 text-stone-600" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Complaints and direct hotline banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                خط شكاوى واقتراحات الشيف مصطفى المباشر
              </h4>
              <p className="text-xs text-stone-600">
                رضاكم ووصول طلبكم في الوقت المناسب من أولوياتنا دائمًا.
              </p>
            </div>
          </div>

          <a
            href={`tel:${RESTAURANT_CONFIG.complaintsPhone}`}
            className="bg-stone-900 hover:bg-black text-white font-extrabold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span dir="ltr" className="tabular-nums">{RESTAURANT_CONFIG.complaintsPhone}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
