import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Headset, Send, RefreshCw, MessageCircle, X } from "lucide-react";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { sendSupportMessage, subscribeToSupportMessages, SupportConversation, SupportMessage, subscribeToSupportInbox } from "../firebase/data";
import { firebaseAuth, isFirebaseConfigured, supportAuth } from "../firebase/client";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";
import { getWhatsAppUrl } from "../utils/whatsapp";

function SupportThread({ uid, currentUserUid, senderRole, customerName, customerEmail, customerPhone, compact = false }: {
  uid: string; currentUserUid: string; senderRole: "customer" | "support"; customerName: string; customerEmail: string; customerPhone: string; compact?: boolean;
}) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => subscribeToSupportMessages(uid, setMessages, (cause) => setError(cause.message)), [uid]);
  useEffect(() => { const container = messagesRef.current; if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" }); }, [messages]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    if (senderRole === "customer" && !customerPhone.trim()) { setError("اكتب رقم هاتفك حتى يقدر المطعم يتواصل معك."); return; }
    setBusy(true); setError("");
    try {
      await sendSupportMessage({ uid, senderUid: currentUserUid, senderRole, text, customerName, customerEmail, customerPhone });
      setText("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر إرسال الرسالة."); }
    finally { setBusy(false); }
  };
  return <div className={`flex ${compact ? "h-full min-h-0" : "min-h-[360px]"} flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white`}>
    <div className="flex shrink-0 items-center gap-2 border-b border-stone-100 bg-emerald-50 px-4 py-3"><Headset className="h-4 w-4 text-emerald-800"/><strong className="text-sm">محادثة دعم المطعم</strong><span className="mr-auto text-[10px] text-stone-500">الرد يظهر هنا مباشرة</span></div>
    <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-stone-50/70 p-4">
      {!messages.length && <p className="py-10 text-center text-xs leading-6 text-stone-500">ابدأ المحادثة واكتب مشكلتك، وفريق المطعم هيرد عليك هنا.</p>}
      {messages.map((message) => <div key={message.id} className={`flex ${message.senderRole === senderRole ? "justify-start" : "justify-end"}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.senderRole === senderRole ? "rounded-tr-sm bg-emerald-800 text-white" : "rounded-tl-sm bg-white text-stone-800 shadow-sm"}`}><p className="mb-1 text-[10px] font-bold opacity-70">{message.senderRole === "support" ? "دعم مستر زنجر" : "أنت"}</p><p className="whitespace-pre-wrap break-words">{message.text}</p>{message.createdAt?.toDate && <time className="mt-1 block text-[9px] opacity-60">{message.createdAt.toDate().toLocaleString("ar-EG")}</time>}</div></div>)}
    </div>
    {error && <p role="alert" className="px-3 pt-2 text-xs text-red-700">{error}</p>}
    <form onSubmit={submit} className="flex shrink-0 gap-2 border-t border-stone-100 bg-white p-3"><input value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} placeholder="اكتب رسالتك للدعم…" className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-700"/><button disabled={busy || !text.trim()} aria-label="إرسال الرسالة" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-800 text-white disabled:opacity-50"><Send className="h-4 w-4"/></button></form>
  </div>;
}

