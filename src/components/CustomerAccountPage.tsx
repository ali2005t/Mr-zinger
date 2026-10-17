import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { ArrowRight, LogOut, PackageCheck, UserRound, MapPin, Save, Mail, LockKeyhole, Eye, EyeOff, Sparkles, Headset, CreditCard, Settings, Clock3, MessageCircle, Moon } from "lucide-react";
import { firebaseAuth, isFirebaseConfigured } from "../firebase/client";
import { CustomerAccountsConfig, CustomerProfile, defaultCustomerAccountsConfig, OrderStatus, cancelCustomerOrder, getCustomerProfile, saveCustomerProfile, subscribeToCustomerAccounts, subscribeToCustomerOrders, TrackedOrder } from "../firebase/data";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import { OrderProgress } from "./OrderProgress";
import { CustomerSupportChat, SupportWidget } from "./SupportChat";

const blankProfile = (): CustomerProfile => ({ name: "", phone: "", phone2: "", deliveryMethod: "delivery", branchId: RESTAURANT_CONFIG.branches[0]?.id ?? "", manualAddress: "", addressDetails: "", location: null, paymentMethod: "cash_on_delivery" });

const statusLabels: Record<OrderStatus, string> = {
  new: "\u062c\u062f\u064a\u062f",
  preparing: "\u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632",
  ready: "\u062c\u0627\u0647\u0632 \u0644\u0644\u0627\u0633\u062a\u0644\u0627\u0645",
  out_for_delivery: "\u062e\u0631\u062c \u0644\u0644\u062a\u0648\u0635\u064a\u0644",
  completed: "\u0645\u0643\u062a\u0645\u0644",
  cancelled: "\u0645\u0644\u063a\u064a",
};

