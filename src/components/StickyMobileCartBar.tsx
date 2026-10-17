import React from "react";
import { useCart } from "../context/CartContext";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export const StickyMobileCartBar: React.FC = () => {
  const { totalItems, totalAmount, setIsCartOpen, isCartOpen, isCheckoutOpen } = useCart();

  // Only show if there are items and neither cart drawer nor checkout modal is open
  if (totalItems === 0 || isCartOpen || isCheckoutOpen) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 p-3 sm:hidden animate-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-full bg-[#0d5335] hover:bg-emerald-900 text-white rounded-2xl p-3.5 shadow-2xl border border-amber-400/30 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center tabular-nums">
                {totalItems}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-200">سلة الطلبات ({totalItems} صنف)</div>
              <div className="text-sm font-extrabold text-white tabular-nums">
                {totalAmount} جنيه
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500 text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs">
            <span>متابعة الطلب</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
};