export function CustomerSupportChat({ uid, customerName, customerEmail, customerPhone }: { uid: string; customerName: string; customerEmail: string; customerPhone: string }) {
  const [phone, setPhone] = useState(customerPhone);
  useEffect(() => setPhone(customerPhone), [customerPhone]);
  return <><label className="block text-xs font-bold text-stone-600">رقم هاتف للتواصل<input type="tel" dir="ltr" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01xxxxxxxxx" className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left text-sm"/></label><SupportThread uid={uid} currentUserUid={uid} senderRole="customer" customerName={customerName} customerEmail={customerEmail} customerPhone={phone}/></>;
}

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [visitor, setVisitor] = useState<User | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [authError, setAuthError] = useState("");
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const anonymousAuth = supportAuth;
    if (!firebaseAuth || !anonymousAuth) return;
    return onAuthStateChanged(firebaseAuth, (user) => {
      if (user) { setVisitor(user); return; }
      if (!anonymousAuth.currentUser) signInAnonymously(anonymousAuth).then(({ user: anonymous }) => setVisitor(anonymous)).catch(() => setAuthError("فعّل تسجيل الدخول المجهول في Firebase لتشغيل دعم الزوار."));
      else setVisitor(anonymousAuth.currentUser);
    });
  }, []);
  const branch = RESTAURANT_CONFIG.branches[0];
  return <div className="fixed bottom-24 right-4 z-40 sm:bottom-6 sm:right-6" dir="rtl">
    {open && <section className="mb-3 flex h-[min(70vh,540px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-2xl">
      <header className="flex items-center gap-3 bg-gradient-to-l from-emerald-950 to-emerald-800 px-4 py-3 text-white"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400 text-emerald-950"><Headset className="h-5 w-5"/></span><div><h2 className="font-black">دعم مستر زنجر</h2><p className="text-[11px] text-emerald-100">اكتب مشكلتك وفريقنا هيرد عليك هنا</p></div><button onClick={() => setOpen(false)} className="mr-auto rounded-lg p-2 hover:bg-white/10" aria-label="إغلاق الدعم"><X className="h-4 w-4"/></button></header>
      {!isFirebaseConfigured ? <div className="grid flex-1 place-items-center p-5 text-center"><p className="text-sm text-stone-600">الدردشة غير متاحة الآن. <a className="font-bold text-emerald-800 underline" href={getWhatsAppUrl(branch.whatsappNumber || branch.phone, "مرحبًا، أحتاج مساعدة من دعم مستر زنجر.")}>تواصل معنا عبر واتساب</a></p></div>
        : authError ? <div className="grid flex-1 place-items-center gap-3 p-5 text-center"><p className="text-sm text-stone-600">{authError}</p><a className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-bold text-white" href={getWhatsAppUrl(branch.whatsappNumber || branch.phone, "مرحبًا، أحتاج مساعدة من دعم مستر زنجر.")}>الدعم عبر واتساب</a></div>
          : !visitor ? <div className="grid flex-1 place-items-center text-sm text-stone-500"><RefreshCw className="ml-2 inline h-4 w-4 animate-spin"/>جارٍ تجهيز المحادثة…</div>
            : <><div className="grid shrink-0 grid-cols-2 gap-2 border-b border-stone-100 bg-stone-50 p-3"><input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder={visitor.isAnonymous ? "اسمك (اختياري)" : visitor.displayName || "الاسم"} className="min-w-0 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs"/><input value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} type="tel" dir="ltr" placeholder="رقم الهاتف للتواصل" className="min-w-0 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs"/><input value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} type="email" dir="ltr" placeholder={visitor.isAnonymous ? "البريد (اختياري)" : visitor.email || "البريد الإلكتروني"} className="min-w-0 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-xs"/></div><div className="min-h-0 flex-1"><SupportThread compact uid={visitor.uid} currentUserUid={visitor.uid} senderRole="customer" customerName={guestName || visitor.displayName || "زائر"} customerEmail={guestEmail || visitor.email || ""} customerPhone={guestPhone}/></div></>}
    </section>}
    <button onClick={() => setOpen((value) => !value)} aria-label={open ? "إغلاق المحادثة" : "فتح الدعم الفني"} className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-3 font-black text-emerald-950 shadow-xl ring-4 ring-white/70 transition hover:bg-amber-300"><MessageCircle className="h-5 w-5"/><span className="text-xs">الدعم الفني</span></button>
  </div>;
}

export function SupportManager({ currentUserUid }: { currentUserUid: string }) {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selected, setSelected] = useState<SupportConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => subscribeToSupportInbox((items) => { setConversations(items); setLoading(false); }, (cause) => { setError(cause.message); setLoading(false); }), []);
  return <section className="space-y-4">
    <header><div className="flex items-center gap-2"><Headset className="h-5 w-5 text-emerald-800"/><h2 className="text-xl font-black">دعم العملاء</h2></div><p className="mt-1 text-sm text-stone-500">رد على استفسارات العملاء المسجلين. رسائلك تظهر لهم داخل حساباتهم.</p></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading && <p className="flex items-center gap-2 text-sm text-stone-500"><RefreshCw className="h-4 w-4 animate-spin"/>جارٍ تحميل المحادثات…</p>}
    <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="max-h-[560px] space-y-2 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2">
        {!loading && !conversations.length && <p className="p-5 text-center text-xs leading-5 text-stone-500">لا توجد محادثات دعم. ستظهر هنا عند وصول أول رسالة.</p>}
        {conversations.map((conversation) => <button key={conversation.uid} onClick={() => setSelected(conversation)} className={`w-full rounded-xl p-3 text-right ${selected?.uid === conversation.uid ? "bg-emerald-800 text-white" : "hover:bg-emerald-50"}`}><strong className="block truncate text-sm">{conversation.customerName || "عميل"}</strong><span dir="ltr" className={`mt-0.5 block truncate text-right text-xs font-bold ${selected?.uid === conversation.uid ? "text-white" : "text-emerald-800"}`}>{conversation.customerPhone || "رقم الهاتف غير مسجل"}</span><span dir="ltr" className={`mt-0.5 block truncate text-right text-[10px] ${selected?.uid === conversation.uid ? "text-emerald-100" : "text-stone-500"}`}>{conversation.customerEmail}</span><span className={`mt-2 block truncate text-xs ${selected?.uid === conversation.uid ? "text-white/80" : "text-stone-600"}`}>{conversation.lastMessage}</span></button>)}
      </aside>
      {selected ? <SupportThread uid={selected.uid} currentUserUid={currentUserUid} senderRole="support" customerName={selected.customerName} customerEmail={selected.customerEmail} customerPhone={selected.customerPhone || ""}/> : <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">اختر محادثة من القائمة لعرض الرسائل والرد على العميل.</div>}
    </div>
  </section>;
}
