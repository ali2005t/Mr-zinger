import React, { useEffect, useState } from "react";
import { Gift, Save } from "lucide-react";
import type { MenuItem } from "../data/menuData";
import { QuantityPromotion } from "../firebase/data";

export function QuantityPromotionManager({ items, value, onSave }: {
  items: MenuItem[];
  value: QuantityPromotion;
  onSave: (value: QuantityPromotion) => Promise<void>;
}) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => setDraft(value), [value]);
  const selectedItem = items.find((item) => item.id === draft.menuItemId);
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try { await onSave(draft); setMessage("تم حفظ العرض وتفعيله في السلة."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "تعذر حفظ العرض."); }
    finally { setSaving(false); }
  };
  return <form onSubmit={save} className="space-y-5">
    <div><h2 className="text-xl font-black">عرض الكمية</h2><p className="mt-1 text-sm text-stone-500">اعرض إضافة بسعر خاص عندما يضيف العميل كمية معينة من صنف محدد.</p></div>
    <section className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <label className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-950"><input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} className="mt-0.5 h-4 w-4 accent-emerald-800" /><span><span className="block">تفعيل العرض</span><span className="mt-1 block text-xs font-normal text-emerald-800">يظهر العرض تلقائيًا داخل السلة عند تحقق الكمية.</span></span></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold sm:col-span-2">الصنف<select required={draft.enabled} value={draft.menuItemId} onChange={(e) => setDraft({ ...draft, menuItemId: e.target.value })} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white p-3"><option value="">اختر صنفًا من المنيو</option>{items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-bold">اشتري كمية<input required type="number" min="2" max="20" step="1" value={draft.buyQuantity} onChange={(e) => setDraft({ ...draft, buyQuantity: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-stone-200 p-3" /></label>
        <label className="text-sm font-bold">عدد القطع الإضافية<input required type="number" min="1" max="10" step="1" value={draft.rewardQuantity} onChange={(e) => setDraft({ ...draft, rewardQuantity: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-stone-200 p-3" /></label>
        <label className="text-sm font-bold sm:col-span-2">سعر القطعة الإضافية (جنيه)<input required type="number" min="0" step="0.5" value={draft.rewardPrice} onChange={(e) => setDraft({ ...draft, rewardPrice: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-stone-200 p-3" /></label>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-emerald-950"><Gift className="h-5 w-5" /></span><p className="text-sm leading-6">{selectedItem ? `أضف ${draft.buyQuantity} من «${selectedItem.name}» وخذ ${draft.rewardQuantity} إضافي${draft.rewardQuantity > 1 ? `ة بسعر ${draft.rewardPrice} جنيه للقطعة` : `ة بسعر ${draft.rewardPrice} جنيه`}.` : "معاينة العرض ستظهر هنا بعد اختيار الصنف."}</p></div>
      {message && <p role="status" className="text-sm text-emerald-800">{message}</p>}
      <button disabled={saving || (draft.enabled && (!items.length || !draft.menuItemId))} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-black text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? "جارٍ الحفظ…" : "حفظ إعدادات العرض"}</button>
      {!items.length && <p className="text-xs text-amber-800">أضف أصنافًا إلى المنيو أولًا لتحديد صنف العرض.</p>}
    </section>
  </form>;
}
