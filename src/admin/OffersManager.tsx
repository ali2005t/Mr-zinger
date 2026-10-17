import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SPECIAL_OFFERS, SpecialOffer } from "../data/offersData";
import { saveImageAsText } from "../firebase/data";
import { useDatabaseImage } from "../hooks/useDatabaseImage";

export const OffersManager: React.FC<{ offers: SpecialOffer[]; onSave: (offers: SpecialOffer[]) => Promise<void> }> = ({ offers, onSave }) => {
  const [draft, setDraft] = useState(offers);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  React.useEffect(() => setDraft(offers), [offers]);
  const patch = (id: string, values: Partial<SpecialOffer>) => setDraft((list) => list.map((offer) => offer.id === id ? { ...offer, ...values, savings: Math.max(0, (values.originalPrice ?? offer.originalPrice) - (values.offerPrice ?? offer.offerPrice)) } : offer));
  const save = async () => { setSaving(true); setMessage(""); try { await onSave(draft); setMessage("تم حفظ العروض. تظل مخفية عن الزبائن حتى تفعيل قسم العروض بالموقع."); } catch (error) { setMessage(error instanceof Error ? error.message : "تعذر حفظ العروض."); } finally { setSaving(false); } };
  const add = () => setDraft((items) => [{ id: `offer-${Date.now()}`, title: "عرض جديد", badge: "عرض خاص", originalPrice: 0, offerPrice: 0, savings: 0, description: "", items: [] }, ...items]);
  return <div className="space-y-5"><div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center"><div><h2 className="text-xl font-black">إدارة العروض</h2><p className="mt-1 text-xs leading-5 text-stone-500 sm:text-sm">جهّز العروض وصورها من هنا. قسم العروض ما زال مخفيًا عن الموقع كما طلبت.</p></div><button onClick={add} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" />إضافة عرض</button></div>
    <div className="space-y-4">{draft.map((offer) => <OfferEditor key={offer.id} offer={offer} onChange={(values) => patch(offer.id, values)} onDelete={() => setDraft((items) => items.filter((entry) => entry.id !== offer.id))} />)}</div>
    {message && <p role="status" className="text-sm text-emerald-800">{message}</p>}<button disabled={saving} onClick={() => void save()} className="rounded-xl bg-emerald-800 px-5 py-3 font-black text-white disabled:opacity-50">{saving ? "جارٍ الحفظ..." : "حفظ كل العروض"}</button>
  </div>;
};

function OfferEditor({ offer, onChange, onDelete }: { offer: SpecialOffer; onChange: (values: Partial<SpecialOffer>) => void; onDelete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const preview = useDatabaseImage(offer.imageUrl);
  const inputClass = "w-full rounded-lg border border-stone-200 p-2.5 text-sm";
  return <article className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:p-4 md:grid-cols-2"><div className="flex items-center justify-between md:col-span-2"><strong>{offer.title}</strong><button aria-label="حذف العرض" onClick={onDelete} className="rounded-lg bg-red-50 p-2 text-red-700"><Trash2 className="h-4 w-4" /></button></div>
    <label className="text-xs font-bold">اسم العرض<input className={inputClass} value={offer.title} onChange={(e) => onChange({ title: e.target.value })} /></label><label className="text-xs font-bold">الشارة<input className={inputClass} value={offer.badge} onChange={(e) => onChange({ badge: e.target.value })} /></label>
    <label className="text-xs font-bold">السعر قبل العرض<input type="number" min="0" className={inputClass} value={offer.originalPrice} onChange={(e) => onChange({ originalPrice: Number(e.target.value) })} /></label><label className="text-xs font-bold">سعر العرض<input type="number" min="0" className={inputClass} value={offer.offerPrice} onChange={(e) => onChange({ offerPrice: Number(e.target.value) })} /></label>
    <label className="text-xs font-bold md:col-span-2">وصف العرض<textarea rows={2} className={inputClass} value={offer.description} onChange={(e) => onChange({ description: e.target.value })} /></label>
    <label className="text-xs font-bold md:col-span-2">محتويات العرض (كل صنف في سطر)<textarea rows={3} className={inputClass} value={offer.items.join("\n")} onChange={(e) => onChange({ items: e.target.value.split("\n").filter(Boolean) })} /></label>
    <div className="flex min-w-0 flex-wrap items-center gap-2 md:col-span-2 sm:gap-3"><input type="file" accept="image/*" disabled={uploading} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { onChange({ imageUrl: await saveImageAsText(file) }); } finally { setUploading(false); } }} /><input type="checkbox" checked={Boolean(offer.isPopular)} onChange={(e) => onChange({ isPopular: e.target.checked })} /><span className="text-xs">عرض مميز</span>{uploading && <span className="text-xs text-emerald-800">جارٍ الرفع...</span>}{preview && <img src={preview} alt="معاينة العرض" className="h-14 w-14 rounded-lg object-cover" />}</div>
  </article>;
}
