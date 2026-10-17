import React, { useState } from "react";
import { SPECIAL_OFFERS, SpecialOffer } from "../data/offersData";
import { useCart } from "../context/CartContext";
import { MenuItem } from "../data/menuData";
import { Flame, Sparkles, Check, ShoppingBag, Plus, Minus, Tag } from "lucide-react";

export const OffersSection: React.FC = () => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [addedOfferId, setAddedOfferId] = useState<string | null>(null);

  const handleAddOffer = (offer: SpecialOffer) => {
    // Convert offer to a MenuItem structure for the cart
    const offerMenuItem: MenuItem = {
      id: offer.id,
      name: offer.title,
      categoryId: "offers",
      price: offer.offerPrice,
      description: offer.description,
      isPopular: offer.isPopular,
    };

    addToCart(offerMenuItem, undefined, 1);
    setAddedOfferId(offer.id);
    setTimeout(() => setAddedOfferId(null), 1500);
  };

  return (
    <section id="offers" className="py-12 sm:py-16 bg-gradient-to-b from-[#f8f5ee] to-[#fcfaf6] border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 text-center sm:text-right">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full mb-2">
              <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
              <span>عروض ووجبات كومبو</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 font-cairo">
              عروض مستر زنجر الخاصة
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              اختر من عروض البيتزا والكريب والسندوتشات والوجبات.
            </p>
          </div>

          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#0d5335] bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl self-center sm:self-auto shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>وفّر حتى 70 جنيهًا</span>
          </div>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIAL_OFFERS.map((offer) => {
            const inCart = cartItems.find((i) => i.id === offer.id);
            const isJustAdded = addedOfferId === offer.id;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Top Savings Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs font-black bg-red-600 text-white px-2.5 py-1 rounded-lg shadow-2xs">
                    <Tag className="w-3 h-3" />
                    <span>{offer.badge}</span>
                  </span>

                  {offer.isPopular && (
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                      الأكثر مبيعًا ⭐
                    </span>
                  )}
                </div>

                {/* Offer Title & Description */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-lg sm:text-xl font-black text-stone-900 group-hover:text-[#0d5335] transition-colors font-cairo">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                {/* Combo Components List */}
                <div className="bg-stone-50 rounded-2xl p-3.5 mb-5 space-y-1.5 border border-stone-100">
                  <p className="text-[11px] font-bold text-stone-700">مكونات العرض:</p>
                  <ul className="space-y-1 text-xs text-stone-600">
                    {offer.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#0d5335] font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing & Add to Cart Area */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-stone-400 line-through tabular-nums block">
                      بدلاً من {offer.originalPrice} ج
                    </span>
                    <div className="text-xl font-black text-[#0d5335] tabular-nums flex items-baseline gap-1">
                      <span>{offer.offerPrice}</span>
                      <span className="text-xs font-bold text-stone-600">جنيه</span>
                    </div>
                  </div>

                  {/* Add or Stepper */}
                  {inCart ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(offer.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-800 hover:bg-red-50 hover:text-red-700 shadow-2xs transition-colors cursor-pointer"
                        aria-label="تقليل الكمية"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-emerald-950 tabular-nums">
                        {inCart.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(offer.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0d5335] text-white hover:bg-emerald-800 shadow-2xs transition-colors cursor-pointer"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddOffer(offer)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-sm active:scale-95 cursor-pointer ${
                        isJustAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-500 hover:bg-amber-400 text-stone-950"
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>تمت الإضافة!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-stone-950" />
                          <span>أضف العرض</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
