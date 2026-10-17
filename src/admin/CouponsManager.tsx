import React, { useState } from "react";
import { Check, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { RestaurantCoupon } from "../firebase/data";

const emptyCoupon: RestaurantCoupon = { code: "", type: "percentage", value: 10, minOrder: 0, active: true };

export const CouponsManager: React.FC<{
  coupons: RestaurantCoupon[];
  onSave: (coupon: RestaurantCoupon) => Promise<void>;
  onDelete: (code: string) => Promise<void>;
}> = ({ coupons, onSave, onDelete }) => {
  const [draft, setDraft] = useState(emptyCoupon);
  const [message, setMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1600);
    } catch { setMessage("تعذر النسخ تلقائيًا؛ انسخ الكود يدويًا."); }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await onSave({ ...draft, code: draft.code.trim().toUpperCase() });
      setDraft(emptyCoupon);
      setMessage("تم حفظ الكوبون.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر الحفظ."); }
  };

  return <div className="space-y-5">
    <div><h2 className="text-xl font-black">كوبونات الخصم</h2><p className="mt-1 text-sm text-stone-500">أنشئ كوبونًا بنسبة مئوية أو مبلغ ثابت، وحدد الحد الأدنى للطلب.</p></div>
    <form className="grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-5" onSubmit={submit}>
      <label className="text-xs font-bold">كود الكوبون<input required maxLength={30} placeholder="مثال ZINGER10" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} className="mt-1 block w-full rounded-xl border border-stone-200 p-3 font-normal" /></label>
      <label className="text-xs font-bold">نوع الخصم<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as RestaurantCoupon["type"], value: e.target.value === "percentage" ? Math.min(draft.value, 100) : draft.value })} className="mt-1 block w-full rounded-xl border border-stone-200 p-3"><option value="percentage">نسبة مئوية %</option><option value="fixed">مبلغ ثابت (جنيه)</option></select></label>
      <label className="text-xs font-bold">{draft.type === "percentage" ? "نسبة الخصم (%)" : "مبلغ الخصم (جنيه)"}<input required type="number" min="0.01" max={draft.type === "percentage" ? 100 : undefined} step="0.01" value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} className="mt-1 block w-full rounded-xl border border-stone-200 p-3 font-normal" /></label>
      <label className="text-xs font-bold">الحد الأدنى للطلب (جنيه)<input type="number" min="0" step="0.01" value={draft.minOrder} onChange={(e) => setDraft({ ...draft, minOrder: Number(e.target.value) })} className="mt-1 block w-full rounded-xl border border-stone-200 p-3 font-normal" /></label>
      <button className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-emerald-800 px-4 py-3 font-black text-white"><Plus className="h-4 w-4" />حفظ الكوبون</button>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="h-4 w-4 accent-emerald-800" />الكوبون فعال</label>
      {message && <p role="status" className="self-center text-sm text-emerald-800 sm:col-span-2">{message}</p>}
    </form>
    <div className="space-y-3">{coupons.map((coupon) => <article key={coupon.code} className="flex min-w-0 flex-col justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong dir="ltr" className="inline-block rounded-lg bg-stone-100 px-3 py-1.5 font-mono">{coupon.code}</strong><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${coupon.active ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"}`}>{coupon.active ? "فعال" : "متوقف"}</span></div><p className="mt-2 text-sm text-stone-600">خصم <b className="text-emerald-900">{coupon.type === "percentage" ? `${coupon.value}%` : `${coupon.value} جنيه`}</b><span className="mx-1">·</span>الحد الأدنى {coupon.minOrder} جنيه</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => copyCode(coupon.code)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{copiedCode === coupon.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copiedCode === coupon.code ? "تم النسخ" : "نسخ الكود"}</button><button type="button" onClick={() => { setDraft(coupon); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold"><Pencil className="h-4 w-4" />تعديل</button><button type="button" onClick={async () => { if (confirm(`حذف الكوبون ${coupon.code}؟`)) await onDelete(coupon.code); }} className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><Trash2 className="h-4 w-4" />حذف</button></div>
    </article>)}{!coupons.length && <p className="rounded-xl bg-white p-5 text-sm text-stone-500">لا توجد كوبونات بعد.</p>}</div>
  </div>;
};
