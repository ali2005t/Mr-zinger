import React, { useEffect, useState } from "react";
import { RESTAURANT_CONFIG, BranchInfo } from "../data/restaurantConfig";
import { RestaurantSettings } from "../firebase/data";

const initialSettings: RestaurantSettings = {
  branches: RESTAURANT_CONFIG.branches,
  openingHours: RESTAURANT_CONFIG.openingHours,
  deliveryFee: 0,
  deliveryEnabled: true,
  pickupEnabled: true,
};

export const defaultRestaurantSettings = initialSettings;

export const RestaurantSettingsManager: React.FC<{
  settings: RestaurantSettings;
  saving: boolean;
  onSave: (settings: RestaurantSettings) => Promise<void>;
}> = ({ settings, saving, onSave }) => {
  const [draft, setDraft] = useState(settings);
  const [message, setMessage] = useState("");
  useEffect(() => setDraft(settings), [settings]);
  const patchBranch = (index: number, patch: Partial<BranchInfo>) => setDraft((current) => ({
    ...current,
    branches: current.branches.map((branch, branchIndex) => branchIndex === index ? { ...branch, ...patch } : branch),
  }));

  return <form className="space-y-5" onSubmit={async (event) => {
    event.preventDefault(); setMessage("");
    try { await onSave(draft); setMessage("تم حفظ إعدادات المطعم."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "تعذر الحفظ."); }
  }}>
    <div><h2 className="text-xl font-black">الفروع والتوصيل</h2><p className="mt-1 text-sm text-stone-500">تظهر التغييرات على الموقع بعد الحفظ.</p></div>
    <label className="block rounded-2xl bg-white p-4"><span className="mb-2 block text-sm font-bold">مواعيد العمل</span><input required value={draft.openingHours} onChange={(e) => setDraft({ ...draft, openingHours: e.target.value })} className="w-full rounded-xl border border-stone-200 p-3" /></label>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="rounded-2xl bg-white p-4 text-sm font-bold"><input type="checkbox" checked={draft.deliveryEnabled} onChange={(e) => setDraft({ ...draft, deliveryEnabled: e.target.checked })} className="ml-2" />التوصيل متاح</label>
      <label className="rounded-2xl bg-white p-4 text-sm font-bold"><input type="checkbox" checked={draft.pickupEnabled} onChange={(e) => setDraft({ ...draft, pickupEnabled: e.target.checked })} className="ml-2" />الاستلام من الفرع متاح</label>
    </div>
    <label className="block rounded-2xl bg-white p-4"><span className="mb-2 block text-sm font-bold">رسوم التوصيل (جنيه)</span><input type="number" min="0" value={draft.deliveryFee} onChange={(e) => setDraft({ ...draft, deliveryFee: Number(e.target.value) })} className="w-full rounded-xl border border-stone-200 p-3" /></label>
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">{draft.branches.map((branch, index) => <section key={branch.id} className="min-w-0 space-y-3 rounded-2xl border border-stone-200 bg-white p-3 sm:p-4"><h3 className="font-black">الفرع {index + 1}</h3>
      {([ ["name", "اسم الفرع"], ["address", "العنوان"], ["landmark", "علامة مميزة"], ["phone", "الهاتف"], ["whatsappNumber", "واتساب دولي"], ["mapQuery", "بحث الخريطة"] ] as const).map(([field, label]) => <label key={field} className="block text-xs font-bold text-stone-600">{label}<input value={branch[field]} onChange={(e) => patchBranch(index, { [field]: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-200 p-2.5 text-sm text-stone-900" /></label>)}
    </section>)}</div>
    {message && <p role="status" className="text-sm text-emerald-800">{message}</p>}
    <button disabled={saving} className="rounded-xl bg-emerald-800 px-5 py-3 font-black text-white disabled:opacity-50">{saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}</button>
  </form>;
};