export const CustomerAccountPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [accountConfig, setAccountConfig] = useState<CustomerAccountsConfig>(defaultCustomerAccountsConfig);
  const [register, setRegister] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<CustomerProfile>(blankProfile);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [activeSection, setActiveSection] = useState<"orders" | "profile" | "address" | "payments" | "settings" | "support">("orders");
  const [darkMode, setDarkMode] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("mr-zinger-customer-dark") === "on");
  const [blockedAccount, setBlockedAccount] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState("");
  const paymentMethods = (accountConfig.paymentMethods ?? defaultCustomerAccountsConfig.paymentMethods).filter((method) => method.enabled);

  useEffect(() => {
    if (!firebaseAuth) { setAuthLoading(false); return; }
    return onAuthStateChanged(firebaseAuth, (currentUser) => { setUser(currentUser); if (currentUser) setBlockedAccount(false); setAuthLoading(false); });
  }, []);
  useEffect(() => isFirebaseConfigured ? subscribeToCustomerAccounts(setAccountConfig) : undefined, []);
  useEffect(() => {
    if (!user) { setOrders([]); return; }
    return subscribeToCustomerOrders(user.uid, setOrders, (cause) => setError(cause.message));
  }, [user]);
  useEffect(() => {
    if (!orders.length || !window.location.hash.startsWith("#order-")) return;
    const timer = window.setTimeout(() => document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    return () => window.clearTimeout(timer);
  }, [orders]);
  useEffect(() => {
    if (!user) { setProfile(blankProfile()); return; }
    let active = true;
    setProfileLoading(true);
    getCustomerProfile(user.uid).then(async (saved) => {
      if (!active) return;
      if (saved) {
        setProfile({ ...blankProfile(), ...saved });
        if (saved.blocked) { setBlockedAccount(true); void signOut(firebaseAuth!); }
      } else {
        const initialProfile = { ...blankProfile(), email: user.email || "" };
        await saveCustomerProfile(user.uid, initialProfile);
        if (active) setProfile(initialProfile);
      }
    })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "تعذر تحميل ملفك الشخصي."); })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [user]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseAuth) return;
    setBusy(true);
    setError("");
    try {
      if (forgotPassword) {
        await sendPasswordResetEmail(firebaseAuth, email.trim());
        setResetSent(true);
        return;
      }
      if (register && password !== confirmPassword) {
        setError("كلمتا المرور غير متطابقتين.");
        return;
      }
      if (register && !accountConfig.enabled) {
        setError("\u062a\u0633\u062c\u064a\u0644 \u062d\u0633\u0627\u0628\u0627\u062a \u062c\u062f\u064a\u062f\u0629 \u0645\u0648\u0642\u0641 \u062d\u0627\u0644\u064a\u064b\u0627.");
        return;
      }
      if (register) await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      else await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    } catch (cause) {
      const code = (cause as { code?: string }).code;
      const message = code === "auth/email-already-in-use" ? "هذا البريد مسجل من قبل. جرب تسجيل الدخول."
        : code === "auth/weak-password" ? "كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل."
        : code === "auth/invalid-email" ? "اكتب بريدًا إلكترونيًا صحيحًا."
        : code === "auth/user-not-found" ? "لا يوجد حساب بهذا البريد الإلكتروني."
        : "تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.";
      setError(message);
    } finally { setBusy(false); }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !profile.name.trim() || !profile.phone.trim()) { setProfileMessage("اكتب اسمك ورقم هاتفك لحفظ الملف."); return; }
    setSavingProfile(true); setProfileMessage("");
    try { await saveCustomerProfile(user.uid, { ...profile, email: user.email || "", name: profile.name.trim(), phone: profile.phone.trim(), phone2: profile.phone2.trim() }); setProfileMessage("تم حفظ بياناتك، وستظهر تلقائيًا في طلبك القادم."); }
    catch (cause) { setProfileMessage(cause instanceof Error ? cause.message : "تعذر حفظ بياناتك."); }
    finally { setSavingProfile(false); }
  };

  const updateProfile = (patch: Partial<CustomerProfile>) => { setProfile((current) => ({ ...current, ...patch })); setProfileMessage(""); };

  useEffect(() => { window.localStorage.setItem("mr-zinger-customer-dark", darkMode ? "on" : "off"); }, [darkMode]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("هل تريد إلغاء الطلب؟ يمكنك إلغاؤه قبل بدء التجهيز فقط.")) return;
    setCancellingOrderId(orderId);
    try { await cancelCustomerOrder(orderId); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر إلغاء الطلب."); }
    finally { setCancellingOrderId(""); }
  };

  if (authLoading) return <main dir="rtl" className="grid min-h-screen place-items-center bg-[#f7f6f0] p-4"><div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-stone-500 shadow-sm"><img src="/mr-zinger-logo.jpg" alt="" className="h-9 w-9 rounded-full"/>جارٍ تجهيز حسابك…</div></main>;

  return <><main dir="rtl" className={`min-h-screen bg-[#f7f6f0] px-4 py-8 text-stone-900 sm:py-14 ${darkMode ? "customer-account-dark" : ""}`}>
    <div className="mx-auto max-w-3xl">
      <a href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-800"><ArrowRight className="h-4 w-4" />العودة للمطعم</a>
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800"><PackageCheck className="h-6 w-6" /></span><div><h1 className="text-2xl font-black">حسابي وطلباتي</h1><p className="mt-1 text-sm text-stone-500">تابع حالة طلباتك من مستر زنجر</p></div></div>
        {!isFirebaseConfigured && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">خدمة الحسابات غير متاحة حاليًا.</p>}
        {blockedAccount && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">تم إيقاف هذا الحساب. تواصل مع المطعم لمراجعة الأمر.</p>}
        {!user ? <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative hidden min-h-[520px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#073c29] via-[#0d5335] to-[#16704a] p-8 text-white lg:flex">
            <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full border border-white/10"/><div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full border border-white/10"/>
            <div className="relative"><img src="/mr-zinger-logo.jpg" alt="شعار مستر زنجر" className="h-16 w-16 rounded-full border-2 border-amber-300 bg-white object-cover"/><p className="mt-5 text-xs font-black tracking-widest text-amber-300">MR. ZINGER · SINCE 2019</p><h2 className="mt-2 text-3xl font-black leading-tight">كل طلباتك<br/>في مكان واحد</h2><p className="mt-3 max-w-xs text-sm leading-7 text-emerald-50">احفظ بياناتك مرة واحدة، تابع تجهيز طلبك، وكلم دعم المطعم لو احتجت مساعدة.</p></div>
            <div className="relative space-y-3 text-sm font-semibold text-emerald-50"><p className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-amber-300"/>تحديث مباشر لحالة الطلب</p><p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-300"/>عنوانك وبياناتك محفوظة</p><p className="flex items-center gap-2"><Headset className="h-4 w-4 text-amber-300"/>دعم المطعم في محادثة واحدة</p></div>
          </aside>
          <form onSubmit={submit} className="space-y-5 p-5 sm:p-8 lg:p-10">
            <div className="mb-2 flex items-center gap-3 lg:hidden"><img src="/mr-zinger-logo.jpg" alt="" className="h-12 w-12 rounded-full border border-amber-300 bg-white object-cover"/><div><p className="text-[10px] font-black tracking-wider text-emerald-800">MR. ZINGER · SINCE 2019</p><h2 className="font-black">حسابك في مستر زنجر</h2></div></div>
            <div><p className="text-xs font-bold text-emerald-800">{forgotPassword ? "استعادة الحساب" : register ? "انضم لعملائنا" : "أهلًا بعودتك"}</p><h2 className="mt-1 text-2xl font-black">{forgotPassword ? "نسيت كلمة المرور؟" : register ? "إنشاء حساب عميل" : "سجّل دخولك"}</h2><p className="mt-2 text-sm leading-6 text-stone-500">{forgotPassword ? "اكتب بريدك، وهنبعتلك رابطًا آمنًا لإنشاء كلمة مرور جديدة." : register ? "أنشئ حسابك لمتابعة طلباتك وحفظ بيانات التوصيل." : "تابع طلباتك واطلب مرة أخرى ببياناتك المحفوظة."}</p></div>
            {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {resetSent && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">لو البريد مسجل عندنا، هيوصلك رابط استعادة كلمة المرور. راجع صندوق الوارد والرسائل غير المرغوب فيها.</p>}
            <label className="block text-xs font-bold text-stone-700"><span className="mb-1.5 flex items-center gap-1.5"><Mail className="h-4 w-4 text-emerald-800"/>البريد الإلكتروني</span><input required type="email" autoComplete="email" dir="ltr" value={email} onChange={(event) => { setEmail(event.target.value); setResetSent(false); }} placeholder="name@example.com" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-left text-sm font-normal outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"/></label>
            {!forgotPassword && <><label className="block text-xs font-bold text-stone-700"><span className="mb-1.5 flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-emerald-800"/>كلمة المرور</span><span className="flex rounded-xl border border-stone-200 bg-stone-50 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-700/10"><input required minLength={6} type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} dir="ltr" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6 أحرف أو أكثر" className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-left text-sm font-normal outline-none"/><button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-stone-500" aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button></span></label>
              {register && <label className="block text-xs font-bold text-stone-700">تأكيد كلمة المرور<input required minLength={6} type={showPassword ? "text" : "password"} autoComplete="new-password" dir="ltr" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3 text-left text-sm font-normal outline-none focus:border-emerald-700 focus:bg-white"/></label>}
              {!register && <button type="button" onClick={() => { setForgotPassword(true); setError(""); setResetSent(false); }} className="text-xs font-bold text-emerald-800 hover:underline">نسيت كلمة المرور؟</button>}
            </>}
            <button disabled={!isFirebaseConfigured || busy || (forgotPassword && resetSent)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-900 disabled:opacity-50">{busy ? "جارٍ تنفيذ طلبك…" : forgotPassword ? "إرسال رابط الاستعادة" : register ? <><Sparkles className="h-4 w-4"/>إنشاء الحساب</> : "تسجيل الدخول"}</button>
            <div className="border-t border-stone-100 pt-4 text-center">{forgotPassword ? <button type="button" onClick={() => { setForgotPassword(false); setError(""); setResetSent(false); }} className="text-sm font-bold text-emerald-800 hover:underline">العودة لتسجيل الدخول</button> : accountConfig.enabled ? <button type="button" onClick={() => { setRegister((value) => !value); setConfirmPassword(""); setError(""); }} className="text-sm font-bold text-stone-600">{register ? "لديك حساب بالفعل؟ " : "ليس لديك حساب؟ "}<span className="text-emerald-800 underline">{register ? "سجّل الدخول" : "أنشئ حسابًا"}</span></button> : <p className="text-xs text-stone-500">إنشاء الحسابات متوقف حاليًا من إدارة المطعم.</p>}</div>
            <p className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400"><LockKeyhole className="h-3 w-3"/>بياناتك محفوظة بأمان ولا يطلع عليها غيرك.</p>
          </form>
        </div> : <div>
          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-emerald-900 p-4 text-white"><div><p className="font-black">{profile.name || user.displayName || "حساب العميل"}</p><p className="mt-1 text-sm text-emerald-100" dir="ltr">{profile.phone || "أضف رقم هاتفك من بيانات الملف الشخصي"}</p></div><button onClick={() => firebaseAuth && void signOut(firebaseAuth)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">خروج</button></div>
          {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-stone-200 bg-stone-50 p-3"><p className="mb-3 px-3 text-xs font-black text-stone-400">قائمة الحساب</p><nav aria-label="قائمة حساب العميل" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col">
              <button onClick={() => setActiveSection("orders")} className={activeSection === "orders" ? "min-w-max rounded-xl bg-emerald-800 px-3 py-3 text-right text-xs font-black text-white lg:w-full" : "min-w-max rounded-xl px-3 py-3 text-right text-xs font-bold text-stone-600 hover:bg-white lg:w-full"}><PackageCheck className="ml-2 inline h-4 w-4"/>طلباتي ({orders.length})</button>
              <button onClick={() => setActiveSection("profile")} className={activeSection === "profile" ? "min-w-max rounded-xl bg-emerald-800 px-3 py-3 text-right text-xs font-black text-white lg:w-full" : "min-w-max rounded-xl px-3 py-3 text-right text-xs font-bold text-stone-600 hover:bg-white lg:w-full"}><UserRound className="ml-2 inline h-4 w-4"/>بيانات الملف الشخصي</button>
              <button onClick={() => setActiveSection("address")} className={activeSection === "address" ? "min-w-max rounded-xl bg-emerald-800 px-3 py-3 text-right text-xs font-black text-white lg:w-full" : "min-w-max rounded-xl px-3 py-3 text-right text-xs font-bold text-stone-600 hover:bg-white lg:w-full"}><MapPin className="ml-2 inline h-4 w-4"/>العنوان</button>
              <button onClick={() => setActiveSection("payments")} className={activeSection === "payments" ? "min-w-max rounded-xl bg-emerald-800 px-3 py-3 text-right text-xs font-black text-white lg:w-full" : "min-w-max rounded-xl px-3 py-3 text-right text-xs font-bold text-stone-600 hover:bg-white lg:w-full"}><CreditCard className="ml-2 inline h-4 w-4"/>طرق الدفع</button>
              <button onClick={() => setActiveSection("settings")} className={activeSection === "settings" ? "min-w-max rounded-xl bg-emerald-800 px-3 py-3 text-right text-xs font-black text-white lg:w-full" : "min-w-max rounded-xl px-3 py-3 text-right text-xs font-bold text-stone-600 hover:bg-white lg:w-full"}><Settings className="ml-2 inline h-4 w-4"/>الإعدادات</button>
              <button onClick={() => setActiveSection("support")} className={activeSection === "support" ? "min-w-max rounded-xl bg-emerald-800 px-3 py-3 text-right text-xs font-black text-white lg:w-full" : "min-w-max rounded-xl px-3 py-3 text-right text-xs font-bold text-stone-600 hover:bg-white lg:w-full"}><MessageCircle className="ml-2 inline h-4 w-4"/>الدعم الفني</button>
            </nav></aside>
            <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
              {activeSection === "orders" && <section><div className="mb-5 flex items-center gap-3"><Clock3 className="h-5 w-5 text-emerald-800"/><div><h2 className="text-lg font-black">طلباتي</h2><p className="mt-1 text-xs text-stone-500">تابع حالة طلباتك وتفاصيلها.</p></div></div>{!orders.length ? <p className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">لا توجد طلبات مرتبطة بحسابك حتى الآن.</p> : <div className="space-y-3">{orders.map((order) => <article id={"order-" + order.orderNumber} key={order.id} className="scroll-mt-5 rounded-2xl border border-stone-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong>طلب رقم <bdi dir="ltr">{order.orderNumber}</bdi></strong><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black">{statusLabels[order.status] ?? statusLabels.new}</span></div><p className="mt-2 text-sm text-stone-600">{order.items.map((item) => item.name + " × " + item.quantity).join("، ")}</p><p className="mt-1 text-sm font-bold">{order.totalAmount} جنيه · {order.branchName}</p><p className="mt-1 text-xs text-stone-500">الدفع: {order.paymentMethodLabel || "الدفع عند الاستلام"}</p>{order.manualAddress && <p className="mt-1 text-xs text-stone-500">عنوان التوصيل: {order.manualAddress}</p>}<div className="mt-4"><OrderProgress order={order}/></div>{order.status === "new" && <button disabled={cancellingOrderId === order.id} onClick={() => void handleCancelOrder(order.id)} className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 disabled:opacity-50">{cancellingOrderId === order.id ? "جارٍ الإلغاء…" : "إلغاء الطلب"}</button>}</article>)}</div>}</section>}
              {activeSection !== "orders" && activeSection !== "settings" && <form onSubmit={saveProfile} className="space-y-4">
                {activeSection === "profile" && <><div><h2 className="text-lg font-black">بيانات الملف الشخصي</h2><p className="mt-1 text-xs text-stone-500">الاسم وأرقام التواصل التي ستظهر في طلباتك.</p></div>{profileLoading ? <p className="text-sm text-stone-500">جارٍ تحميل بياناتك…</p> : <><label className="block text-xs font-bold text-stone-600">الاسم بالكامل<input required value={profile.name} onChange={(event) => updateProfile({ name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"/></label><label className="block text-xs font-bold text-stone-600">رقم الهاتف<input required type="tel" dir="ltr" value={profile.phone} onChange={(event) => updateProfile({ phone: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-left text-sm"/></label><label className="block text-xs font-bold text-stone-600">رقم بديل (اختياري)<input type="tel" dir="ltr" value={profile.phone2} onChange={(event) => updateProfile({ phone2: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-left text-sm"/></label></>}</>}
                {activeSection === "address" && <><div><h2 className="text-lg font-black">العنوان والتوصيل</h2><p className="mt-1 text-xs text-stone-500">احفظ عنوانك وطريقة الاستلام المفضلة.</p></div><label className="block text-xs font-bold text-stone-600">الفرع المفضل<select value={profile.branchId} onChange={(event) => updateProfile({ branchId: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm">{RESTAURANT_CONFIG.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => updateProfile({ deliveryMethod: "delivery" })} className={profile.deliveryMethod === "delivery" ? "rounded-xl bg-emerald-800 px-3 py-2.5 text-sm font-bold text-white" : "rounded-xl border px-3 py-2.5 text-sm font-bold"}>توصيل للعنوان</button><button type="button" onClick={() => updateProfile({ deliveryMethod: "pickup" })} className={profile.deliveryMethod === "pickup" ? "rounded-xl bg-emerald-800 px-3 py-2.5 text-sm font-bold text-white" : "rounded-xl border px-3 py-2.5 text-sm font-bold"}>استلام من الفرع</button></div><label className="block text-xs font-bold text-stone-600">عنوانك المحفوظ<input value={profile.manualAddress} onChange={(event) => updateProfile({ manualAddress: event.target.value })} placeholder="الشارع، رقم العمارة، علامة مميزة" className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"/></label><label className="block text-xs font-bold text-stone-600">تفاصيل إضافية للعنوان<textarea rows={3} value={profile.addressDetails} onChange={(event) => updateProfile({ addressDetails: event.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"/></label></>}
                {activeSection === "payments" && <><div><h2 className="text-lg font-black">طرق الدفع</h2><p className="mt-1 text-xs text-stone-500">حدد طريقة الدفع المفضلة للطلبات القادمة.</p></div>{paymentMethods.length ? <div className="space-y-2">{paymentMethods.map((method) => <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 hover:bg-emerald-50"><input type="radio" name="customer-payment-method" checked={profile.paymentMethod === method.id} onChange={() => updateProfile({ paymentMethod: method.id })} className="accent-emerald-800"/><strong className="text-sm">{method.label}</strong></label>)}</div> : <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">لا توجد طرق دفع مفعّلة حاليًا.</p>}</>}
                {profileMessage && <p role="status" className="text-xs font-bold text-emerald-800">{profileMessage}</p>}<button disabled={savingProfile || profileLoading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50"><Save className="h-4 w-4"/>{savingProfile ? "جارٍ الحفظ…" : "حفظ التعديلات"}</button>
              </form>}
              {activeSection === "settings" && <section className="space-y-5"><div><h2 className="text-lg font-black">الإعدادات</h2><p className="mt-1 text-xs text-stone-500">خصص مظهر حسابك وراجع بيانات الدخول.</p></div><button type="button" aria-pressed={darkMode} onClick={() => setDarkMode((value) => !value)} className="flex w-full items-center justify-between rounded-xl border border-stone-200 p-4 text-right hover:bg-stone-50"><span><strong className="block text-sm">الوضع الداكن</strong><small className="mt-1 block text-xs text-stone-500">{darkMode ? "مفعّل" : "متوقف"}</small></span><Moon className="h-5 w-5 text-emerald-800"/></button><div className="rounded-xl bg-stone-50 p-4"><p className="text-xs font-bold text-stone-500">البريد المستخدم لتسجيل الدخول</p><p dir="ltr" className="mt-1 text-sm font-semibold text-stone-800">{user.email}</p><p className="mt-2 text-[11px] text-stone-500">يُستخدم لتسجيل الدخول واستعادة كلمة المرور.</p></div><div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"><h3 className="font-black text-emerald-950">عن مستر زنجر</h3><p className="mt-1 text-sm leading-6 text-stone-600">كريب وبيتزا وزنجر بطعم مميز منذ 2019. من حسابك تقدر تحفظ بياناتك وتتابع طلباتك وتتواصل مع المطعم.</p></div></section>}
              {activeSection === "support" && <section className="space-y-3"><div><h2 className="text-lg font-black">الدعم الفني</h2><p className="mt-1 text-sm text-stone-500">راسل دعم المطعم، والرد هيظهر هنا داخل حسابك.</p></div><CustomerSupportChat uid={user.uid} customerName={profile.name || user.displayName || "عميل"} customerEmail={user.email || ""} customerPhone={profile.phone}/></section>}
            </div>
          </div>
        </div>}      </section>
    </div>
  </main>{!user && <SupportWidget/>}</>;
};
