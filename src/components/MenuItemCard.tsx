import React, { useState } from "react";
import { MenuItem, MenuItemSize } from "../data/menuData";
import { useCart } from "../context/CartContext";
import { getMenuItemImage } from "../utils/itemImage";
import { useDatabaseImage } from "../hooks/useDatabaseImage";
import { Plus, Minus, Flame, ShoppingBag, Check, Gift } from "lucide-react";
import { QuantityPromotion } from "../firebase/data";

interface MenuItemCardProps {
  item: MenuItem;
  promotion?: QuantityPromotion;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, promotion }) => {
  const { cartItems, addToCart, updateQuantity, addPromotionItem } = useCart();

  // If item has sizes, keep a selected size in local state (default to smallest or first)
  const defaultSize = item.sizes && item.sizes.length > 0 ? item.sizes[0].size : undefined;
  const [selectedSize, setSelectedSize] = useState<MenuItemSize | undefined>(defaultSize);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  // Check if this specific item + size is in the cart
  const activeCartId = selectedSize ? `${item.id}-${selectedSize}` : item.id;
  const cartItem = cartItems.find((i) => i.id === activeCartId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const promotionLine = cartItem && promotion?.enabled && promotion.menuItemId === item.id
    ? cartItems.find((entry) => entry.isPromotionItem && entry.promotionId === item.id && entry.promotionBaseItemId === cartItem.id)
    : undefined;
  const promotionAvailable = promotion?.enabled && promotion.menuItemId === item.id && quantityInCart >= promotion.buyQuantity
    ? Math.max(0, Math.floor(quantityInCart / promotion.buyQuantity) * promotion.rewardQuantity - (promotionLine?.quantity ?? 0))
    : 0;

  // Active price display
  const currentPrice = item.sizes
    ? item.sizes.find((s) => s.size === selectedSize)?.price || item.sizes[0].price
    : item.price || 0;

  // High-res food image
  const storedImage = useDatabaseImage(item.imageUrl);
  const itemImg = storedImage || getMenuItemImage(item.categoryId, item.name);

  const handleAdd = () => {
    addToCart(item, selectedSize, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      
      {/* Product Image Showcase */}
      <div className="relative h-36 sm:h-44 w-full overflow-hidden rounded-2xl mb-3 bg-stone-100">
        <img
          src={itemImg}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Top Badges (Spicy / Popular) */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {item.isPopular && (
            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
              الأكثر طلبًا ⭐
            </span>
          )}
          {item.isSpicy && (
            <span className="text-[10px] font-extrabold text-white bg-red-600/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
              <Flame className="w-3 h-3 fill-white" />
              <span>حار</span>
            </span>
          )}
        </div>

        {/* In-Cart Pill Badge */}
        {quantityInCart > 0 && (
          <div className="absolute bottom-2 left-2 bg-[#0d5335] text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-md tabular-nums animate-pulse">
            في السلة: {quantityInCart}
          </div>
        )}
      </div>

      {/* Item Title & Details */}
      <div className="space-y-1 mb-2 px-1">
        <h3 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-[#0d5335] transition-colors leading-snug font-cairo">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Size Selector for items with multiple sizes */}
      {item.sizes && item.sizes.length > 0 && (
        <div className="my-2 pt-2 border-t border-stone-100 px-1">
          <div className="text-[11px] text-stone-600 font-bold mb-1.5 flex justify-between">
            <span>اختر الحجم:</span>
            <span className="text-[#0d5335]">
              {item.sizes.find((s) => s.size === selectedSize)?.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100/90 rounded-xl">
            {item.sizes.map((s) => {
              const isSelected = selectedSize === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => setSelectedSize(s.size)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all text-center flex flex-col items-center cursor-pointer ${
                    isSelected
                      ? "bg-[#0d5335] text-white shadow-xs"
                      : "text-stone-700 hover:bg-white hover:text-stone-900"
                  }`}
                >
                  <span className="text-[11px] leading-tight">{s.label}</span>
                  <span className="text-[10px] tabular-nums font-semibold opacity-90">
                    {s.price} ج
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price & Action Button Area */}
      <div className="mt-2 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-3 px-1">
        {/* Price tag */}
        <div className="flex flex-col">
          <span className="text-[10px] text-stone-400 font-medium">السعر</span>
          <div className="text-lg sm:text-xl font-black text-[#0d5335] tabular-nums flex items-baseline gap-1">
            <span>{currentPrice}</span>
            <span className="text-xs font-bold text-stone-600">جنيه</span>
          </div>
        </div>

        {/* Interactive Add or Quantity Stepper */}
        {quantityInCart > 0 ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => updateQuantity(activeCartId, -1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-800 hover:bg-red-50 hover:text-red-700 shadow-2xs transition-colors cursor-pointer"
              aria-label="تقليل الكمية"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold text-emerald-950 tabular-nums">
              {quantityInCart}
            </span>
            <button
              onClick={() => updateQuantity(activeCartId, 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#0d5335] text-white hover:bg-emerald-800 shadow-2xs transition-colors cursor-pointer"
              aria-label="زيادة الكمية"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              isAddedRecently
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-stone-950 hover:shadow"
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>تمت الإضافة!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-stone-950" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        )}
      </div>

      {promotionAvailable > 0 && cartItem && promotion && <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5"><p className="min-w-0 text-[11px] font-bold leading-5 text-amber-950"><Gift className="ml-1 inline h-3.5 w-3.5 text-amber-700" />عرض خاص: قطعة إضافية بـ {promotion.rewardPrice} جنيه</p><button type="button" onClick={() => addPromotionItem(cartItem.id, promotion)} className="shrink-0 rounded-lg bg-amber-400 px-2.5 py-2 text-[10px] font-black text-stone-950">أضف العرض</button></div>}

    </div>
  );
};
