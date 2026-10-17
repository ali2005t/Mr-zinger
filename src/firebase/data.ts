import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { MenuCategory, MenuItem } from "../data/menuData";
import type { CartItem, CustomerLocation, OrderDetails } from "../types/order";
import type { BranchInfo } from "../data/restaurantConfig";
import type { SpecialOffer } from "../data/offersData";
import { firestore } from "./client";

export interface RestaurantMenu {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface RestaurantSettings {
  branches: BranchInfo[];
  openingHours: string;
  deliveryFee: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
}

export interface RestaurantCoupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  active: boolean;
}

export interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  style: "simple" | "highlight" | "gradient";
  backgroundColor: string;
  textColor: string;
  startsAt: string;
  endsAt: string;
  linkUrl: string;
  linkLabel: string;
}

export interface QuantityPromotion {
  enabled: boolean;
  menuItemId: string;
  buyQuantity: number;
  rewardQuantity: number;
  rewardPrice: number;
}

export interface CustomerAccountsConfig {
  enabled: boolean;
  orderHandling: "whatsapp" | "dashboard";
  paymentMethods: PaymentMethodOption[];
  estimatedMinutes: number;
}

export interface PaymentMethodOption { id: string; label: string; enabled: boolean }
export interface CustomerProfile {
  name: string;
  phone: string;
  email?: string;
  blocked?: boolean;
  phone2: string;
  deliveryMethod: OrderDetails["deliveryMethod"];
  branchId: string;
  manualAddress: string;
  addressDetails: string;
  location: CustomerLocation | null;
  paymentMethod: string;
}

export const defaultCustomerAccountsConfig: CustomerAccountsConfig = {
  enabled: false, orderHandling: "whatsapp",
  paymentMethods: [{ id: "cash_on_delivery", label: "الدفع عند الاستلام", enabled: true }],
  estimatedMinutes: 45,
};

export async function getCustomerProfile(uid: string): Promise<CustomerProfile | null> {
  const snapshot = await getDoc(doc(requireFirestore(), "customerProfiles", uid));
  return snapshot.exists() ? snapshot.data() as CustomerProfile : null;
}

