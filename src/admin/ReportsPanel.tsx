import React, { useMemo, useState } from "react";
import { BadgeCheck, Ban, Banknote, ChartNoAxesCombined, Clock3, ShoppingBasket, TicketPercent, TrendingUp } from "lucide-react";
import { OrderStatus, TrackedOrder } from "../firebase/data";

type Period = "today" | "7days" | "30days" | "custom";
const periods: { id: Period; label: string }[] = [{ id: "today", label: "اليوم" }, { id: "7days", label: "7 أيام" }, { id: "30days", label: "30 يومًا" }, { id: "custom", label: "مخصص" }];
const statuses: { id: OrderStatus; label: string; color: string }[] = [
  { id: "new", label: "جديد", color: "bg-blue-500" }, { id: "preparing", label: "قيد التجهيز", color: "bg-amber-500" },
  { id: "ready", label: "جاهز", color: "bg-violet-500" }, { id: "out_for_delivery", label: "في الطريق", color: "bg-cyan-500" },
  { id: "completed", label: "مكتمل", color: "bg-emerald-500" }, { id: "cancelled", label: "ملغي", color: "bg-red-400" },
];

export function ReportsPanel({ orders }: { orders: TrackedOrder[] }) {
  const [period, setPeriod] = useState<Period>("today");
  const [dateFrom, setDateFrom] = useState(() => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; });
  const [dateTo, setDateTo] = useState(() => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; });
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  if (period === "7days") start.setDate(start.getDate() - 6);
  if (period === "30days") start.setDate(start.getDate() - 29);
  if (period === "custom" && dateFrom) { const selectedStart = new Date(`${dateFrom}T00:00:00`); if (!Number.isNaN(selectedStart.getTime())) start.setTime(selectedStart.getTime()); }
  const end = period === "custom" && dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : now.getTime();
  const filtered = orders.filter((order) => order.createdAtMs >= start.getTime() && order.createdAtMs <= end && (statusFilter === "all" || order.status === statusFilter));
  const validOrders = filtered.filter((order) => order.status === "completed");
  const revenue = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const average = validOrders.length ? Math.round(revenue / validOrders.length) : 0;
  const discounts = validOrders.reduce((sum, order) => sum + (order.discountAmount ?? 0), 0);

  const days = useMemo(() => {
    const count = period === "today" ? 1 : period === "7days" ? 7 : period === "30days" ? 30 : Math.min(90, Math.max(1, Math.ceil((new Date(`${dateTo || dateFrom}T00:00:00`).getTime() - start.getTime()) / 86_400_000) + 1));
    const dayList = Array.from({ length: count }, (_, index) => {
      const day = new Date(start); day.setDate(start.getDate() + index);
      return { key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`, date: day, total: 0, orders: 0 };
    });
    validOrders.forEach((order) => {
      const orderDate = new Date(order.createdAtMs || 0);
      const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}-${orderDate.getDate()}`;
      const day = dayList.find((item) => item.key === key);
      if (day) { day.total += order.totalAmount; day.orders += 1; }
    });
    return dayList;
  }, [orders, period, dateFrom, dateTo, statusFilter]);
  const maxRevenue = Math.max(1, ...days.map((day) => day.total));
  const topItems = new Map<string, number>();
  validOrders.forEach((order) => order.items?.filter((item) => !item.isPromotionItem).forEach((item) => topItems.set(item.name, (topItems.get(item.name) ?? 0) + item.quantity)));
  const topList = [...topItems.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return <section className="space-y-5">
    <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-l from-emerald-950 via-emerald-900 to-emerald-800 p-5 text-white shadow-lg sm:flex-row sm:items-center sm:p-6">
      <div><div className="flex items-center gap-2 text-emerald-200"><ChartNoAxesCombined className="h-5 w-5" /><span className="text-xs font-bold">لوحة أداء المطعم</span></div><h2 className="mt-2 text-2xl font-black">التقارير والتحليلات</h2><p className="mt-1 text-xs text-emerald-100/75">قراءة سريعة للمبيعات والطلبات والأصناف الأكثر طلبًا.</p></div>
      <div className="flex rounded-xl bg-black/15 p-1">{periods.map((item) => <button key={item.id} onClick={() => setPeriod(item.id)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${period === item.id ? "bg-amber-400 text-emerald-950 shadow" : "text-white/80 hover:bg-white/10"}`}>{item.label}</button>)}</div>
    </div>

    <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-3">{period === "custom" && <><label className="text-xs font-bold text-stone-600">من تاريخ<input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1.5 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"/></label><label className="text-xs font-bold text-stone-600">إلى تاريخ<input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1.5 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"/></label></>}<label className="text-xs font-bold text-stone-600">تصفية حسب الحالة<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)} className="mt-1.5 block w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"><option value="all">كل الحالات</option>{statuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}</select></label></div>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ReportMetric icon={Banknote} label="المبيعات المحققة" value={`${revenue.toLocaleString("ar-EG")} جنيه`} hint="من الطلبات التي تم تسليمها فقط" tone="emerald" />
      <ReportMetric icon={ShoppingBasket} label="الطلبات المعروضة" value={filtered.length.toLocaleString("ar-EG")} hint={`${validOrders.length} طلب مكتمل ومسلّم`} tone="blue" />
      <ReportMetric icon={TrendingUp} label="متوسط الطلب" value={`${average.toLocaleString("ar-EG")} جنيه`} hint="متوسط قيمة الطلب الصالح" tone="amber" />
      <ReportMetric icon={TicketPercent} label="خصومات الكوبونات" value={`${discounts.toLocaleString("ar-EG")} جنيه`} hint="إجمالي الخصومات المسجلة" tone="violet" />
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between"><div><h3 className="font-black text-stone-900">المبيعات خلال الفترة</h3><p className="mt-1 text-xs text-stone-500">إجمالي الطلبات التي تم تسليمها بالفعل</p></div><span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800">{periods.find((item) => item.id === period)?.label}</span></div>
        <div className="mt-5 flex h-48 items-end gap-1 overflow-x-auto border-b border-stone-100 pb-2 sm:gap-2">{days.map((day) => <div key={day.key} title={`${day.date.toLocaleDateString("ar-EG")}: ${day.total} جنيه · ${day.orders} طلب`} className="group flex h-full min-w-7 flex-1 flex-col items-center justify-end gap-1 sm:min-w-8"><span className="max-w-full truncate text-[9px] text-stone-500 sm:text-[10px]">{day.total ? day.total.toLocaleString("ar-EG") : ""}</span><div className="relative min-h-1 w-full max-w-10 rounded-t-md bg-emerald-600 transition-all group-hover:bg-amber-400" style={{ height: `${Math.max(3, day.total / maxRevenue * 78)}%` }} /><span className="text-[9px] text-stone-500">{period === "today" ? "اليوم" : day.date.toLocaleDateString("ar-EG", { day: "numeric", month: period === "30days" ? "numeric" : undefined })}</span></div>)}</div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />إيراد الطلبات بالجنيه المصري</div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"><h3 className="font-black text-stone-900">حالة الطلبات</h3><p className="mt-1 text-xs text-stone-500">توزيع الطلبات المعروضة في الفترة</p><div className="mt-4 space-y-3">{statuses.map((status) => { const total = filtered.filter((order) => order.status === status.id).length; const percent = filtered.length ? total / filtered.length * 100 : 0; return <div key={status.id}><div className="mb-1 flex justify-between text-xs"><span className="text-stone-600">{status.label}</span><strong className="text-stone-900">{total}</strong></div><div className="h-2 overflow-hidden rounded-full bg-stone-100"><div className={`h-full rounded-full ${status.color}`} style={{ width: `${percent}%` }} /></div></div>; })}</div><div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500"><Ban className="h-4 w-4 text-red-500" />الطلبات الملغاة: {filtered.filter((order) => order.status === "cancelled").length}</div></section>
    </div>

    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="font-black text-stone-900">الأصناف الأكثر طلبًا</h3><p className="mt-1 text-xs text-stone-500">حسب الكمية في الطلبات غير الملغاة</p></div><Clock3 className="h-5 w-5 text-emerald-700" /></div>{topList.length ? <div className="space-y-2">{topList.map(([name, quantity], index) => <div key={name} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${index === 0 ? "bg-amber-300 text-amber-950" : "bg-white text-stone-600"}`}>{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-bold text-stone-800">{name}</span><strong className="text-xs text-emerald-800">{quantity} قطعة</strong></div>)}</div> : <p className="rounded-xl bg-stone-50 p-5 text-sm text-stone-500">لا توجد طلبات في هذه الفترة.</p>}<p className="mt-4 text-[10px] text-stone-400">تعتمد المؤشرات على آخر 100 طلب محفوظ في النظام.</p></section>
  </section>;
}

function ReportMetric({ icon: Icon, label, value, hint, tone }: { icon: React.ElementType; label: string; value: string; hint: string; tone: "emerald" | "blue" | "amber" | "violet" }) {
  const tones = { emerald: "bg-emerald-50 text-emerald-800", blue: "bg-blue-50 text-blue-800", amber: "bg-amber-50 text-amber-800", violet: "bg-violet-50 text-violet-800" };
  return <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-bold text-stone-500">{label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></span></div><strong className="mt-3 block text-2xl font-black text-stone-900">{value}</strong><p className="mt-1 text-[10px] text-stone-400">{hint}</p></div>;
}
