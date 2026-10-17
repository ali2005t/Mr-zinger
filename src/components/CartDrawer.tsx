import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { getMenuItemImage } from "../utils/itemImage";
import { resolveDatabaseImage } from "../firebase/data";
import { QuantityPromotion } from "../firebase/data";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";

export const CartDrawer: React.FC<{ promotion?: QuantityPromotion }> = ({ promotion }) => {
  const [resolvedImages, setResolvedImages] = useState<Record<string, string>>({});
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    addPromotionItem,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItems,
    setIsCheckoutOpen,
  } = useCart();

  useEffect(() => {
    let active = true;
    Promise.all(cartItems.map(async (item) => [item.id, await resolveDatabaseImage(item.imageUrl)] as const))
      .then((pairs) => { if (active) setResolvedImages(Object.fromEntries(pairs)); });
    return () => { active = false; };
  }, [cartItems]);

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#0d5335] text-white flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-base sm:text-lg font-bold">سلة الطلبات</h2>
                <p className="text-xs text-emerald-200">
                  {totalItems > 0 ? `${totalItems} أصناف في السلة` : "السلة فارغة حالياً"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Items list or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-500">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl">
                  🛒
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">سلتك فارغة!</h3>
                  <p className="text-xs text-stone-500 max-w-xs mt-1 leading-relaxed">
                    تصفح قائمة مستر زنجر وأضف البيتزا أو الكريب أو وجبات الزنجر إلى سلتك.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  تصفح المنيو الآن
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {promotion?.enabled && cartItems.filter((item) => !item.isPromotionItem && item.menuItemId === promotion.menuItemId && item.quantity >= promotion.buyQuantity).map((baseItem) => {
                  const promoLine = cartItems.find((item) => item.isPromotionItem && item.promotionId === promotion.menuItemId && item.promotionBaseItemId === baseItem.id);
                  const available = Math.max(0, Math.floor(baseItem.quantity / promotion.buyQuantity) * promotion.rewardQuantity - (promoLine?.quantity ?? 0));
                  if (available <= 0) return null;
                  return <div key={`offer-${baseItem.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white p-3 shadow-sm">
                    <div className="min-w-0"><p className="text-xs font-black text-amber-900">عرض خاص لك 🎁</p><p className="mt-1 text-[11px] leading-5 text-stone-600">أضفت {baseItem.quantity} من {baseItem.name} — خذ قطعة إضافية بـ {promotion.rewardPrice} جنيه.</p><p className="mt-0.5 text-[10px] font-bold text-emerald-800">متاح {available} قطعة</p></div>
                    <button type="button" onClick={() => addPromotionItem(baseItem.id, promotion)} className="shrink-0 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-stone-950 transition hover:bg-amber-300">أضف العرض</button>
                  </div>;
                })}
                {cartItems.map((item) => {
                  const itemTotal = item.unitPrice * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/90 flex items-center justify-between gap-3"
                    >
                      {/* Thumbnail */}
                      <img
                        src={resolvedImages[item.id] || (item.imageUrl?.startsWith("dbimage:") ? getMenuItemImage(item.categoryId, item.name) : item.imageUrl) || getMenuItemImage(item.categoryId, item.name)}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      {/* Item Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900 truncate">
                            {item.name}
                          </h4>
                          {item.sizeLabel && (
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                              {item.sizeLabel}
                            </span>
                          )}
                          {item.isPromotionItem && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">عرض خاص</span>}
                        </div>
                        <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5 tabular-nums">
                          <span>{item.unitPrice} ج للقطعة</span>
                          <span>•</span>
                          <span className="font-bold text-[#0d5335] text-sm">
                            {itemTotal} ج
                          </span>
                        </div>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-1 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-stone-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          aria-label="تقليل الكمية"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-stone-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-[#0d5335] text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete icon */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="حذف من السلة"
                        aria-label="حذف الصنف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* Empty Cart option */}
                <div className="pt-2 text-center">
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تفريغ محتويات السلة</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Subtotal & Proceed Button */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-sm text-stone-600">
                  <span>إجمالي الأصناف ({totalItems})</span>
                  <span className="font-extrabold text-stone-900 tabular-nums text-base">
                    {totalAmount} ج
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-stone-500">
                  <span>رسوم التوصيل</span>
                  <span className="text-amber-800 font-medium">تُحدد حسب العنوان</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 text-base cursor-pointer"
              >
                <span>متابعة بيانات الطلب والعنوان</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
