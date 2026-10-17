import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, CustomerLocation, OrderDetails } from "../types/order";
import { MenuItem, MenuItemSize } from "../data/menuData";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import { QuantityPromotion } from "../firebase/data";

interface CartToast {
  id: string;
  message: string;
  itemName: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem, size?: MenuItemSize, quantity?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  addPromotionItem: (baseCartItemId: string, promotion: QuantityPromotion) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  orderDetails: OrderDetails;
  updateOrderDetails: (patch: Partial<OrderDetails>) => void;
  detectLocation: () => Promise<{ success: boolean; error?: string }>;
  clearLocation: () => void;
  isLocating: boolean;
  locationError: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  toasts: CartToast[];
  dismissToast: (id: string) => void;
  quickOrderModalItem: MenuItem | null;
  setQuickOrderModalItem: (item: MenuItem | null) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "mr_zinger_cart_v1";
const ORDER_STORAGE_KEY = "mr_zinger_order_details_v1";

function normalizePromotionItems(items: CartItem[]) {
  return items.flatMap((item) => {
    if (!item.isPromotionItem) return [item];
    const baseItem = items.find((candidate) => candidate.id === item.promotionBaseItemId && !candidate.isPromotionItem);
    if (!baseItem) return [];
    const maxReward = Math.floor(baseItem.quantity / (item.promotionBuyQuantity || 2)) * (item.promotionRewardQuantity || 1);
    if (maxReward <= 0) return [];
    return [item.quantity > maxReward ? { ...item, quantity: maxReward } : item];
  });
}

const initialOrderDetails: OrderDetails = {
  customerName: "",
  customerPhone: "",
  customerPhone2: "",
  deliveryMethod: "delivery",
  branchId: RESTAURANT_CONFIG.branches[0].id,
  manualAddress: "",
  addressDetails: "",
  notes: "",
  location: null,
  paymentMethod: "cash_on_delivery",
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderDetails, setOrderDetails] = useState<OrderDetails>(() => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialOrderDetails, ...parsed, location: null }; // reset transient location
      }
      return initialOrderDetails;
    } catch {
      return initialOrderDetails;
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toasts, setToasts] = useState<CartToast[]>([]);
  const [quickOrderModalItem, setQuickOrderModalItem] = useState<MenuItem | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Sync customer details to localStorage
  useEffect(() => {
    try {
      const { location, ...rest } = orderDetails;
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(rest));
    } catch {
      // ignore
    }
  }, [orderDetails]);

  const addToast = (itemName: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev.slice(-2), { id, itemName, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 2800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (item: MenuItem, size?: MenuItemSize, quantity = 1) => {
    let unitPrice = item.price || 0;
    let sizeLabel = "";

    if (item.sizes && item.sizes.length > 0) {
      const chosenSize = size || item.sizes[0].size;
      const sizeObj = item.sizes.find((s) => s.size === chosenSize) || item.sizes[0];
      unitPrice = sizeObj.price;
      sizeLabel = sizeObj.label;
      size = sizeObj.size;
    }

    const uniqueId = size ? `${item.id}-${size}` : item.id;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === uniqueId);
      if (existing) {
        return prev.map((i) =>
          i.id === uniqueId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: uniqueId,
          menuItemId: item.id,
          name: item.name,
          categoryId: item.categoryId,
          imageUrl: item.imageUrl,
          size,
          sizeLabel,
          unitPrice,
          quantity,
        },
      ];
    });

    addToast(item.name, sizeLabel ? `تمت الإضافة (${sizeLabel})` : "تمت الإضافة للسلة بنجاح");
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      normalizePromotionItems(prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null))
    );
  };

  const addPromotionItem = (baseCartItemId: string, promotion: QuantityPromotion) => {
    setCartItems((prev) => {
      const base = prev.find((item) => item.id === baseCartItemId && !item.isPromotionItem);
      if (!base || base.quantity < promotion.buyQuantity) return prev;
      const promoId = `promo-${promotion.menuItemId}-${base.id}`;
      const maxReward = Math.floor(base.quantity / promotion.buyQuantity) * promotion.rewardQuantity;
      const existing = prev.find((item) => item.id === promoId);
      if ((existing?.quantity ?? 0) >= maxReward) return prev;
      if (existing) return prev.map((item) => item.id === promoId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, {
        ...base,
        id: promoId,
        name: base.name,
        unitPrice: promotion.rewardPrice,
        quantity: 1,
        isPromotionItem: true,
        promotionId: promotion.menuItemId,
        promotionBaseItemId: base.id,
        promotionBuyQuantity: promotion.buyQuantity,
        promotionRewardQuantity: promotion.rewardQuantity,
      }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => normalizePromotionItems(prev.filter((i) => i.id !== cartItemId)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateOrderDetails = (patch: Partial<OrderDetails>) => {
    setOrderDetails((prev) => ({ ...prev, ...patch }));
  };

  const detectLocation = async (): Promise<{ success: boolean; error?: string }> => {
    if (!navigator.geolocation) {
      const err = "متصفحك لا يدعم تحديد الموقع الجغرافي. يمكنك كتابة عنوانك يدويًا.";
      setLocationError(err);
      return { success: false, error: err };
    }

    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const accuracy = Math.round(pos.coords.accuracy);
          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

          const loc: CustomerLocation = {
            lat,
            lng,
            accuracy,
            mapsUrl,
            timestamp: Date.now(),
          };

          setOrderDetails((prev) => ({ ...prev, location: loc }));
          setIsLocating(false);
          resolve({ success: true });
        },
        (error) => {
          setIsLocating(false);
          let message = "تعذر تحديد الموقع الجغرافي. يمكنك كتابة العنوان يدويًا.";
          if (error.code === error.PERMISSION_DENIED) {
            message = "تم رفض إذن الوصول للموقع. يرجى تفعيل الموقع أو كتابة العنوان يدويًا.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = "خدمة الموقع غير متاحة حاليًا على جهازك. يمكنك إدخال العنوان يدويًا.";
          } else if (error.code === error.TIMEOUT) {
            message = "انتهت مهلة طلب الموقع. يرجى إعادة المحاولة أو إدخال العنوان يدويًا.";
          }
          setLocationError(message);
          resolve({ success: false, error: message });
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 10000,
        }
      );
    });
  };

  const clearLocation = () => {
    setOrderDetails((prev) => ({ ...prev, location: null }));
    setLocationError(null);
  };

  const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalAmount = cartItems.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        addPromotionItem,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
        orderDetails,
        updateOrderDetails,
        detectLocation,
        clearLocation,
        isLocating,
        locationError,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toasts,
        dismissToast,
        quickOrderModalItem,
        setQuickOrderModalItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
