import React, { useState } from "react";
import { useEffect } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { useCart } from "../context/CartContext";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import { buildWhatsAppMessage, getWhatsAppUrl, openWhatsAppChat } from "../utils/whatsapp";
import { createTrackedOrder, getCustomerProfile, saveCustomerProfile, getRestaurantCoupon, RestaurantCoupon, RestaurantSettings } from "../firebase/data";
import { isFirebaseConfigured } from "../firebase/client";
import { firebaseAuth } from "../firebase/client";
import { CustomerAccountsConfig, defaultCustomerAccountsConfig, subscribeToCustomerAccounts } from "../firebase/data";
import {
  X,
  MapPin,
  Compass,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bike,
  Store,
  MessageCircle,
  PhoneCall,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export const CheckoutModal: React.FC<{ settings?: RestaurantSettings }> = ({ settings }) => {
  const {
    cartItems,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsCartOpen,
    orderDetails,
    updateOrderDetails,
    detectLocation,
    clearLocation,
    isLocating,
    locationError,
    totalAmount,
    totalItems,
  } = useCart();

  const [formError, setFormError] = useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<RestaurantCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccountsConfig>(defaultCustomerAccountsConfig);
  const [customerUser, setCustomerUser] = useState<FirebaseUser | null>(null);
  const [accountMode, setAccountMode] = useState<"login" | "register">("login");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountBusy, setAccountBusy] = useState(false);
  const [customerProfileLoaded, setCustomerProfileLoaded] = useState(false);

  useEffect(() => isFirebaseConfigured ? subscribeToCustomerAccounts(setCustomerAccounts) : undefined, []);
  useEffect(() => firebaseAuth ? onAuthStateChanged(firebaseAuth, setCustomerUser) : undefined, []);
  useEffect(() => {
    if (!customerUser || !customerAccounts.enabled) { setCustomerProfileLoaded(true); return; }
    let active = true;
    setCustomerProfileLoaded(false);
    getCustomerProfile(customerUser.uid).then((profile) => {
      if (!active || !profile) return;
      updateOrderDetails({
        customerName: profile.name || orderDetails.customerName,
        customerPhone: profile.phone || orderDetails.customerPhone,
        customerPhone2: profile.phone2 || orderDetails.customerPhone2,
        deliveryMethod: profile.deliveryMethod || orderDetails.deliveryMethod,
        branchId: profile.branchId || orderDetails.branchId,
        manualAddress: profile.manualAddress || orderDetails.manualAddress,
        addressDetails: profile.addressDetails || orderDetails.addressDetails,
        location: profile.location ?? orderDetails.location,
        paymentMethod: profile.paymentMethod || orderDetails.paymentMethod || "cash_on_delivery",
      });
    }).catch(() => setAccountError("تعذر تحميل بيانات الحساب المحفوظة."))
      .finally(() => { if (active) setCustomerProfileLoaded(true); });
    return () => { active = false; };
  }, [customerUser, customerAccounts.enabled]);

  // Quick preset notes
  const presetNotes = [
    "بدون بصل",
    "زيادة صوص",
    "سبايسي زيادة",
    "بدون كاتشب",
    "رن الجرس عند الوصول",
    "معالق ومناديل إضافية",
  ];

  if (!isCheckoutOpen) return null;

  const discountAmount = appliedCoupon && totalAmount >= appliedCoupon.minOrder
    ? Math.min(totalAmount, Math.round((appliedCoupon.type === "percentage"
      ? totalAmount * appliedCoupon.value / 100
      : appliedCoupon.value) * 100) / 100)
    : 0;
  const deliveryFee = orderDetails.deliveryMethod === "delivery" ? settings?.deliveryFee ?? 0 : 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount) + deliveryFee;
  const paymentMethods = (customerAccounts.paymentMethods ?? defaultCustomerAccountsConfig.paymentMethods).filter((method) => method.enabled);
  const selectedPayment = paymentMethods.find((method) => method.id === orderDetails.paymentMethod) ?? paymentMethods[0];
  const completesInDashboard = Boolean((customerAccounts.enabled && customerUser) || (customerAccounts.orderHandling === "dashboard" && isFirebaseConfigured));

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    try {
      const coupon = await getRestaurantCoupon(code);
      if (!coupon || !coupon.active || totalAmount < coupon.minOrder
        || !Number.isFinite(coupon.value) || coupon.value <= 0
        || (coupon.type === "percentage" && coupon.value > 100)) {
        setAppliedCoupon(null);
        setCouponMessage(!coupon || !coupon.active || (coupon.type === "percentage" && coupon.value > 100)
          ? "الكود غير صالح أو متوقف."
          : `الحد الأدنى لهذا الكود ${coupon.minOrder} جنيه.`);
        return;
      }
      setAppliedCoupon(coupon);
      setCouponMessage("تم تطبيق الخصم بنجاح.");
    } catch {
      setCouponMessage("تعذر التحقق من الكوبون. تأكد من اتصال الموقع.");
    }
  };

  const handleAddPresetNote = (note: string) => {
    const currentNotes = orderDetails.notes.trim();
    if (currentNotes.includes(note)) {
      const updated = currentNotes
        .replace(note, "")
        .replace(/\s*،\s*،/g, "،")
        .replace(/^،\s*/, "")
        .replace(/،\s*$/, "")
        .trim();
      updateOrderDetails({ notes: updated });
    } else {
      const updated = currentNotes ? `${currentNotes} ، ${note}` : note;
      updateOrderDetails({ notes: updated });
    }
  };

  const targetBranch =
    settings?.branches.find((b) => b.id === orderDetails.branchId) ||
    settings?.branches[0] || RESTAURANT_CONFIG.branches[0];

  const handleSendOrder = async () => {
    if (customerAccounts.enabled && customerUser && !customerProfileLoaded) {
      setFormError("انتظر لحظة حتى يتم تحميل بيانات حسابك المحفوظة.");
      return;
    }
    // 1. Validate Dual Name (الاسم ثنائي)
    const trimmedName = orderDetails.customerName.trim();
    const nameWords = trimmedName.split(/\s+/).filter(Boolean);
    if (!trimmedName || nameWords.length < 2) {
      setFormError("يرجى كتابة الاسم الأول واسم العائلة على الأقل (مثال: أحمد محمد).");
      return;
    }

    // 2. Validate Primary Phone
    const cleanPhone = orderDetails.customerPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError("يرجى إدخال رقم الهاتف الأساسي بشكل صحيح (مثال: 01012345678).");
      return;
    }

    // 3. Validate Secondary Phone (إجباري)
    const cleanPhone2 = (orderDetails.customerPhone2 || "").replace(/[^0-9]/g, "");
    if (!cleanPhone2 || cleanPhone2.length < 10) {
      setFormError("يرجى إدخال رقم هاتف بديل للتواصل بشأن الطلب.");
      return;
    }

    if (cleanPhone === cleanPhone2) {
      setFormError("يرجى إدخال رقمين هاتف مختلفين لضمان الوصول إليك بسهولة.");
      return;
    }

    if (paymentMethods.length === 0) {
      setFormError("لا توجد طريقة دفع مفعّلة حاليًا. تواصل مع المطعم قبل إرسال الطلب.");
      return;
    }

    // 3. Validate Address if Delivery
    if (orderDetails.deliveryMethod === "delivery") {
      if (!orderDetails.location && !orderDetails.manualAddress.trim()) {
        setFormError("يرجى تحديد موقعك الحالي أو كتابة عنوان التوصيل يدويًا.");
        return;
      }
    }

    setFormError(null);

    if (couponInput.trim() && (!appliedCoupon || totalAmount < appliedCoupon.minOrder)) {
      setFormError("تحقق من كود الخصم أو احذفه قبل إرسال الطلب.");
      return;
    }

    setIsSubmitting(true);
    let submittedOrderNumber = trackedOrderId;
    const submittedDetails = { ...orderDetails, paymentMethod: selectedPayment.id };
    if (isFirebaseConfigured) {
      if (customerAccounts.enabled && customerUser) {
        try {
          await saveCustomerProfile(customerUser.uid, {
            name: submittedDetails.customerName.trim(), phone: submittedDetails.customerPhone.trim(), phone2: submittedDetails.customerPhone2?.trim() ?? "",
            deliveryMethod: submittedDetails.deliveryMethod, branchId: submittedDetails.branchId,
            manualAddress: submittedDetails.manualAddress.trim(), addressDetails: submittedDetails.addressDetails.trim(),
            location: submittedDetails.location, paymentMethod: selectedPayment.id,
          });
        } catch {
          setAccountError("تعذر تحديث الملف الشخصي الآن، لكن طلبك سيستمر.");
        }
      }
      try {
        const orderId = await createTrackedOrder({
          cartItems,
          orderDetails: submittedDetails,
          totalItems,
          totalAmount: finalAmount,
          discountAmount,
          couponCode: appliedCoupon?.code,
          paymentMethodLabel: selectedPayment?.label,
          estimatedMinutes: customerAccounts.estimatedMinutes ?? defaultCustomerAccountsConfig.estimatedMinutes,
          branchName: targetBranch.name,
          branchAddress: targetBranch.address,
          customerUid: customerAccounts.enabled ? customerUser?.uid : undefined,
        });
        submittedOrderNumber = orderId;
        setTrackedOrderId(orderId);
      } catch (error) {
        setIsSubmitting(false);
        setFormError("تعذر حفظ الطلب في النظام. أعد المحاولة أو اتصل بالفرع مباشرةً.");
        console.error("Order could not be saved to Firestore:", error);
        return;
      }
    }

    // Build the formatted WhatsApp message after saving the order for tracking.
    const message = buildWhatsAppMessage(cartItems, submittedDetails, totalAmount, finalAmount, discountAmount, appliedCoupon?.code, selectedPayment.label)
      + (submittedOrderNumber ? `\n\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628: ${submittedOrderNumber}` : "");
    const targetWhatsApp = targetBranch.whatsappNumber || targetBranch.phone;

    if (completesInDashboard) {
      setSubmittedUrl("dashboard");
      setIsSubmitting(false);
      return;
    }

    // Generate direct WhatsApp link
    const waUrl = getWhatsAppUrl(targetWhatsApp, message);
    setSubmittedUrl(waUrl);
    setIsSubmitting(false);

    // Launch WhatsApp
    openWhatsAppChat(targetWhatsApp, message);
  };

  const handleCustomerAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseAuth) return;
    setAccountBusy(true); setAccountError("");
    try {
      if (accountMode === "register") {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, accountEmail.trim(), accountPassword);
        await saveCustomerProfile(credential.user.uid, {
          name: orderDetails.customerName.trim(), phone: orderDetails.customerPhone.trim(), phone2: orderDetails.customerPhone2?.trim() || "",
          email: credential.user.email || accountEmail.trim(), deliveryMethod: orderDetails.deliveryMethod, branchId: orderDetails.branchId,
          manualAddress: orderDetails.manualAddress.trim(), addressDetails: orderDetails.addressDetails.trim(), location: orderDetails.location,
          paymentMethod: orderDetails.paymentMethod || "cash_on_delivery",
        });
      } else await signInWithEmailAndPassword(firebaseAuth, accountEmail.trim(), accountPassword);
    } catch {
      setAccountError("تعذر تسجيل الحساب. تأكد من البريد وكلمة المرور أنها 6 أحرف أو أرقام على الأقل.");
    } finally { setAccountBusy(false); }
  };

  const handleCopyMessage = () => {
    const message = buildWhatsAppMessage(cartItems, orderDetails, totalAmount, finalAmount, discountAmount, appliedCoupon?.code, selectedPayment?.label)
      + (trackedOrderId ? `\nرقم الطلب: ${trackedOrderId}` : "");
    navigator.clipboard.writeText(message);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const cleanPhoneInput = (val: string) => {
    const enVal = val.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
    updateOrderDetails({ customerPhone: enVal });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!submittedUrl) setIsCheckoutOpen(false);
        }}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-5 text-center">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden text-right border border-stone-200 transform transition-all animate-in zoom-in-95 duration-200 my-4 sm:my-6 relative z-10">
          
          {/* Header */}
          <div className="bg-[#0d5335] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xl shadow-md">
                🍕
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-cairo text-white">
                  تأكيد الطلب — مستر زنجر
                </h2>
                <p className="text-xs text-amber-300">
                  {submittedUrl ? "تم تسجيل طلبك" : customerAccounts.enabled && customerUser ? "راجع بياناتك ثم أتمم الطلب من حسابك" : "أدخل بياناتك، ثم أرسل طلبك إلى الفرع عبر واتساب"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmittedUrl(null);
                setTrackedOrderId(null);
                setIsCheckoutOpen(false);
              }}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Submitted Screen vs Form Screen */}
          {submittedUrl ? (
            /* Post-Send Success & Direct Fallback Screen */
            <div className="p-6 sm:p-8 space-y-6 bg-white text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0d5335] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 font-cairo">{"\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0637\u0644\u0628\u0643 \u0628\u0646\u062c\u0627\u062d!"}</h3>
                {trackedOrderId && <p className="text-xs font-bold text-emerald-800">رقم الطلب: {trackedOrderId}</p>}
                {customerAccounts.enabled && customerUser && <a href={`/account#order-${trackedOrderId}`} className="mx-auto inline-flex rounded-xl bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-900">متابعة حالة الطلب والوقت المتوقع</a>}
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">{submittedUrl === "dashboard" ? (customerAccounts.enabled && customerUser ? "تم استلام طلبك وإرساله للمطعم. تقدر تتابع حالته والوقت المتوقع من حسابك، وسيتحدث الشريط تلقائيًا." : "تم حفظ طلبك في لوحة المطعم.") : <>فتحنا محادثة واتساب مع <strong className="text-stone-900 font-bold">{targetBranch.name}</strong> ({targetBranch.phone}). إذا لم تفتح تلقائيًا، استخدم الزر أدناه.</>}</p>
              </div>

              {/* Direct Link Button */}
              <div className="space-y-3 max-w-md mx-auto">
                {submittedUrl.startsWith("https://wa.me/") && <a
                  href={submittedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-lg transition-transform active:scale-98"
                >
                  <MessageCircle className="w-6 h-6 fill-white" />
                  <span>{"\u0641\u062a\u062d \u0648\u0627\u062a\u0633\u0627\u0628 \u0627\u0644\u0622\u0646"}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>}

                {submittedUrl.startsWith("https://wa.me/") && <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="w-full py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 border border-stone-300 cursor-pointer transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">تم نسخ نص الطلب بنجاح! يمكنك لصقه في واتساب</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-600" />
                      <span>نسخ نص الطلب (احتياطياً)</span>
                    </>
                  )}
                </button>}

                <a
                  href={`tel:${targetBranch.phone}`}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-[#0d5335] hover:underline font-bold pt-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>أو الاتصال المباشر بالفرع: {targetBranch.phone}</span>
                </a>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedUrl(null);
                    setTrackedOrderId(null);
                  }}
                  className="text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
                >
                  تعديل بيانات الطلب
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedUrl(null);
                    setTrackedOrderId(null);
                    setIsCheckoutOpen(false);
                  }}
                  className="text-[#0d5335] font-bold cursor-pointer hover:underline"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          ) : (
            /* Main Form View */
            <>
              {customerAccounts.enabled && <div className="mx-4 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:mx-6">
                {customerUser ? <div className="text-sm text-emerald-950"><p className="font-black">أهلًا {orderDetails.customerName || customerUser.displayName || "بك"}</p><p className="mt-1 font-bold" dir="ltr">{orderDetails.customerPhone || "أضف رقم هاتفك في بيانات الطلب"}</p><p className="mt-1 text-xs">{customerProfileLoaded ? "بياناتك المحفوظة جاهزة، وسيظهر طلبك في حسابك." : "جارٍ تحميل بياناتك المحفوظة…"}</p></div> : <form onSubmit={handleCustomerAuth} className="space-y-3">
                  <p className="text-sm font-black text-emerald-950">سجل دخولك أو أنشئ حسابًا اختياريًا لمتابعة طلباتك. تقدر تكمل الطلب كضيف.</p>
                  {accountError && <p role="alert" className="text-xs text-red-700">{accountError}</p>}
                  <div className="grid gap-2 sm:grid-cols-2"><input required type="email" autoComplete="email" placeholder="Email" dir="ltr" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" /><input required minLength={6} type="password" autoComplete={accountMode === "register" ? "new-password" : "current-password"} placeholder="Password" dir="ltr" value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm" /></div>
                  <div className="flex flex-wrap items-center gap-3"><button disabled={accountBusy} className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-black text-white disabled:opacity-50">{accountBusy ? "جارٍ..." : accountMode === "register" ? "إنشاء حساب" : "تسجيل الدخول"}</button><button type="button" onClick={() => setAccountMode(accountMode === "login" ? "register" : "login")} className="text-xs font-bold text-emerald-900 underline">{accountMode === "login" ? "أول مرة؟ أنشئ حسابًا" : "لديك حساب؟ سجل الدخول"}</button></div>
                </form>}
              </div>}
              <div className="p-4 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-white text-stone-900">
                
                {/* Quick Cart Summary Header */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-800 text-xs sm:text-sm">
                    <ShoppingBag className="w-4 h-4 text-[#0d5335]" />
                    <span>
                      طلبك: <strong>{totalItems} أصناف</strong>
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="font-black text-[#0d5335] text-sm tabular-nums">
                      {totalAmount} جنيه
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="text-xs font-bold text-[#0d5335] hover:underline cursor-pointer"
                  >
                    تعديل السلة
                  </button>
                </div>

                {/* Error Message if any */}
                {formError && (
                  <div className="bg-red-50 border border-red-300 text-red-800 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-bold">{formError}</span>
                  </div>
                )}

                {/* 1. Customer Personal Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-1.5">
                    <User className="w-4 h-4 text-[#0d5335]" />
                    <span>1. بيانات العميل</span>
                  </h3>

                  <div className="space-y-3">
                    {/* Dual Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        الاسم بالكامل (الاسم الأول واسم العائلة على الأقل) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: أحمد مصطفى"
                        value={orderDetails.customerName}
                        onChange={(e) =>
                          updateOrderDetails({ customerName: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-[#0d5335] focus:ring-2 focus:ring-emerald-700/20 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 font-medium"
                      />
                    </div>

                    {/* Phones Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Primary Phone */}
                      <div>
                        <label className="block text-xs font-bold text-stone-800 mb-1">
                          رقم الهاتف الأساسي / واتساب <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          placeholder="01012345678"
                          value={orderDetails.customerPhone}
                          onChange={(e) => cleanPhoneInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-[#0d5335] focus:ring-2 focus:ring-emerald-700/20 text-sm text-stone-900 outline-none transition-all tabular-nums text-right sm:text-left font-bold placeholder:text-stone-400"
                        />
                      </div>

                      {/* Secondary Phone (Mandatory) */}
                      <div>
                        <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                          <span>
                            رقم هاتف بديل للتواصل <span className="text-red-600">*</span>
                          </span>
                          <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded">
                            مطلوب
                          </span>
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          placeholder="011xxxxxxxx"
                          value={orderDetails.customerPhone2 || ""}
                          onChange={(e) => {
                            const enVal = e.target.value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
                            updateOrderDetails({ customerPhone2: enVal });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-[#0d5335] focus:ring-2 focus:ring-emerald-700/20 text-sm text-stone-900 outline-none transition-all tabular-nums text-right sm:text-left font-medium placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Delivery vs Pickup & Branch */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-1.5">
                    <Bike className="w-4 h-4 text-[#0d5335]" />
                    <span>2. طريقة الاستلام والفرع</span>
                  </h3>

                  {/* Delivery / Pickup Tabs */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {settings?.deliveryEnabled !== false && <button
                      type="button"
                      onClick={() => updateOrderDetails({ deliveryMethod: "delivery" })}
                      className={`py-3 px-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        orderDetails.deliveryMethod === "delivery"
                          ? "border-[#0d5335] bg-[#0d5335] text-white shadow-sm font-bold"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-semibold"
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">توصيل للمنزل</span>
                    </button>}

                    {settings?.pickupEnabled !== false && <button
                      type="button"
                      onClick={() => updateOrderDetails({ deliveryMethod: "pickup" })}
                      className={`py-3 px-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        orderDetails.deliveryMethod === "pickup"
                          ? "border-[#0d5335] bg-[#0d5335] text-white shadow-sm font-bold"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 font-semibold"
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">استلام من الفرع</span>
                    </button>}
                  </div>

                  {/* Branch Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {orderDetails.deliveryMethod === "delivery"
                        ? "الفرع الأقرب لعنوانك:"
                        : "فرع الاستلام:"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(settings?.branches ?? RESTAURANT_CONFIG.branches).map((b) => {
                        const isSelected = orderDetails.branchId === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateOrderDetails({ branchId: b.id })}
                            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#0d5335] bg-emerald-50/90 text-[#0d5335] font-bold shadow-2xs"
                                : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-white"
                            }`}
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span>{b.name}</span>
                              <span className="text-[10px] text-stone-500 tabular-nums">{b.phone}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{b.landmark}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Address & GPS (Shown if delivery) */}
                {orderDetails.deliveryMethod === "delivery" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-1.5">
                      <MapPin className="w-4 h-4 text-[#0d5335]" />
                      <span>3. عنوان التوصيل</span>
                    </h3>

                    {/* GPS Location Button */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                            <Compass className="w-4 h-4 text-amber-500" />
                            <span>مشاركة موقعك الحالي عبر GPS</span>
                          </p>
                          <p className="text-[11px] text-stone-500">
                            رابط خرائط Google مباشر لتوصيل أسرع
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isLocating}
                          onClick={detectLocation}
                          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            orderDetails.location
                              ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                              : "bg-[#0d5335] hover:bg-emerald-900 text-white shadow-sm"
                          } ${isLocating ? "opacity-75 cursor-not-allowed" : ""}`}
                        >
                          <Compass
                            className={`w-3.5 h-3.5 text-amber-400 ${
                              isLocating ? "animate-spin" : ""
                            }`}
                          />
                          <span>
                            {isLocating
                              ? "جاري التحديد..."
                              : orderDetails.location
                              ? "تحديث الموقع"
                              : "استخدام موقعي الحالي"}
                          </span>
                        </button>
                      </div>

                      {locationError && (
                        <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{locationError}</span>
                        </div>
                      )}

                      {orderDetails.location && (
                        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-xs flex items-center justify-between">
                          <span className="text-emerald-800 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>تم تحديد الموقع بدقة!</span>
                          </span>
                          <button
                            type="button"
                            onClick={clearLocation}
                            className="text-stone-400 hover:text-red-600 text-[11px] cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Manual Address Input */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1">
                        العنوان بالتفصيل (اسم الشارع، رقم العمارة، علامة مميزة) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: شارع المدارس، عمارة 10، الدور الثالث، بجوار مسجد النور"
                        value={orderDetails.manualAddress}
                        onChange={(e) =>
                          updateOrderDetails({ manualAddress: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-[#0d5335] focus:ring-2 focus:ring-emerald-700/20 text-xs sm:text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Payment method */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-1.5"><span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-xs font-black text-amber-800">4</span><span>طريقة الدفع</span></h3>
                  {paymentMethods.length ? <div className="grid gap-2 sm:grid-cols-2">{paymentMethods.map((method) => <button key={method.id} type="button" onClick={() => updateOrderDetails({ paymentMethod: method.id })} className={`rounded-xl border p-3 text-right text-sm font-bold transition-colors ${selectedPayment?.id === method.id ? "border-emerald-800 bg-emerald-50 text-emerald-900" : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"}`}><span className="flex items-center gap-2"><input type="radio" readOnly checked={selectedPayment?.id === method.id} className="accent-emerald-800"/>{method.label}</span></button>)}</div> : <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">لا توجد طرق دفع مفعّلة. يرجى التواصل مع المطعم.</p>}
                  <p className="text-xs text-stone-500">{selectedPayment?.label ?? ""}</p>
                </div>

                {/* 5. Notes & Presets */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-1.5">
                    <FileText className="w-4 h-4 text-[#0d5335]" />
                    <span>5. ملاحظات على الطلب</span>
                  </h3>

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {presetNotes.map((note) => {
                      const isSelected = orderDetails.notes.includes(note);
                      return (
                        <button
                          key={note}
                          type="button"
                          onClick={() => handleAddPresetNote(note)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#0d5335] text-white shadow-2xs"
                              : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                          }`}
                        >
                          {note}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="أي ملاحظات إضافية بخصوص الأكل أو التوصيل..."
                    value={orderDetails.notes}
                    onChange={(e) => updateOrderDetails({ notes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-[#0d5335] focus:ring-2 focus:ring-emerald-700/20 text-xs sm:text-sm text-stone-900 outline-none transition-all resize-none font-medium placeholder:text-stone-400"
                  />
                </div>

                <div className="bg-stone-100/90 rounded-2xl p-3.5 text-xs text-stone-800 space-y-1.5">
                  <div className="flex gap-2"><input value={couponInput} onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setAppliedCoupon(null); }} placeholder="Coupon code" className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2" /><button type="button" onClick={applyCoupon} className="rounded-lg bg-emerald-800 px-3 py-2 font-bold text-white">Apply</button></div>
                  {couponMessage && <p className={appliedCoupon ? "text-emerald-800" : "text-red-700"}>{couponMessage}</p>}
                  <div className="flex justify-between"><span>Items subtotal:</span><span>{totalAmount} EGP</span></div>
                  {discountAmount > 0 && <div className="flex justify-between font-bold text-emerald-800"><span>Discount ({appliedCoupon?.code}):</span><span>-{discountAmount} EGP</span></div>}
                  <div className="flex justify-between border-t border-stone-300 pt-2 font-black"><span>Total:</span><span>{finalAmount} EGP</span></div>
                  <div className="flex justify-between text-stone-600"><span>Delivery fee:</span><span>{deliveryFee ? `${deliveryFee} EGP` : orderDetails.deliveryMethod === "delivery" ? "Confirmed by the restaurant" : "No fee (pickup)"}</span></div>
                </div>


              </div>

              {/* Prominent Footer CTA Button */}
              <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 space-y-2">
                <button
                  type="button"
                  onClick={handleSendOrder}
                  disabled={isSubmitting || (customerAccounts.enabled && Boolean(customerUser) && !customerProfileLoaded)}
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer ring-4 ring-emerald-500/20 disabled:cursor-wait disabled:opacity-70"
                >
                  <MessageCircle className="w-6 h-6 fill-white" />
                    <span>{isSubmitting ? "جارٍ حفظ الطلب..." : completesInDashboard ? `إتمام الطلب (${finalAmount} ج)` : `إرسال الطلب عبر واتساب (${finalAmount} ج)`}</span>
                </button>

                <p className="text-[11px] text-stone-500 text-center">
                  * {completesInDashboard ? customerAccounts.enabled && customerUser ? "سيصل طلبك للمطعم وتتابع حالته من حسابك." : "سيُحفظ طلبك مباشرة في لوحة المطعم." : "ستُفتح محادثة واتساب الفرع برسالة جاهزة تتضمن تفاصيل طلبك وعنوان التوصيل."}
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
