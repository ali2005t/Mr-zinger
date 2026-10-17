import React, { useEffect, useState } from "react";
import { Megaphone, Save } from "lucide-react";
import { AnnouncementConfig, getEgyptDateTimeLocal, isAnnouncementActive } from "../firebase/data";

export function AnnouncementManager({ value, onSave }: { value: AnnouncementConfig; onSave: (value: AnnouncementConfig) => Promise<void> }) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [cairoNow, setCairoNow] = useState(getEgyptDateTimeLocal());
  const [startDate, setStartDate] = useState(value.startsAt.slice(0, 10));
  const [startTime, setStartTime] = useState(value.startsAt.slice(11, 16));
  const [endDate, setEndDate] = useState(value.endsAt.slice(0, 10));
  const [endTime, setEndTime] = useState(value.endsAt.slice(11, 16));
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    setStartDate(value.startsAt.slice(0, 10)); setStartTime(value.startsAt.slice(11, 16));
    setEndDate(value.endsAt.slice(0, 10)); setEndTime(value.endsAt.slice(11, 16));
  }, [value.startsAt, value.endsAt]);
  useEffect(() => {
    const timer = window.setInterval(() => setCairoNow(getEgyptDateTimeLocal()), 5000);
    return () => window.clearInterval(timer);
  }, []);
  const set = <K extends keyof AnnouncementConfig>(key: K, next: AnnouncementConfig[K]) => setDraft((current) => ({ ...current, [key]: next }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    if (Boolean(startDate) !== Boolean(startTime) || Boolean(endDate) !== Boolean(endTime)) {
      setMessage("أكمل التاريخ والوقت معًا، أو اترك الحقلين فارغين.");
      setSaving(false);
      return;
    }
    if (draft.startsAt && draft.endsAt && draft.endsAt <= draft.startsAt) {
      setMessage("وقت انتهاء الإعلان لازم يكون بعد وقت البداية.");
      setSaving(false);
      return;
    }
    try { await onSave(draft); setMessage("تم حفظ إعدادات الشريط الإعلاني."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "تعذر حفظ الإعلان. تأكد من نشر قواعد Firestore."); }
    finally { setSaving(false); }
  };
  const previewBackground = draft.style === "gradient" ? `linear-gradient(100deg, ${draft.backgroundColor}, #064e3b)` : undefined;
  const previewTextColor = draft.style === "gradient" ? "#fff" : draft.textColor;
  const currentStatus = isAnnouncementActive(draft)
    ? "الإعلان ظاهر الآن على الموقع"
    : !draft.enabled || !draft.text.trim() ? "الإعلان متوقف"
      : draft.startsAt && cairoNow < draft.startsAt ? `سيظهر تلقائيًا في ${draft.startsAt.replace("T", " ")} بتوقيت القاهرة`
        : draft.endsAt && cairoNow > draft.endsAt ? "انتهى وقت الإعلان"
          : "راجع وقت البداية والنهاية؛ صيغة الوقت غير صالحة";
  return <form onSubmit={save} className="space-y-5">
    <div><h2 className="text-xl font-black">الشريط الإعلاني</h2><p className="mt-1 text-sm text-stone-500">إعلان واضح بمكبر صوت، يظهر ويختفي تلقائيًا وفق توقيت القاهرة.</p></div>
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <label className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 font-bold text-emerald-950"><input type="checkbox" checked={draft.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-4 w-4 accent-emerald-800" />تفعيل الشريط الإعلاني</label>
      <label className="block text-sm font-bold">نص الإعلان<textarea required maxLength={180} rows={2} value={draft.text} onChange={(e) => set("text", e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 p-3 font-normal" placeholder="مثال: خصم 20٪ على طلبات اليوم" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">شكل الشريط<select value={draft.style} onChange={(e) => set("style", e.target.value as AnnouncementConfig["style"])} className="mt-1.5 w-full rounded-xl border border-stone-200 p-3"><option value="simple">لون ثابت</option><option value="highlight">بارز بإطار ذهبي</option><option value="gradient">متدرج</option></select></label>
        <label className="text-sm font-bold">رابط الإعلان (اختياري)<input type="url" dir="ltr" value={draft.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 p-3 font-normal" placeholder="https://..." /></label>
        {draft.linkUrl && <label className="text-sm font-bold">نص زر الرابط<input value={draft.linkLabel} onChange={(e) => set("linkLabel", e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 p-3 font-normal" placeholder="اطلب الآن" /></label>}
        <label className="text-sm font-bold">لون الخلفية<div className="mt-1.5 flex items-center gap-3"><input type="color" value={draft.backgroundColor} onChange={(e) => set("backgroundColor", e.target.value)} className="h-10 w-14 rounded border" /><span dir="ltr" className="text-xs text-stone-500">{draft.backgroundColor}</span></div></label>
        <label className="text-sm font-bold">لون النص<div className="mt-1.5 flex items-center gap-3"><input type="color" value={draft.textColor} onChange={(e) => set("textColor", e.target.value)} className="h-10 w-14 rounded border" /><span dir="ltr" className="text-xs text-stone-500">{draft.textColor}</span></div></label>
        <fieldset className="text-sm font-bold"><legend>بداية الإعلان (توقيت القاهرة)</legend><div className="mt-1.5 grid grid-cols-[1.25fr_1fr] gap-2"><input aria-label="تاريخ بداية الإعلان" type="date" value={startDate} onChange={(e) => { const next = e.target.value; setStartDate(next); set("startsAt", next && startTime ? `${next}T${startTime}` : ""); }} className="min-w-0 w-full rounded-xl border border-stone-200 p-3 font-normal" /><input aria-label="وقت بداية الإعلان" type="time" value={startTime} onChange={(e) => { const next = e.target.value; setStartTime(next); set("startsAt", next && startDate ? `${startDate}T${next}` : ""); }} className="min-w-0 w-full rounded-xl border border-stone-200 p-3 font-normal" /></div></fieldset>
        <fieldset className="text-sm font-bold"><legend>نهاية الإعلان (توقيت القاهرة)</legend><div className="mt-1.5 grid grid-cols-[1.25fr_1fr] gap-2"><input aria-label="تاريخ نهاية الإعلان" type="date" value={endDate} onChange={(e) => { const next = e.target.value; setEndDate(next); set("endsAt", next && endTime ? `${next}T${endTime}` : ""); }} className="min-w-0 w-full rounded-xl border border-stone-200 p-3 font-normal" /><input aria-label="وقت نهاية الإعلان" type="time" value={endTime} onChange={(e) => { const next = e.target.value; setEndTime(next); set("endsAt", next && endDate ? `${endDate}T${next}` : ""); }} className="min-w-0 w-full rounded-xl border border-stone-200 p-3 font-normal" /></div></fieldset>
      </div>
      <div className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-bold ${isAnnouncementActive(draft) ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}><Megaphone className="h-5 w-5 shrink-0" />{currentStatus}</div>
      <div className="overflow-hidden rounded-2xl border border-stone-200"><p className="border-b border-stone-100 p-2 text-xs font-bold text-stone-500">معاينة الشريط</p><div className={`flex min-h-14 items-center justify-center gap-2.5 p-3 text-center text-sm font-black ${draft.style === "highlight" ? "ring-2 ring-inset ring-amber-300" : ""}`} style={{ backgroundColor: draft.backgroundColor, backgroundImage: previewBackground, color: previewTextColor }}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-400 text-emerald-950"><Megaphone className="h-4 w-4" /></span><span>{draft.text || "سيظهر نص إعلانك هنا"}</span></div></div>
      {message && <p role="status" className="text-sm text-emerald-800">{message}</p>}
      <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "جارٍ الحفظ…" : "حفظ الإعلان"}</button>
      <p className="text-xs leading-5 text-stone-500">الوقت المعروض في هذا القسم هو وقت مصر، حتى لو كان جهازك مضبوطًا على منطقة زمنية أخرى.</p>
    </section>
  </form>;
}
