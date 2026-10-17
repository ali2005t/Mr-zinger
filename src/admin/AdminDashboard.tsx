import React, { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { LogOut, LockKeyhole, ShoppingBasket, Utensils, Settings, TicketPercent, ChartNoAxesCombined, Gift, Megaphone, UserRound, UsersRound, ChevronLeft, ShieldCheck, Headset } from "lucide-react";
import { MENU_CATEGORIES, MENU_ITEMS } from "../data/menuData";
import { SPECIAL_OFFERS, SpecialOffer } from "../data/offersData";
import { firebaseAuth, isFirebaseConfigured } from "../firebase/client";
import {
  OrderStatus,
  RestaurantMenu,
  subscribeToMenu,
  subscribeToOrders,
  TrackedOrder,
  updateTrackedOrderStatus,
  saveRestaurantMenu,
  RestaurantSettings, RestaurantCoupon, getRestaurantSettings, saveRestaurantSettings,
  subscribeToCoupons, saveRestaurantCoupon, deleteRestaurantCoupon,
  getRestaurantOffers, saveRestaurantOffers,
  AnnouncementConfig, defaultAnnouncement, getAnnouncement, saveAnnouncement,
  QuantityPromotion, defaultQuantityPromotion, getQuantityPromotion, saveQuantityPromotion,
  CustomerAccountsConfig, defaultCustomerAccountsConfig, getCustomerAccountsConfig, saveCustomerAccountsConfig,
  CustomerAccountRecord, subscribeToCustomerProfiles, setCustomerAccountBlocked,
  StaffMember, subscribeToStaffMembers, getStaffMember, saveStaffMember,
} from "../firebase/data";
import { MenuManager } from "./MenuManager";
import { OrdersManager } from "./OrdersManager";
import { defaultRestaurantSettings, RestaurantSettingsManager } from "./RestaurantSettingsManager";
import { CouponsManager } from "./CouponsManager";
import { OffersManager } from "./OffersManager";
import { AnnouncementManager } from "./AnnouncementManager";
import { QuantityPromotionManager } from "./QuantityPromotionManager";
import { ReportsPanel as ReportsDashboard } from "./ReportsPanel";
import { CustomerAccountsManager } from "./CustomerAccountsManager";
import { StaffManager } from "./StaffManager";
import { SupportManager } from "../components/SupportChat";
import { CustomersManager } from "./CustomersManager";

type DashboardTab = "orders" | "menu" | "settings" | "coupons" | "offers" | "reports" | "announcement" | "quantityPromotion" | "customerAccounts" | "customers" | "staff" | "support";
const fallbackMenu: RestaurantMenu = { categories: MENU_CATEGORIES, items: MENU_ITEMS };

function playNewOrderSound() {
  const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  oscillator.frequency.setValueAtTime(1175, context.currentTime + 0.14);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.22, context.currentTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.48);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.5);
  oscillator.onended = () => void context.close();
}

