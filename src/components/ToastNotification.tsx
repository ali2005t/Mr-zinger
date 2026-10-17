import React from "react";
import { useCart } from "../context/CartContext";
import { CheckCircle2, X } from "lucide-react";

export const ToastNotification: React.FC = () => {
  const { toasts, dismissToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 bg-[#0d5335] text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-700/50 transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-amber-300 truncate">{toast.itemName}</p>
              <p className="text-xs text-emerald-100">{toast.message}</p>
            </div>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-emerald-300 hover:text-white p-1 rounded-lg shrink-0 transition-colors"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