export async function saveCustomerProfile(uid: string, profile: CustomerProfile) {
  await setDoc(doc(requireFirestore(), "customerProfiles", uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

export interface CustomerAccountRecord extends CustomerProfile { uid: string }

export function subscribeToCustomerProfiles(onCustomers: (customers: CustomerAccountRecord[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(collection(requireFirestore(), "customerProfiles"), (snapshot) => {
    onCustomers(snapshot.docs.map((entry) => ({ uid: entry.id, ...entry.data() }) as CustomerAccountRecord));
  }, (error) => onError?.(error));
}

export async function setCustomerAccountBlocked(uid: string, blocked: boolean) {
  await updateDoc(doc(requireFirestore(), "customerProfiles", uid), { blocked, updatedAt: serverTimestamp() });
}

export const STAFF_ROLES = ["orders", "menu", "reports", "settings", "coupons", "offers", "promotions", "announcement", "support"] as const;
export type StaffRole = typeof STAFF_ROLES[number];
export type StaffPermissions = Record<StaffRole, boolean>;
export interface StaffMember {
  uid: string;
  name: string;
  email: string;
  active: boolean;
  roles: StaffPermissions;
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  orders: "الطلبات", menu: "المنيو", reports: "التقارير", settings: "الفروع والتوصيل",
  coupons: "الكوبونات", offers: "العروض", promotions: "عروض الكمية", announcement: "الإعلان",
  support: "دعم العملاء",
};

export function subscribeToStaffMembers(onMembers: (members: StaffMember[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(collection(requireFirestore(), "staff"), (snapshot) => {
    onMembers(snapshot.docs.map((entry) => ({ uid: entry.id, ...entry.data() }) as StaffMember));
  }, (error) => onError?.(error));
}

export async function getStaffMember(uid: string): Promise<StaffMember | null> {
  const snapshot = await getDoc(doc(requireFirestore(), "staff", uid));
  return snapshot.exists() ? ({ uid: snapshot.id, ...snapshot.data() } as StaffMember) : null;
}

export async function saveStaffMember(member: StaffMember) {
  await setDoc(doc(requireFirestore(), "staff", member.uid), {
    name: member.name.trim(), email: member.email.trim().toLowerCase(), active: member.active,
    roles: member.roles, updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteStaffMember(uid: string) {
  await deleteDoc(doc(requireFirestore(), "staff", uid));
}

export interface SupportMessage {
  id: string;
  senderUid: string;
  senderRole: "customer" | "support";
  text: string;
  createdAt?: { toDate: () => Date } | null;
}

export interface SupportConversation {
  uid: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  lastMessage: string;
  status: "open" | "closed";
  updatedAt?: { toDate: () => Date } | null;
}

export function subscribeToSupportMessages(uid: string, onMessages: (messages: SupportMessage[]) => void, onError?: (error: Error) => void) {
  const messagesQuery = query(collection(requireFirestore(), "supportConversations", uid, "messages"), orderBy("createdAt", "asc"), limit(200));
  return onSnapshot(messagesQuery, (snapshot) => onMessages(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as SupportMessage)), (error) => onError?.(error));
}

export function subscribeToSupportInbox(onConversations: (items: SupportConversation[]) => void, onError?: (error: Error) => void) {
  const inboxQuery = query(collection(requireFirestore(), "supportConversations"), orderBy("updatedAt", "desc"), limit(100));
  return onSnapshot(inboxQuery, (snapshot) => {
    const conversations = snapshot.docs.map((entry) => ({ uid: entry.id, ...entry.data() }) as SupportConversation);
    void Promise.all(conversations.map(async (conversation) => {
      if (conversation.customerPhone?.trim()) return conversation;
      try {
        const profile = await getCustomerProfile(conversation.uid);
        return profile?.phone?.trim() ? { ...conversation, customerPhone: profile.phone } : conversation;
      } catch {
        return conversation;
      }
    })).then(onConversations);
  }, (error) => onError?.(error));
}

export async function sendSupportMessage(input: {
  uid: string; senderUid: string; senderRole: "customer" | "support"; text: string;
  customerName: string; customerEmail: string; customerPhone: string;
}) {
  const text = input.text.trim();
  if (!text || text.length > 2000) throw new Error("اكتب رسالة لا تتجاوز 2000 حرف.");
  const db = requireFirestore();
  const conversationRef = doc(db, "supportConversations", input.uid);
  await addDoc(collection(conversationRef, "messages"), {
    senderUid: input.senderUid, senderRole: input.senderRole, text, createdAt: serverTimestamp(),
  });
  await setDoc(conversationRef, {
    customerName: input.customerName.trim().slice(0, 120), customerEmail: input.customerEmail.trim().slice(0, 160),
    customerPhone: input.customerPhone.trim().slice(0, 24),
    lastMessage: text.slice(0, 240), status: "open", updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToCustomerAccounts(onConfig: (value: CustomerAccountsConfig) => void, onError?: (error: Error) => void) {
  return onSnapshot(doc(requireFirestore(), "siteConfig", "customerAccounts"), (snapshot) => {
    onConfig(snapshot.exists() ? { ...defaultCustomerAccountsConfig, ...snapshot.data() } as CustomerAccountsConfig : defaultCustomerAccountsConfig);
  }, (error) => onError?.(error));
}

export async function getCustomerAccountsConfig(): Promise<CustomerAccountsConfig> {
  const snapshot = await getDoc(doc(requireFirestore(), "siteConfig", "customerAccounts"));
  return snapshot.exists() ? { ...defaultCustomerAccountsConfig, ...snapshot.data() } as CustomerAccountsConfig : defaultCustomerAccountsConfig;
}

export async function saveCustomerAccountsConfig(value: CustomerAccountsConfig) {
  await setDoc(doc(requireFirestore(), "siteConfig", "customerAccounts"), {
    ...value, updatedAt: serverTimestamp(),
  });
}

export const defaultQuantityPromotion: QuantityPromotion = {
  enabled: false, menuItemId: "", buyQuantity: 2, rewardQuantity: 1, rewardPrice: 1,
};

export const defaultAnnouncement: AnnouncementConfig = {
  enabled: false, text: "", style: "simple", backgroundColor: "#093c26", textColor: "#fcd34d",
  startsAt: "", endsAt: "", linkUrl: "", linkLabel: "",
};

export function getEgyptDateTimeLocal(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function isAnnouncementActive(config: AnnouncementConfig | null | undefined, date = new Date()): boolean {
  if (!config?.enabled || !config.text.trim()) return false;
  const current = getEgyptDateTimeLocal(date);
  const start = config.startsAt?.slice(0, 16) ?? "";
  const end = config.endsAt?.slice(0, 16) ?? "";
  return (!start || current >= start) && (!end || current <= end);
}

export function subscribeToAnnouncement(onAnnouncement: (value: AnnouncementConfig | null) => void, onError?: (error: Error) => void) {
  return onSnapshot(doc(requireFirestore(), "siteConfig", "announcement"), (snapshot) => {
    onAnnouncement(snapshot.exists() ? { ...defaultAnnouncement, ...snapshot.data() } as AnnouncementConfig : null);
  }, (error) => onError?.(error));
}

export async function getAnnouncement(): Promise<AnnouncementConfig | null> {
  const snapshot = await getDoc(doc(requireFirestore(), "siteConfig", "announcement"));
  return snapshot.exists() ? { ...defaultAnnouncement, ...snapshot.data() } as AnnouncementConfig : null;
}

export async function saveAnnouncement(value: AnnouncementConfig) {
  await setDoc(doc(requireFirestore(), "siteConfig", "announcement"), {
    ...value, updatedAt: serverTimestamp(),
  });
}

export function subscribeToQuantityPromotion(onPromotion: (value: QuantityPromotion) => void, onError?: (error: Error) => void) {
  return onSnapshot(doc(requireFirestore(), "siteConfig", "quantityPromotion"), (snapshot) => {
    onPromotion(snapshot.exists() ? { ...defaultQuantityPromotion, ...snapshot.data() } as QuantityPromotion : defaultQuantityPromotion);
  }, (error) => onError?.(error));
}

export async function getQuantityPromotion(): Promise<QuantityPromotion> {
  const snapshot = await getDoc(doc(requireFirestore(), "siteConfig", "quantityPromotion"));
  return snapshot.exists() ? { ...defaultQuantityPromotion, ...snapshot.data() } as QuantityPromotion : defaultQuantityPromotion;
}

export async function saveQuantityPromotion(value: QuantityPromotion) {
  if (!Number.isInteger(value.buyQuantity) || value.buyQuantity < 2
    || !Number.isInteger(value.rewardQuantity) || value.rewardQuantity < 1
    || !Number.isFinite(value.rewardPrice) || value.rewardPrice < 0 || (value.enabled && !value.menuItemId)) {
    throw new Error("اختر صنفًا وحدد كميات وأسعار العرض بشكل صحيح.");
  }
  await setDoc(doc(requireFirestore(), "siteConfig", "quantityPromotion"), {
    ...value, updatedAt: serverTimestamp(),
  });
}

export async function getRestaurantOffers(): Promise<SpecialOffer[] | null> {
  const snapshot = await getDoc(doc(requireFirestore(), "siteConfig", "offers"));
  return snapshot.exists() && Array.isArray(snapshot.data().offers) ? snapshot.data().offers as SpecialOffer[] : null;
}

export async function saveRestaurantOffers(offers: SpecialOffer[]) {
  await setDoc(doc(requireFirestore(), "siteConfig", "offers"), {
    offers: stripUndefined(offers), updatedAt: serverTimestamp(),
  }, { merge: true });
}

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface TrackedOrder {
  id: string;
  orderNumber?: string;
  customerUid?: string;
  customerName: string;
  customerPhone: string;
  customerPhone2?: string;
  deliveryMethod: OrderDetails["deliveryMethod"];
  branchId: string;
  branchName: string;
  branchAddress: string;
  manualAddress: string;
  addressDetails: string;
  location: CustomerLocation | null;
  notes: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethod?: string;
  paymentMethodLabel?: string;
  estimatedReadyAtMs?: number;
  status: OrderStatus;
  createdAt?: { toDate: () => Date } | null;
  createdAtMs: number;
}

function requireFirestore() {
  if (!firestore) throw new Error("Firebase غير مهيأ بعد. أضف إعدادات Firebase أولًا.");
  return firestore;
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripUndefined) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, stripUndefined(entry)])
    ) as T;
  }
  return value;
}

export function subscribeToMenu(
  onMenu: (menu: Partial<RestaurantMenu>) => void,
  onError?: (error: Error) => void
) {
  const db = requireFirestore();
  return onSnapshot(
    doc(db, "siteConfig", "menu"),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onMenu({
          categories: Array.isArray(data.categories) ? data.categories : undefined,
          items: Array.isArray(data.items) ? data.items : undefined,
        });
      }
    },
    (error) => onError?.(error)
  );
}

export async function saveRestaurantMenu(menu: RestaurantMenu) {
  const db = requireFirestore();
  await setDoc(
    doc(db, "siteConfig", "menu"),
    { ...stripUndefined(menu), updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getRestaurantSettings(): Promise<RestaurantSettings | null> {
  const snapshot = await getDoc(doc(requireFirestore(), "siteConfig", "restaurant"));
  return snapshot.exists() ? snapshot.data() as RestaurantSettings : null;
}

export function subscribeToSettings(onSettings: (settings: Partial<RestaurantSettings>) => void, onError?: (error: Error) => void) {
  return onSnapshot(doc(requireFirestore(), "siteConfig", "restaurant"), (snapshot) => {
    if (snapshot.exists()) onSettings(snapshot.data() as Partial<RestaurantSettings>);
  }, (error) => onError?.(error));
}

export async function saveRestaurantSettings(settings: RestaurantSettings) {
  await setDoc(doc(requireFirestore(), "siteConfig", "restaurant"), {
    ...stripUndefined(settings), updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToCoupons(onCoupons: (coupons: RestaurantCoupon[]) => void, onError?: (error: Error) => void) {
  return onSnapshot(collection(requireFirestore(), "coupons"), (snapshot) => {
    onCoupons(snapshot.docs.map((entry) => ({ code: entry.id, ...entry.data() }) as RestaurantCoupon));
  }, (error) => onError?.(error));
}

export async function saveRestaurantCoupon(coupon: RestaurantCoupon) {
  const code = coupon.code.trim().toUpperCase();
  if (!code || !Number.isFinite(coupon.value) || coupon.value <= 0
    || (coupon.type === "percentage" && coupon.value > 100)
    || !Number.isFinite(coupon.minOrder) || coupon.minOrder < 0) {
    throw new Error("تأكد من الكود وقيمة الخصم؛ النسبة من 1 إلى 100 والحد الأدنى صفر أو أكثر.");
  }
  await setDoc(doc(requireFirestore(), "coupons", code), { ...coupon, code, updatedAt: serverTimestamp() });
}

export async function deleteRestaurantCoupon(code: string) {
  await deleteDoc(doc(requireFirestore(), "coupons", code.toUpperCase()));
}

export async function getRestaurantCoupon(code: string): Promise<RestaurantCoupon | null> {
  const snapshot = await getDoc(doc(requireFirestore(), "coupons", code.trim().toUpperCase()));
  return snapshot.exists() ? ({ code: snapshot.id, ...snapshot.data() } as RestaurantCoupon) : null;
}

export async function saveImageAsText(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("اختر ملف صورة صالحًا.");
  const imageId = doc(collection(requireFirestore(), "siteImages")).id;
  const dataUrl = await compressImage(file);
  if (dataUrl.length > 700_000) throw new Error("حجم الصورة بعد الضغط كبير؛ اختر صورة أصغر.");
  await setDoc(doc(requireFirestore(), "siteImages", imageId), {
    dataUrl,
    mimeType: dataUrl.slice(5, dataUrl.indexOf(";")),
    updatedAt: serverTimestamp(),
  });
  return `dbimage:${imageId}`;
}

const imageCache = new Map<string, Promise<string>>();
export function resolveDatabaseImage(source?: string): Promise<string> {
  if (!source?.startsWith("dbimage:")) return Promise.resolve(source ?? "");
  const imageId = source.slice("dbimage:".length);
  const cached = imageCache.get(imageId);
  if (cached) return cached;
  const result = getDoc(doc(requireFirestore(), "siteImages", imageId)).then((snapshot) => {
    const dataUrl = snapshot.exists() ? snapshot.data().dataUrl : "";
    return typeof dataUrl === "string" ? dataUrl : "";
  });
  imageCache.set(imageId, result);
  return result;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("صيغة الصورة غير مدعومة."));
      image.onload = () => {
        const scale = Math.min(1, 800 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("تعذر تجهيز الصورة للرفع."));
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/webp", 0.7));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function createTrackedOrder(input: {
  cartItems: CartItem[];
  orderDetails: OrderDetails;
  totalItems: number;
  totalAmount: number;
  discountAmount?: number;
  couponCode?: string;
  paymentMethodLabel?: string;
  estimatedMinutes?: number;
  branchName: string;
  branchAddress: string;
  customerUid?: string;
}): Promise<string> {
  const db = requireFirestore();
  const { orderDetails } = input;
  // Keep Firestore's document ID private and give customers a numeric reference.
  const orderNumber = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
  const result = await addDoc(collection(db, "orders"), {
    orderNumber,
    ...(input.customerUid ? { customerUid: input.customerUid } : {}),
    customerName: orderDetails.customerName.trim(),
    customerPhone: orderDetails.customerPhone.trim(),
    customerPhone2: orderDetails.customerPhone2?.trim() || "",
    deliveryMethod: orderDetails.deliveryMethod,
    branchId: orderDetails.branchId,
    branchName: input.branchName,
    branchAddress: input.branchAddress,
    manualAddress: orderDetails.manualAddress.trim(),
    addressDetails: orderDetails.addressDetails.trim(),
    location: orderDetails.location,
    notes: orderDetails.notes.trim(),
    items: stripUndefined(input.cartItems),
    totalItems: input.totalItems,
    totalAmount: input.totalAmount,
    discountAmount: input.discountAmount ?? 0,
    couponCode: input.couponCode ?? "",
    paymentMethod: orderDetails.paymentMethod ?? "cash_on_delivery",
    paymentMethodLabel: input.paymentMethodLabel ?? "الدفع عند الاستلام",
    estimatedReadyAtMs: Date.now() + Math.max(5, Math.min(240, input.estimatedMinutes ?? defaultCustomerAccountsConfig.estimatedMinutes)) * 60_000,
    status: "new" satisfies OrderStatus,
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
  });
  return orderNumber;
}

export function subscribeToCustomerOrders(uid: string, onOrders: (orders: TrackedOrder[]) => void, onError?: (error: Error) => void) {
  const ordersQuery = query(collection(requireFirestore(), "orders"), where("customerUid", "==", uid), limit(100));
  return onSnapshot(ordersQuery, (snapshot) => {
    const orders = snapshot.docs.map((order) => ({ id: order.id, ...order.data() }) as TrackedOrder);
    orders.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    onOrders(orders);
  }, (error) => onError?.(error));
}

export function subscribeToOrders(
  onOrders: (orders: TrackedOrder[]) => void,
  onError?: (error: Error) => void
) {
  const db = requireFirestore();
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      onOrders(snapshot.docs.map((order) => ({ id: order.id, ...order.data() }) as TrackedOrder));
    },
    (error) => onError?.(error)
  );
}

export async function updateTrackedOrderStatus(orderId: string, status: OrderStatus) {
  const db = requireFirestore();
  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
}

export async function cancelCustomerOrder(orderId: string) {
  await updateDoc(doc(requireFirestore(), "orders", orderId), { status: "cancelled", updatedAt: serverTimestamp() });
}
