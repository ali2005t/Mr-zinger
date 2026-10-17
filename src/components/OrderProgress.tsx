import React, { useEffect, useState } from "react";
import { Check, Clock3, PackageCheck, ChefHat, Bike, CheckCircle2 } from "lucide-react";
import { TrackedOrder } from "../firebase/data";

const stages = [
  { key: "new", label: "تم استلام الطلب", Icon: PackageCheck },
  { key: "preparing", label: "قيد التحضير", Icon: ChefHat },
  { key: "ready", label: "جاهز", Icon: CheckCircle2 },
  { key: "out_for_delivery", label: "في الطريق", Icon: Bike },
  { key: "completed", label: "تم التسليم", Icon: Check },
] as const;

export function OrderProgress({ order }: { order: TrackedOrder }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (order.status === "cancelled") return <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-800">تم إلغاء الطلب. تواصل مع دعم المطعم إذا كنت تحتاج مساعدة.</p>;
  const shownStages = order.deliveryMethod === "delivery" ? stages : stages.filter((stage) => stage.key !== "out_for_delivery");
  const currentIndex = Math.max(0, shownStages.findIndex((stage) => stage.key === order.status));
  const etaMs = order.estimatedReadyAtMs;
  const remaining = etaMs ? Math.ceil((etaMs - now) / 60_000) : null;
  const etaText = order.status === "completed" ? "تم إكمال طلبك بنجاح — وجبة طيبة!" : order.status === "out_for_delivery" ? "طلبك في الطريق إليك" : order.status === "ready" ? "طلبك جاهز" : remaining === null ? "المدة المتوقعة تظهر بعد تحديث الطلب" : remaining > 0 ? `الوقت المتوقع للتجهيز: حوالي ${remaining} دقيقة` : "يجري تجهيز طلبك الآن";

  return <div className="space-y-3 rounded-2xl bg-stone-50 p-3 sm:p-4">
    <div className="flex items-center gap-2 text-xs font-black text-emerald-900"><Clock3 className="h-4 w-4"/>{etaText}</div>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {shownStages.map(({ key, label, Icon }, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        return <div key={key} className={`flex min-w-0 flex-col items-center gap-1 text-center text-[10px] leading-4 sm:text-xs ${reached ? "font-bold text-emerald-900" : "text-stone-400"}`}><span className={`grid h-8 w-8 place-items-center rounded-full ${reached ? "bg-emerald-800 text-white" : "bg-white text-stone-400 ring-1 ring-stone-200"} ${current ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}><Icon className="h-4 w-4"/></span><span>{label}</span></div>;
      })}
    </div>
    {order.status === "new" && <p className="text-[11px] text-stone-500">بدأنا استلام طلبك، وستتحدث الحالة هنا تلقائيًا عند انتقاله للمرحلة التالية.</p>}
  </div>;
}
