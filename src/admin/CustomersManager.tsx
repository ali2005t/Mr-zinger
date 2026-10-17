import React, { useMemo, useState } from "react";
import { Download, Search, ShieldAlert, ShieldCheck, UsersRound } from "lucide-react";
import { CustomerAccountRecord } from "../firebase/data";

export function CustomersManager({ customers, loading, onSetBlocked }: {
  customers: CustomerAccountRecord[];
  loading: boolean;
  onSetBlocked: (uid: string, blocked: boolean) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [busyUid, setBusyUid] = useState("");
  const [error, setError] = useState("");
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter((customer) => !term || [customer.name, customer.phone, customer.email].some((value) => value?.toLowerCase().includes(term)));
  }, [customers, search]);
  const exportCsv = () => {
    const columns = ["الاسم", "الهاتف", "البريد", "طريقة الاستلام", "الفرع", "العنوان", "طريقة الدفع", "حالة الحساب", "معرّف الحساب"];
    const rows = filtered.map((customer) => [customer.name, customer.phone, customer.email, customer.deliveryMethod, customer.branchId, customer.manualAddress, customer.paymentMethod, customer.blocked ? "محظور" : "نشط", customer.uid]);
    const csv = "\uFEFF" + [columns, ...rows].map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "mr-zinger-customers.csv"; link.click(); URL.revokeObjectURL(url);
  };
  const toggle = async (customer: CustomerAccountRecord) => {
    setBusyUid(customer.uid); setError("");
    try { await onSetBlocked(customer.uid, !customer.blocked); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر تحديث حالة الحساب."); }
    finally { setBusyUid(""); }
  };
  return <section className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-l from-emerald-950 to-emerald-800 p-5 text-white"><div className="flex items-center gap-3"><UsersRound className="h-6 w-6 text-amber-300"/><div><h2 className="text-xl font-black">حسابات العملاء</h2><p className="mt-1 text-xs text-emerald-100">عرض بيانات الملفات المحفوظة وإدارة حالة الحساب.</p></div></div><button onClick={exportCsv} disabled={!filtered.length} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-emerald-950 disabled:opacity-50"><Download className="h-4 w-4"/>تصدير CSV</button></header>
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border bg-white p-4"><p className="text-xs text-stone-500">الملفات المسجلة</p><strong className="mt-1 block text-2xl font-black">{customers.length}</strong></div><div className="rounded-xl border bg-white p-4"><p className="text-xs text-stone-500">حسابات نشطة</p><strong className="mt-1 block text-2xl font-black text-emerald-800">{customers.filter((customer) => !customer.blocked).length}</strong></div><div className="rounded-xl border bg-white p-4"><p className="text-xs text-stone-500">حسابات محظورة</p><strong className="mt-1 block text-2xl font-black text-red-700">{customers.filter((customer) => customer.blocked).length}</strong></div></div>
    <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5"><Search className="h-4 w-4 text-stone-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو الهاتف أو البريد" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading ? <p className="rounded-xl bg-white p-8 text-center text-sm text-stone-500">جارٍ تحميل حسابات العملاء…</p> : !filtered.length ? <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">لا توجد حسابات مطابقة. ستظهر الملفات بعد أن يحفظ العملاء بياناتهم.</p> : <div className="space-y-3">{filtered.map((customer) => <article key={customer.uid} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-black">{customer.name || "عميل بدون اسم"}</h3><p dir="ltr" className="mt-1 text-right text-sm text-stone-600">{customer.phone || "لا يوجد هاتف"}{customer.phone2 ? ` · ${customer.phone2}` : ""}</p><p dir="ltr" className="mt-1 text-right text-xs text-stone-400">{customer.email || "البريد غير محفوظ"}</p></div><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${customer.blocked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{customer.blocked ? <ShieldAlert className="h-3.5 w-3.5"/> : <ShieldCheck className="h-3.5 w-3.5"/>}{customer.blocked ? "محظور" : "نشط"}</span></div><div className="mt-3 grid gap-2 rounded-xl bg-stone-50 p-3 text-xs text-stone-600 sm:grid-cols-2"><p>الفرع: {customer.branchId || "—"}</p><p>الاستلام: {customer.deliveryMethod === "pickup" ? "من الفرع" : "توصيل"}</p><p className="sm:col-span-2">العنوان: {customer.manualAddress || "غير محفوظ"}{customer.addressDetails ? `، ${customer.addressDetails}` : ""}</p><p>الدفع المفضل: {customer.paymentMethod || "—"}</p><p className="truncate" dir="ltr">UID: {customer.uid}</p></div><button disabled={busyUid === customer.uid} onClick={() => void toggle(customer)} className={`mt-3 rounded-lg px-3 py-2 text-xs font-black disabled:opacity-50 ${customer.blocked ? "bg-emerald-100 text-emerald-900" : "bg-red-50 text-red-700"}`}>{busyUid === customer.uid ? "جارٍ التحديث…" : customer.blocked ? "إلغاء الحظر" : "حظر الحساب"}</button></article>)}</div>}
  </section>;
}