export const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(true);
  const [staffProfile, setStaffProfile] = useState<StaffMember | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [customers, setCustomers] = useState<CustomerAccountRecord[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [tab, setTab] = useState<DashboardTab>("orders");
  const [menu, setMenu] = useState<RestaurantMenu>(fallbackMenu);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingMenu, setSavingMenu] = useState(false);
  const [settings, setSettings] = useState<RestaurantSettings>(defaultRestaurantSettings);
  const [coupons, setCoupons] = useState<RestaurantCoupon[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [offers, setOffers] = useState<SpecialOffer[]>(SPECIAL_OFFERS);
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(defaultAnnouncement);
  const [quantityPromotion, setQuantityPromotion] = useState<QuantityPromotion>(defaultQuantityPromotion);
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccountsConfig>(defaultCustomerAccountsConfig);
  const [orderSoundEnabled, setOrderSoundEnabled] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("mr-zinger-order-sound") === "enabled");
  const soundEnabledRef = useRef(orderSoundEnabled);
  const knownOrderIds = useRef<Set<string> | null>(null);
  const isOwner = user?.email?.toLowerCase() === "mr-zinger@gmail.com";
  const hasPermission = (role: string) => isOwner || (staffProfile?.active === true && staffProfile.roles?.[role as keyof StaffMember["roles"]] === true);
  const canViewOrders = hasPermission("orders");
  const canViewReports = hasPermission("reports");
  const allTabs: [DashboardTab, typeof ShoppingBasket, string, string][] = [
    ["orders", ShoppingBasket, "الطلبات", "orders"], ["menu", Utensils, "المنيو", "menu"],
    ["reports", ChartNoAxesCombined, "التقارير", "reports"], ["settings", Settings, "الفروع والتوصيل", "settings"],
    ["coupons", TicketPercent, "الكوبونات", "coupons"], ["offers", Gift, "العروض", "offers"],
    ["quantityPromotion", Gift, "عروض الكمية", "promotions"], ["announcement", Megaphone, "الإعلان", "announcement"],
    ["customerAccounts", UserRound, "حسابات العملاء", "settings"],
    ["customers", UsersRound, "بيانات العملاء", "owner"],
    ["support", Headset, "دعم العملاء", "support"],
  ];
  if (isOwner) allTabs.push(["staff", UsersRound, "الموظفون والصلاحيات", "owner"]);
  const availableTabs = allTabs.filter((item) => item[3] === "owner" ? isOwner : hasPermission(item[3]));
  const tabGroups: { label: string; keys: DashboardTab[] }[] = [
    { label: "متابعة التشغيل", keys: ["orders", "reports"] },
    { label: "إدارة المحتوى", keys: ["menu", "offers", "quantityPromotion", "announcement"] },
    { label: "إعدادات الموقع", keys: ["settings", "coupons", "customerAccounts"] },
    { label: "خدمة العملاء", keys: ["support"] },
    { label: "العملاء", keys: ["customers"] },
    ...(isOwner ? [{ label: "الفريق", keys: ["staff"] as DashboardTab[] }] : []),
  ];

  useEffect(() => {
    soundEnabledRef.current = orderSoundEnabled;
    window.localStorage.setItem("mr-zinger-order-sound", orderSoundEnabled ? "enabled" : "disabled");
  }, [orderSoundEnabled]);

  useEffect(() => {
    if (!firebaseAuth) {
      setAuthLoading(false);
      return;
    }
    return onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setStaffProfile(null);
      setAccessLoading(Boolean(currentUser && currentUser.email?.toLowerCase() !== "mr-zinger@gmail.com"));
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) { setStaffProfile(null); setAccessLoading(false); return; }
    if (user.email?.toLowerCase() === "mr-zinger@gmail.com") { setStaffProfile(null); setAccessLoading(false); return; }
    let active = true;
    setAccessLoading(true);
    getStaffMember(user.uid).then((member) => { if (active) setStaffProfile(member); })
      .catch((error) => { if (active) setNotice(error instanceof Error ? error.message : "تعذر التحقق من صلاحيات الموظف."); })
      .finally(() => { if (active) setAccessLoading(false); });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!isOwner || !isFirebaseConfigured) return;
    return subscribeToStaffMembers(setStaffMembers, (error) => setNotice(`تعذر تحميل الموظفين: ${error.message}`));
  }, [isOwner]);

  useEffect(() => {
    if (!isOwner || !isFirebaseConfigured) return;
    setCustomersLoading(true);
    return subscribeToCustomerProfiles((items) => { setCustomers(items); setCustomersLoading(false); }, (error) => { setNotice(`تعذر تحميل حسابات العملاء: ${error.message}`); setCustomersLoading(false); });
  }, [isOwner]);

  useEffect(() => {
    if (availableTabs.length && !availableTabs.some(([key]) => key === tab)) setTab(availableTabs[0][0]);
  }, [staffProfile, user, tab]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMenu(
      (remoteMenu) => setMenu((current) => ({ ...current, ...remoteMenu })),
      (error) => setNotice(`تعذر تحميل المنيو: ${error.message}`)
    );
  }, []);

  useEffect(() => {
    if (!user || !isFirebaseConfigured || (!canViewOrders && !canViewReports)) return;
    setOrdersLoading(true);
    return subscribeToOrders(
      (nextOrders) => {
        if (knownOrderIds.current && soundEnabledRef.current && nextOrders.some((order) => !knownOrderIds.current?.has(order.id))) {
          playNewOrderSound();
        }
        knownOrderIds.current = new Set(nextOrders.map((order) => order.id));
        setOrders(nextOrders);
        setOrdersLoading(false);
        setOrdersError("");
      },
      (error) => {
        setOrdersError(`${error.message} راجع قواعد Firestore وتأكد من إضافة بريد المدير.`);
        setOrdersLoading(false);
      }
    );
  }, [user, canViewOrders, canViewReports]);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    getRestaurantSettings().then((remote) => { if (remote) setSettings(remote); }).catch((error) => setNotice(error.message));
    getRestaurantOffers().then((remote) => { if (remote) setOffers(remote); }).catch((error) => setNotice(error.message));
    getAnnouncement().then((remote) => { if (remote) setAnnouncement(remote); }).catch((error) => setNotice(error.message));
    getQuantityPromotion().then(setQuantityPromotion).catch((error) => setNotice(error.message));
    getCustomerAccountsConfig().then(setCustomerAccounts).catch((error) => setNotice(error.message));
    if (hasPermission("coupons")) return subscribeToCoupons(setCoupons, (error) => setNotice(error.message));
  }, [user, staffProfile]);

  const handleSaveMenu = async (nextMenu: RestaurantMenu) => {
    setSavingMenu(true);
    setNotice("");
    try {
      await saveRestaurantMenu(nextMenu);
      setMenu(nextMenu);
      setNotice("تم حفظ المنيو وتحديثه على الموقع.");
    } catch (error) {
      throw error;
    } finally {
      setSavingMenu(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setOrdersError("");
    try {
      await updateTrackedOrderStatus(orderId, status);
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : "تعذر تحديث حالة الطلب.");
    }
  };

  const handleToggleOrderSound = () => {
    const nextEnabled = !orderSoundEnabled;
    setOrderSoundEnabled(nextEnabled);
    if (nextEnabled) playNewOrderSound();
  };

  const handleSaveSettings = async (next: RestaurantSettings) => {
    setSavingSettings(true);
    try { await saveRestaurantSettings(next); setSettings(next); }
    finally { setSavingSettings(false); }
  };

  if (authLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#f6f4ee] text-sm text-stone-500">جارٍ التحقق من تسجيل الدخول…</div>;
  }

  if (!user) {
    return <AdminLogin onLogin={setUser} />;
  }

  if (accessLoading) {
    return <div dir="rtl" className="grid min-h-screen place-items-center bg-[#f6f4ee] text-sm text-stone-500">جارٍ التحقق من صلاحيات الحساب…</div>;
  }

  if (!isOwner && !staffProfile?.active) {
    return <div dir="rtl" className="grid min-h-screen place-items-center bg-[#f6f4ee] p-4"><section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 text-center shadow-xl"><ShieldCheck className="mx-auto h-10 w-10 text-amber-600"/><h1 className="mt-3 text-xl font-black">الحساب غير مفعّل للوحة الإدارة</h1><p className="mt-2 text-sm leading-6 text-stone-500">اطلب من مالك المطعم إضافة حسابك وتحديد صلاحياتك.</p><button onClick={() => firebaseAuth && signOut(firebaseAuth)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white"><LogOut className="h-4 w-4"/>تسجيل الخروج</button></section></div>;
  }

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-[#f6f4ee] text-stone-900">
      <header className="border-b border-emerald-950/10 bg-[#0d5335] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img src="/mr-zinger-logo.jpg" alt="" className="h-9 w-9 shrink-0 sm:h-11 sm:w-11" />
            <div><h1 className="truncate text-sm font-black sm:text-base">لوحة مستر زنجر</h1><p className="mt-0.5 hidden text-[11px] text-emerald-100 sm:block">إدارة المنيو والطلبات</p></div>
          </a>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-48 truncate text-xs text-emerald-100 md:inline" dir="ltr">{user.email}</span>
            <button onClick={() => firebaseAuth && signOut(firebaseAuth)} className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-2 text-xs font-bold hover:bg-white/20 sm:gap-2 sm:px-3"><LogOut className="h-4 w-4" /> خروج</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <section className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-950 via-emerald-800 to-emerald-700 p-4 text-white shadow-lg sm:mb-6 sm:rounded-3xl sm:p-7">
          <p className="text-xs font-bold text-emerald-100">مستر زنجر · لوحة الإدارة</p>
          <h2 className="mt-2 text-xl font-black sm:text-3xl">أهلًا وسهلًا بك{user.displayName ? `، ${user.displayName}` : " يا صديقي"} 👋</h2>
          <p className="mt-2 text-xs leading-5 text-emerald-50 sm:max-w-2xl sm:text-sm sm:leading-6">من هنا تقدر تدير طلبات المطعم وتحدّث المنيو والأسعار والصور، وتراجع التقارير والعروض بسهولة.</p>
        </section>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <aside className="min-w-0 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm lg:sticky lg:top-4 lg:p-3">
            <div className="hidden border-b border-stone-100 px-3 pb-3 pt-2 lg:block"><p className="text-[11px] font-bold text-stone-400">القائمة الرئيسية</p><p className="mt-1 font-black text-emerald-950">إدارة المطعم</p></div>
            <nav aria-label="صفحات لوحة الإدارة" className="flex gap-1 overflow-x-auto lg:mt-2 lg:flex-col lg:overflow-visible">
              {tabGroups.filter((group) => availableTabs.some(([key]) => group.keys.includes(key))).map((group) => <div key={group.label} className="flex shrink-0 gap-1 lg:w-full lg:flex-col lg:border-b lg:border-stone-100 lg:pb-2 lg:last:border-0"><p className="hidden px-3 pb-1 pt-2 text-[10px] font-bold text-stone-400 lg:block">{group.label}</p>{availableTabs.filter(([key]) => group.keys.includes(key)).map(([key, Icon, label]) => <button key={key} onClick={() => setTab(key)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-right text-xs font-black transition-colors sm:text-sm lg:w-full ${tab === key ? "bg-emerald-800 text-white shadow-sm" : "text-stone-600 hover:bg-emerald-50 hover:text-emerald-900"}`}><Icon className="h-4 w-4 shrink-0" />{label}<ChevronLeft className={`mr-auto hidden h-4 w-4 lg:block ${tab === key ? "opacity-100" : "opacity-0"}`} /></button>)}</div>)}
            </nav>
            <div className="mt-3 hidden rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-500 lg:block"><span className="font-bold text-emerald-900">{isOwner ? "حساب المالك" : "حساب موظف"}</span><br/>{isOwner ? "كل إعدادات المطعم وإدارة المستخدمين متاحة." : "تظهر لك الأقسام التي منحك المالك صلاحيتها."}</div>
          </aside>
          <div className="min-w-0">
        {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</div>}
        {tab === "menu" ? <MenuManager menu={menu} saving={savingMenu} saveMenu={handleSaveMenu} />
          : tab === "orders" ? <OrdersManager orders={orders} loading={ordersLoading} error={ordersError} onStatusChange={handleStatusChange} soundEnabled={orderSoundEnabled} onToggleSound={handleToggleOrderSound} />
          : tab === "settings" ? <RestaurantSettingsManager settings={settings} saving={savingSettings} onSave={handleSaveSettings} />
          : tab === "coupons" ? <CouponsManager coupons={coupons} onSave={saveRestaurantCoupon} onDelete={deleteRestaurantCoupon} />
          : tab === "offers" ? <OffersManager offers={offers} onSave={async (next) => { await saveRestaurantOffers(next); setOffers(next); }} />
          : tab === "announcement" ? <AnnouncementManager value={announcement} onSave={async (next) => { await saveAnnouncement(next); setAnnouncement(next); }} />
          : tab === "quantityPromotion" ? <QuantityPromotionManager items={menu.items} value={quantityPromotion} onSave={async (next) => { await saveQuantityPromotion(next); setQuantityPromotion(next); }} />
          : tab === "customerAccounts" ? <CustomerAccountsManager value={customerAccounts} onSave={async (next) => { await saveCustomerAccountsConfig(next); setCustomerAccounts(next); }} />
          : tab === "customers" && isOwner ? <CustomersManager customers={customers} loading={customersLoading} onSetBlocked={setCustomerAccountBlocked} />
          : tab === "staff" && isOwner ? <StaffManager members={staffMembers} onSave={saveStaffMember} />
          : tab === "support" && hasPermission("support") ? <SupportManager currentUserUid={user.uid} />
          : <ReportsDashboard orders={orders} />}
          </div>
        </div>

      </main>
      <footer className="border-t border-stone-200 bg-white/70 px-4 py-4 text-center text-[11px] font-semibold tracking-wide text-stone-500" dir="ltr">
        Powered by <span className="font-black text-emerald-800">ASAS Software Solutions</span>
      </footer>
    </div>
  );
};

function ReportsPanel({ orders }: { orders: TrackedOrder[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => order.createdAtMs >= today.getTime() && order.status !== "cancelled");
  const revenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const popular = new Map<string, number>();
  orders.forEach((order) => order.items?.forEach((item) => popular.set(item.name, (popular.get(item.name) ?? 0) + item.quantity)));
  const topItems = [...popular.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return <section className="space-y-5"><div><h2 className="text-xl font-black">تقارير الطلبات</h2><p className="mt-1 text-sm text-stone-500">ملخص مباشر لآخر 100 طلب محفوظ.</p></div><div className="grid gap-3 sm:grid-cols-3"><Metric label="طلبات اليوم" value={todayOrders.length} /><Metric label="مبيعات اليوم" value={`${revenue} جنيه`} /><Metric label="طلبات جديدة" value={orders.filter((order) => order.status === "new").length} /></div><div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="mb-3 font-black">الأصناف الأكثر طلبًا</h3>{topItems.length ? topItems.map(([name, count]) => <div key={name} className="flex justify-between border-t border-stone-100 py-2 text-sm"><span>{name}</span><strong>{count} قطعة</strong></div>) : <p className="text-sm text-stone-500">لا توجد بيانات طلبات حتى الآن.</p>}</div></section>;
}
function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl border border-stone-200 bg-white p-5"><p className="text-sm text-stone-500">{label}</p><strong className="mt-2 block text-2xl font-black text-emerald-900">{value}</strong></div>;
}

function AdminLogin({ onLogin }: { onLogin: (user: User | null) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseAuth) return;
    setLoading(true);
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      onLogin(credential.user);
    } catch (cause) {
      const code = (cause as { code?: string }).code;
      setError(code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found"
        ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        : cause instanceof Error ? cause.message : "تعذر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,_#e3efe7,_#f6f4ee_55%)] p-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/mr-zinger-logo.jpg" alt="شعار مستر زنجر" className="mb-4 h-20 w-20" />
          <h1 className="text-2xl font-black text-stone-900">لوحة إدارة مستر زنجر</h1>
          <p className="mt-2 text-sm text-stone-500">سجّل الدخول بالبريد وكلمة المرور لمتابعة المنيو والطلبات.</p>
        </div>

        {!isFirebaseConfigured && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">أضف إعدادات تطبيق Firebase إلى ملف <bdi dir="ltr">.env.local</bdi> ثم أعد تشغيل الموقع لتفعيل لوحة الإدارة.</div>}
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">البريد الإلكتروني</span><input required type="email" autoComplete="username" dir="ltr" className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-emerald-700" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="block"><span className="mb-1.5 block text-xs font-bold text-stone-600">كلمة المرور</span><input required type="password" autoComplete="current-password" dir="ltr" className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-emerald-700" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button disabled={!isFirebaseConfigured || loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-black text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"><LockKeyhole className="h-4 w-4" />{loading ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}</button>
        </form>

        <a href="/" className="mt-5 block text-center text-xs font-bold text-emerald-800 hover:underline">العودة إلى موقع المطعم</a>
      </div>
    </div>
  );
}
