import { MenuItemSize } from '../data/menuData';

export interface CartItem {
  id: string; // unique item + size
  menuItemId: string;
  name: string;
  categoryId: string;
  size?: MenuItemSize;
  sizeLabel?: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  isPromotionItem?: boolean;
  promotionId?: string;
  promotionBaseItemId?: string;
  promotionBuyQuantity?: number;
  promotionRewardQuantity?: number;
}

export interface CustomerLocation {
  lat: number;
  lng: number;
  accuracy: number;
  mapsUrl: string;
  timestamp: number;
}

export interface OrderDetails {
  customerName: string; // الاسم ثنائي
  customerPhone: string; // رقم الهاتف الأساسي
  customerPhone2?: string; // رقم الهاتف الإضافي
  deliveryMethod: "delivery" | "pickup";
  branchId: string;
  manualAddress: string;
  addressDetails: string;
  notes: string;
  location: CustomerLocation | null;
  paymentMethod?: string;
}
