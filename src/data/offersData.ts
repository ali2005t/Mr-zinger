export interface SpecialOffer {
  id: string;
  title: string;
  badge: string;
  originalPrice: number;
  offerPrice: number;
  savings: number;
  description: string;
  items: string[];
  imageUrl?: string;
  isPopular?: boolean;
}

export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: "off-mix-happiness",
    title: "عرض مكس السعادة",
    badge: "وفر 45 جنيه",
    originalPrice: 230,
    offerPrice: 185,
    savings: 45,
    description: "وجبة متنوعة تجمع بين البيتزا والكريب الحادق والبطاطس.",
    items: [
      "1 بيتزا وسط من اختيارك (أي نوع)",
      "1 كريب حادق كبير مقرمش (دجاج أو لحوم)",
      "1 باكت بطاطس فارم فريتس مقلية",
      "صوص كاتشب ومايونيز هدية",
    ],
    isPopular: true,
  },
  {
    id: "off-super-zinger-combo",
    title: "كومبو مستر زنجر سوبر",
    badge: "الأكثر طلباً",
    originalPrice: 180,
    offerPrice: 150,
    savings: 30,
    description: "وجبة مستر زنجر مع كريب شوكولاتة نوتيلا وصوص رانش.",
    items: [
      "1 وجبة مستر زنجر (قطع زنجر حار + ريزو + بطاطس)",
      "1 كريب شوكولاتة نوتيلا حلو غني",
      "علبة صوص رانش خاصة",
    ],
    isPopular: true,
  },
  {
    id: "off-double-pizza-gathering",
    title: "عرض اللمة والصحاب (دبل بيتزا)",
    badge: "وفر 70 جنيه",
    originalPrice: 420,
    offerPrice: 350,
    savings: 70,
    description: "بيتزتان كبيرتان مع بطاطس بالموتزاريلا وصوص الرانش، مناسبة للمشاركة.",
    items: [
      "2 بيتزا حجم كبير L من اختيارك",
      "1 طبق بطاطس بالموتزاريلا السايحة",
      "2 صوص رانش كريمي مخصوص",
    ],
    isPopular: true,
  },
  {
    id: "off-trio-syrian",
    title: "عرض التوفير السوري (3 سندوتشات)",
    badge: "وفر 25 جنيه",
    originalPrice: 180,
    offerPrice: 155,
    savings: 25,
    description: "ثلاثة سندوتشات سورية متنوعة مع الثومية والمخلل.",
    items: [
      "1 سندوتش سوري شاورما فراخ عربي",
      "1 سندوتش سوري زنجر مقرمش سبايسي",
      "1 سندوتش سوري دجاج كرسبي",
      "طبق ثومية ومخلل سوري مميز",
    ],
  },
  {
    id: "off-crunchy-party",
    title: "عرض كرانشي بارتي",
    badge: "وفر 45 جنيه",
    originalPrice: 260,
    offerPrice: 215,
    savings: 45,
    description: "سندوتشا زنجر رانش وسندوتشا كرانشي تشيز، مع بطاطس مقرمشة.",
    items: [
      "2 سندوتش زنجر رانش حجم كبير",
      "2 ساندوتش كرانشي تشيز شيدر سايح",
      "باكت بطاطس فارم فريتس مقرمشة",
    ],
  },
  {
    id: "off-double-crepe-sweet",
    title: "عرض دبل كريب وحلو",
    badge: "وفر 50 جنيه",
    originalPrice: 310,
    offerPrice: 260,
    savings: 50,
    description: "كريبان حادقان كبيران مع كريب شوكولاتة أوريو للتحلية.",
    items: [
      "2 كريب زنجر أو مكس فراخ حجم كبير L",
      "1 كريب شوكولاتة أوريو مقرمش حلو",
      "صوصات إضافية مجانية",
    ],
  },
];
