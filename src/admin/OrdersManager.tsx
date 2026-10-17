import React from "react";
import { Clock3, MapPin, Phone, RefreshCw, Volume2, VolumeX, ShoppingBag, MessageCircle } from "lucide-react";
import { OrderStatus, TrackedOrder } from "../firebase/data";
import { getWhatsAppUrl } from "../utils/whatsapp";
import { RESTAURANT_CONFIG } from "../data/restaurantConfig";

const statusLabels: Record<OrderStatus, string> = {
  new: "طلب جديد", preparing: "قيد التجهيز", ready: "جاهز", out_for_delivery: "خرج للتوصيل", completed: "مكتمل", cancelled: "ملغي",
};
const statusColors: Record<OrderStatus, string> = {
  new: "bg-blue-50 text-blue-800", preparing: "bg-amber-50 text-amber-800", ready: "bg-violet-50 text-violet-800",
  out_for_delivery: "bg-cyan-50 text-cyan-800", completed: "bg-emerald-50 text-emerald-800", cancelled: "bg-red-50 text-red-800",
};

function createStatusMessage(order: TrackedOrder, orderNumber: string) {
  const statusText: Record<OrderStatus, string> = {
    new: "\u062a\u0645 \u0627\u0633\u062a\u0644\u0627\u0645 \u0637\u0644\u0628\u0643 \u0648\u0646\u0639\u0645\u0644 \u0639\u0644\u0649 \u0645\u0631\u0627\u062c\u0639\u062a\u0647.",
    preparing: "\u0637\u0644\u0628\u0643 \u0642\u064a\u062f \u0627\u0644\u062a\u062c\u0647\u064a\u0632 \u0627\u0644\u0622\u0646.",
    ready: "\u0637\u0644\u0628\u0643 \u062c\u0627\u0647\u0632 \u0644\u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0645\u0646 \u0627\u0644\u0641\u0631\u0639.",
    out_for_delivery: "\u0637\u0644\u0628\u0643 \u062e\u0631\u062c \u0644\u0644\u062a\u0648\u0635\u064a\u0644. \u0646\u062a\u0645\u0646\u0649 \u0644\u0643 \u0648\u062c\u0628\u0629 \u0634\u0647\u064a\u0629.",
    completed: "\u0627\u0643\u062a\u0645\u0644 \u0637\u0644\u0628\u0643. \u0634\u0643\u0631\u064b\u0627 \u0644\u0627\u062e\u062a\u064a\u0627\u0631\u0643 \u0645\u0633\u062a\u0631 \u0632\u0646\u062c\u0631.",
    cancelled: "\u062a\u0645 \u0625\u0644\u063a\u0627\u0621 \u0637\u0644\u0628\u0643. \u064a\u0633\u0639\u062f\u0646\u0627 \u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0641\u064a \u0623\u064a \u0648\u0642\u062a.",
  };
  return [
    `\u0645\u0631\u062d\u0628\u064b\u0627 ${order.customerName}،`,
    "",
    "\u062a\u062d\u062f\u064a\u062b \u0637\u0644\u0628\u0643 \u0645\u0646 \u0645\u0633\u062a\u0631 \u0632\u0646\u062c\u0631:",
    statusText[order.status] ?? statusText.new,
    `\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628: ${orderNumber}`,
    `\u0627\u0644\u0641\u0631\u0639: ${order.branchName}`,
    "",
    "\u0634\u0643\u0631\u064b\u0627 \u0644\u062b\u0642\u062a\u0643 \u0628\u0646\u0627.",
  ].join("\n");
}
export const OrdersManager: React.FC<{
  orders: TrackedOrder[];
  loading: boolean;
  error: string;
  onStatusChange: (id: string, status: OrderStatus) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}> = ({ orders, loading, error, onStatusChange, soundEnabled, onToggleSound }) => {
  const count = (status: OrderStatus) => orders.filter((order) => order.status === status).length;
  return <div className="space-y-5">
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-xl font-black text-stone-900">متابعة الطلبات</h2><p className="mt-1 text-sm text-stone-500">تابع الطلبات وغيّر حالتها؛ الطلبات الجديدة ستصدر صوت تنبيه عند تفعيل الصوت.</p></div>
        <button type="button" aria-pressed={soundEnabled} onClick={onToggleSound} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black ${soundEnabled ? "bg-emerald-100 text-emerald-900" : "bg-stone-100 text-stone-700"}`}>
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}{soundEnabled ? "صوت الطلبات مفعّل" : "تفعيل صوت الطلبات"}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="إجمالي المعروض" value={orders.length} tone="stone" /><Metric label="جديدة" value={count("new")} tone="blue" />
        <Metric label="قيد التجهيز" value={count("preparing")} tone="amber" /><Metric label="في الطريق" value={count("out_for_delivery")} tone="cyan" />
      </div>
    </section>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    {loading && <div className="flex items-center gap-2 text-sm text-stone-500"><RefreshCw className="h-4 w-4 animate-spin" /> جارٍ تحميل الطلبات…</div>}
    {!loading && !orders.length && <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-stone-500">لا توجد طلبات محفوظة حتى الآن.</div>}
    <div className="space-y-4">
      {orders.map((order) => {
        const date = order.createdAt?.toDate?.() ?? new Date(order.createdAtMs || Date.now());
        const displayNumber = order.orderNumber ?? String(order.createdAtMs || "");
        return <article key={order.id} className={`min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${order.status === "new" ? "border-blue-200 ring-1 ring-blue-100" : "border-stone-200"}`}>
          <header className={`flex flex-col gap-3 border-b p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4 ${order.status === "new" ? "border-blue-100 bg-blue-50/60" : "border-stone-100 bg-stone-50/70"}`}>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-stone-900">{order.customerName || "عميل"}</h3>{order.status === "new" && <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-black text-white"><ShoppingBag className="h-3 w-3" />وصل حديثًا</span>}</div>
              {displayNumber && <p className="mt-1 text-xs font-bold text-emerald-800">رقم الطلب: <span dir="ltr" className="tabular-nums">{displayNumber}</span></p>}
              <p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><Clock3 className="h-3.5 w-3.5" />{date.toLocaleString("ar-EG")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-2.5 py-2 text-xs font-bold ${statusColors[order.status] ?? statusColors.new}`}>{statusLabels[order.status] ?? statusLabels.new}</span>
              <label className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold"><span>تغيير الحالة</span><select aria-label="تغيير حالة الطلب" className="max-w-36 bg-transparent py-1 outline-none" value={order.status ?? "new"} onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              {order.customerPhone && <a href={getWhatsAppUrl(order.customerPhone, createStatusMessage(order, displayNumber || order.id))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900"><MessageCircle className="h-4 w-4" />{"\u0625\u0628\u0644\u0627\u063a \u0648\u0627\u062a\u0633\u0627\u0628"}</a>}
            </div>
          </header>
          <div className="grid min-w-0 gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-stone-100 p-3 text-sm">
              <p className="flex flex-wrap items-center gap-2"><Phone className="h-4 w-4 text-emerald-800" /><a dir="ltr" className="font-semibold text-emerald-900 hover:underline" href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>{order.customerPhone2 && <a dir="ltr" className="text-xs text-stone-500 hover:underline" href={`tel:${order.customerPhone2}`}>{order.customerPhone2}</a>}</p>
              <p className="flex items-start gap-2 text-stone-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" /><span>{order.deliveryMethod === "delivery" ? "توصيل" : "استلام من الفرع"} — {order.branchName}</span></p>
              {order.deliveryMethod === "delivery" && <p className="pr-6 text-xs leading-5 text-stone-600">{[order.manualAddress, order.addressDetails].filter(Boolean).join("، ") || "لم يُكتب عنوان يدوي"}{order.location?.mapsUrl && <><br /><a href={order.location.mapsUrl} target="_blank" rel="noreferrer" className="font-bold text-emerald-800 hover:underline">فتح الموقع على الخريطة</a></>}</p>}
              {order.deliveryMethod === "pickup" && <p className="pr-6 text-xs leading-5 text-stone-500">{order.branchAddress}</p>}
              <p className="pr-6 text-xs font-bold text-stone-700">طريقة الدفع: {order.paymentMethodLabel || "الدفع عند الاستلام"}</p>
              {order.notes && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">ملاحظات: {order.notes}</p>}
            </div>
            <div className="min-w-0 rounded-xl bg-stone-50 p-3"><h4 className="mb-2 text-xs font-black text-stone-700">تفاصيل الطلب</h4>
              <ul className="space-y-2 text-xs text-stone-600">{(order.items ?? []).map((item, index) => <li key={`${item.id}-${index}`} className="flex justify-between gap-3"><span className="min-w-0">{item.name}{item.sizeLabel ? ` (${item.sizeLabel})` : ""} × {item.quantity}</span><span className="shrink-0 font-bold">{item.unitPrice * item.quantity} ج</span></li>)}</ul>
              {order.couponCode && <p className="mt-3 flex justify-between border-t border-stone-200 pt-2 text-xs text-emerald-800"><span>الكوبون {order.couponCode}</span><span>خصم {order.discountAmount ?? 0} ج</span></p>}
              <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-sm font-black text-stone-900"><span>الإجمالي</span><span>{order.totalAmount} جنيه</span></div>
            </div>
          </div>
        </article>;
      })}
    </div>
  </div>;
};

function Metric({ label, value, tone }: { label: string; value: number; tone: "stone" | "blue" | "amber" | "cyan" }) {
  const tones = { stone: "bg-stone-50 text-stone-900", blue: "bg-blue-50 text-blue-900", amber: "bg-amber-50 text-amber-900", cyan: "bg-cyan-50 text-cyan-900" };
  return <div className={`rounded-xl px-3 py-2.5 ${tones[tone]}`}><p className="text-[11px] opacity-70">{label}</p><strong className="text-lg font-black">{value}</strong></div>;
}
