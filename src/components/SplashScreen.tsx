import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface SplashScreenProps {
  onFinish?: () => void;
}

const routePath = "M 34 130 C 82 130 63 91 111 91 S 156 115 190 77 S 250 54 278 72 S 310 76 326 51";

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const finishTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);

  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    window.clearTimeout(finishTimer.current);
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 300);
  };

  useEffect(() => {
    finishTimer.current = window.setTimeout(finish, 5000);
    return () => {
      window.clearTimeout(finishTimer.current);
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible) return null;

  return <div dir="rtl" style={{ backgroundColor: "#062d1d" }} className="fixed inset-0 z-50 grid min-h-[100svh] place-items-center overflow-y-auto px-4 py-5 text-white sm:px-6">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(22,120,71,0.42),transparent_58%),linear-gradient(145deg,#062d1d,#031b12)]" />
    <main className={`relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center transition-transform duration-300 ${leaving ? "scale-95" : "scale-100"}`}>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-[#093b27] px-3.5 py-1.5 text-[11px] font-bold text-amber-100 sm:mb-4 sm:text-xs">
        <MapPin className="h-3.5 w-3.5 text-amber-300" /> حلوان · الرشاح
      </div>

      <div className="relative mb-3 sm:mb-4">
        <div aria-hidden="true" className="absolute -inset-3 rounded-full bg-amber-300/15 blur-xl motion-safe:animate-pulse" />
        <div className="relative rounded-full bg-gradient-to-br from-amber-100 via-amber-400 to-emerald-200 p-1 shadow-[0_0_40px_rgba(252,211,77,0.2)]">
          <img src="/mr-zinger-logo.jpg" alt="شعار مستر زنجر" className="h-20 w-20 rounded-full border-2 border-[#073522] object-cover sm:h-24 sm:w-24" />
        </div>
      </div>

      <p className="text-[10px] font-black tracking-[0.25em] text-amber-300 sm:text-xs">MR. ZINGER · SINCE 2019</p>
      <h1 className="mt-1 font-cairo text-2xl font-black text-white sm:text-3xl">مشوارك لمطعم مستر زنجر</h1>
      <p className="mt-1 text-xs text-emerald-100/80 sm:text-sm">اتبع الطريق… مستر زنجر مستنيك</p>

      <section aria-label="رحلة على الطريق إلى مطعم مستر زنجر" className="relative mt-5 w-full max-w-[420px] overflow-hidden rounded-[1.6rem] border border-emerald-100/15 bg-[#0a3b29] p-2 shadow-[0_20px_70px_rgba(0,0,0,0.3)] sm:mt-6 sm:p-3">
        <div className="absolute inset-0 opacity-40" aria-hidden="true" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)", backgroundSize: "25px 25px" }} />
        <div className="relative h-36 sm:h-40">
          <div className="absolute left-2 top-2 z-10 rounded-lg bg-[#062d1d]/90 px-2.5 py-1 text-[10px] font-bold text-emerald-100">أنت هنا</div>
          <div className="absolute right-1 top-1 z-10 inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-[10px] font-black text-emerald-950"><MapPin className="h-3 w-3" /> مستر زنجر</div>
          <svg viewBox="0 0 360 160" className="h-full w-full overflow-visible" role="img" aria-label="شخص يتحرك عبر طريق متعرج نحو المطعم">
            <path d="M 8 43 H 65 Q 82 43 82 60 V 72 H 143 Q 158 72 158 58 V 34 H 225 Q 243 34 243 50 V 103 H 300 Q 314 103 314 90 V 66 H 352" fill="none" stroke="rgba(211,235,220,.12)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 12 142 V 116 Q 12 105 25 105 H 66 M 178 9 V 32 Q 178 43 191 43 H 220 M 344 120 V 145 H 282" fill="none" stroke="rgba(211,235,220,.10)" strokeWidth="9" strokeLinecap="round" />
            <path d={routePath} fill="none" stroke="rgba(223,239,228,.28)" strokeWidth="12" strokeLinecap="round" />
            <path className="splash-route" d={routePath} pathLength="1" fill="none" stroke="#f8c84a" strokeWidth="4" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
            <circle cx="34" cy="130" r="8" fill="#b8e0c4" stroke="#0a3b29" strokeWidth="4" />
            <g aria-hidden="true">
              <animateMotion dur="4.7s" repeatCount="1" fill="freeze" rotate="0" path={routePath} />
              <circle cx="0" cy="0" r="12" fill="rgba(248,200,74,.18)" stroke="rgba(248,200,74,.7)" strokeWidth="1.5" />
              <circle cx="0" cy="-16" r="5.5" fill="#ffd279" stroke="#062d1d" strokeWidth="1.5" />
              <path d="M0 -10 L0 2 M0 -6 L-7 0 M0 -6 L7 -1 M0 2 L-5 12 M0 2 L6 11" fill="none" stroke="#f4fff6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 -1 L12 1" fill="none" stroke="#ffd279" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            <g transform="translate(326 31)" aria-hidden="true">
              <rect x="-14" y="-2" width="28" height="22" rx="3" fill="#fff2c9" stroke="#f6c84c" strokeWidth="2" />
              <path d="M-14 2 L-11 -7 H11 L14 2 Q13 8 9 4 Q5 8 1 4 Q-3 8 -7 4 Q-12 8 -14 2Z" fill="#f6c84c" stroke="#fff2c9" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M-9 9 H-4 V15 H-9 Z M5 9 H10 V15 H5 Z" fill="#4d9a78" />
              <path d="M-2 9 H3 V20 H-2 Z" fill="#0a3b29" />
              <circle cx="0" cy="2" r="23" fill="none" stroke="rgba(255,210,90,.3)" strokeWidth="2"><animate attributeName="r" values="18;26;18" dur="1.8s" repeatCount="indefinite" /></circle>
            </g>
          </svg>
        </div>
      </section>

      <div className="mt-4 w-52 sm:mt-5 sm:w-60">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="splash-progress h-full w-full origin-right rounded-full bg-gradient-to-l from-amber-200 via-amber-400 to-emerald-300" /></div>
        <p className="mt-2 text-[11px] font-medium text-emerald-100/70">رحلة قصيرة… وطعم يستاهل</p>
      </div>
    </main>

    <style>{`@keyframes drawRoute { to { stroke-dashoffset: 0; } } @keyframes travelProgress { to { transform: scaleX(1); } } .splash-route { animation: drawRoute 4.7s linear forwards; } .splash-progress { transform: scaleX(0); animation: travelProgress 4.8s linear forwards; } @media (prefers-reduced-motion: reduce) { .splash-route,.splash-progress { animation-duration: .01ms; } }`}</style>
  </div>;
};
