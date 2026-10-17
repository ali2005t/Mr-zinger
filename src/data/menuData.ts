export type MenuItemSize = "S" | "M" | "L";

export interface MenuItemSizeOption {
  size: MenuItemSize;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price?: number;
  sizes?: MenuItemSizeOption[];
  isSpicy?: boolean;
  isPopular?: boolean;
  description?: string;
  imageUrl?: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  hasSizes: boolean;
  availableSizes?: { size: MenuItemSize; label: string }[];
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "pizza",
    title: "البيتزا",
    subtitle: "عجينة إيطالية هشة بحشوات متنوعة وجبنة ذائبة",
    icon: "🍕",
    hasSizes: true,
    availableSizes: [
      { size: "S", label: "صغير S" },
      { size: "M", label: "وسط M" },
      { size: "L", label: "كبير L" },
    ],
  },
  {
    id: "syrian",
    title: "السندوتشات السورية",
    subtitle: "سندوتشات بخبز الصاج المحمص مع حشوات متنوعة",
    icon: "🌯",
    hasSizes: false,
  },
  {
    id: "crepe-sweet",
    title: "الكريب الحلو",
    subtitle: "كريب بالشوكولاتة والنوتيلا مع إضافات متنوعة",
    icon: "🍫",
    hasSizes: false,
  },
  {
    id: "crepe-savory",
    title: "الكريب الحادق",
    subtitle: "كريب محمص بحشوات متنوعة من الجبن والمكونات الطازجة",
    icon: "🌮",
    hasSizes: true,
    availableSizes: [
      { size: "M", label: "وسط M" },
      { size: "L", label: "كبير L" },
    ],
  },
  {
    id: "meals",
    title: "الوجبات",
    subtitle: "وجبات مشبعة كاملة مع الأرز والبطاطس والصوصات",
    icon: "🍗",
    hasSizes: false,
  },
  {
    id: "beef",
    title: "البيف",
    subtitle: "برجر ولحوم بقري مشوية ومتبلة بعناية",
    icon: "🥩",
    hasSizes: false,
  },
  {
    id: "calzone",
    title: "الكالزوني",
    subtitle: "فطائر إيطالية مغلقة ومحشوة بجبنة الموتزاريلا",
    icon: "🥟",
    hasSizes: false,
  },
  {
    id: "white-sauce",
    title: "الوايت صوص",
    subtitle: "أطباق مكرونة بالصوص الأبيض والجبن",
    icon: "🍝",
    hasSizes: true,
    availableSizes: [
      { size: "S", label: "صغير S" },
      { size: "M", label: "وسط M" },
      { size: "L", label: "كبير L" },
    ],
  },
  {
    id: "fried-chicken",
    title: "الفرايد تشكن",
    subtitle: "قطع دجاج مقرمشة بتتبيلة مستر زنجر الخاصة",
    icon: "🍗",
    hasSizes: false,
  },
  {
    id: "manaqeesh",
    title: "المناقيش",
    subtitle: "مناقيش طازجة ومخبوزة على أصولها",
    icon: "🫓",
    hasSizes: false,
  },
  {
    id: "sandwiches",
    title: "السندوتشات",
    subtitle: "سندوتشات متنوعة تناسب مختلف الأوقات",
    icon: "🥪",
    hasSizes: false,
  },
  {
    id: "hawawshi",
    title: "الحواوشي",
    subtitle: "حواوشي بتتبيلة خاصة وجبنة ذائبة",
    icon: "🥙",
    hasSizes: true,
    availableSizes: [
      { size: "M", label: "وسط M" },
      { size: "L", label: "كبير L" },
    ],
  },
  {
    id: "crunchy-cheese",
    title: "كرانشي تشيز",
    subtitle: "أصناف كرانشي تشيز مع صوصات الجبن والباربيكيو",
    icon: "🧀",
    hasSizes: false,
  },
];

export const MENU_ITEMS: MenuItem[] = [
  // 1. البيتزا
  { id: "pz-1", name: "بيتزا مارجريتا", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 65 }, { size: "M", label: "وسط M", price: 85 }, { size: "L", label: "كبير L", price: 130 }] },
  { id: "pz-2", name: "بيتزا مشروم", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 70 }, { size: "M", label: "وسط M", price: 100 }, { size: "L", label: "كبير L", price: 125 }] },
  { id: "pz-3", name: "بيتزا سلامي", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 70 }, { size: "M", label: "وسط M", price: 110 }, { size: "L", label: "كبير L", price: 130 }] },
  { id: "pz-4", name: "بيتزا رومي مدخن", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 70 }, { size: "M", label: "وسط M", price: 110 }, { size: "L", label: "كبير L", price: 130 }] },
  { id: "pz-5", name: "بيتزا سجق", categoryId: "pizza", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 80 }, { size: "M", label: "وسط M", price: 120 }, { size: "L", label: "كبير L", price: 170 }] },
  { id: "pz-6", name: "بيتزا سوسيس", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 80 }, { size: "M", label: "وسط M", price: 120 }, { size: "L", label: "كبير L", price: 170 }] },
  { id: "pz-7", name: "بيتزا سوسيس مشروم", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 80 }, { size: "M", label: "وسط M", price: 120 }, { size: "L", label: "كبير L", price: 150 }] },
  { id: "pz-8", name: "بيتزا بسطرمة", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 80 }, { size: "M", label: "وسط M", price: 125 }, { size: "L", label: "كبير L", price: 165 }] },
  { id: "pz-9", name: "بيتزا كرسبي ناجتس", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 80 }, { size: "M", label: "وسط M", price: 130 }, { size: "L", label: "كبير L", price: 170 }] },
  { id: "pz-10", name: "بيتزا سوبر سوبريم", categoryId: "pizza", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 85 }, { size: "M", label: "وسط M", price: 130 }, { size: "L", label: "كبير L", price: 170 }] },
  { id: "pz-11", name: "بيتزا شاورما لحم", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-12", name: "بيتزا مكس لحوم", categoryId: "pizza", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-13", name: "بيتزا شاورما فراخ", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-14", name: "بيتزا مكس فراخ", categoryId: "pizza", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-15", name: "بيتزا زنجر رانش", categoryId: "pizza", isPopular: true, isSpicy: true, sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-16", name: "بيتزا تشكن باربيكيو", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-17", name: "بيتزا فاهيتا فراخ", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 90 }, { size: "M", label: "وسط M", price: 135 }, { size: "L", label: "كبير L", price: 180 }] },
  { id: "pz-18", name: "بيتزا ميكس جبن", categoryId: "pizza", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 90 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-19", name: "بيتزا سوبر كرانشي", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 90 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-20", name: "بيتزا شيش طاووق", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 90 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-21", name: "بيتزا زنجر حار", categoryId: "pizza", isSpicy: true, sizes: [{ size: "S", label: "صغير S", price: 90 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-22", name: "بيتزا تشيكن رانش", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },
  { id: "pz-23", name: "بيتزا فاهيتا لحم", categoryId: "pizza", sizes: [{ size: "S", label: "صغير S", price: 100 }, { size: "M", label: "وسط M", price: 150 }, { size: "L", label: "كبير L", price: 200 }] },

  // 2. السوري
  { id: "sy-1", name: "سوري بطاطس", categoryId: "syrian", price: 25 },
  { id: "sy-2", name: "سوري بطاطس موتزاريلا", categoryId: "syrian", price: 35, isPopular: true },
  { id: "sy-3", name: "سوري بطاطس جبنة رومي", categoryId: "syrian", price: 35 },
  { id: "sy-4", name: "سوري كرسبي", categoryId: "syrian", price: 40, isPopular: true },
  { id: "sy-5", name: "سوري شاورما فراخ", categoryId: "syrian", price: 70, isPopular: true },
  { id: "sy-6", name: "سوري زنجر", categoryId: "syrian", price: 70, isSpicy: true, isPopular: true },
  { id: "sy-7", name: "سوري كفتة", categoryId: "syrian", price: 70 },
  { id: "sy-8", name: "سوري كبدة", categoryId: "syrian", price: 40 },
  { id: "sy-9", name: "سوري سجق", categoryId: "syrian", price: 40 },

  // 3. الكريب الحلو
  { id: "cs-1", name: "كريب شوكولاتة سادة", categoryId: "crepe-sweet", price: 60 },
  { id: "cs-2", name: "كريب شوكولاتة موز", categoryId: "crepe-sweet", price: 70, isPopular: true },
  { id: "cs-3", name: "كريب شوكولاتة أوريو", categoryId: "crepe-sweet", price: 70, isPopular: true },
  { id: "cs-4", name: "كريب شوكولاتة هوهوز", categoryId: "crepe-sweet", price: 70 },
  { id: "cs-5", name: "كريب شوكولاتة ميكس حلو", categoryId: "crepe-sweet", price: 80, isPopular: true },

  // 4. الكريب الحادق
  { id: "cv-1", name: "كريب بطاطس", categoryId: "crepe-savory", sizes: [{ size: "M", label: "وسط M", price: 30 }, { size: "L", label: "كبير L", price: 65 }] },
  { id: "cv-2", name: "كريب كرسبي", categoryId: "crepe-savory", isPopular: true, sizes: [{ size: "M", label: "وسط M", price: 40 }, { size: "L", label: "كبير L", price: 90 }] },
  { id: "cv-3", name: "كريب سجق", categoryId: "crepe-savory", sizes: [{ size: "M", label: "وسط M", price: 50 }, { size: "L", label: "كبير L", price: 100 }] },
  { id: "cv-4", name: "كريب سوسيس", categoryId: "crepe-savory", sizes: [{ size: "M", label: "وسط M", price: 50 }, { size: "L", label: "كبير L", price: 100 }] },
  { id: "cv-5", name: "كريب برجر", categoryId: "crepe-savory", sizes: [{ size: "M", label: "وسط M", price: 60 }, { size: "L", label: "كبير L", price: 120 }] },
  { id: "cv-6", name: "كريب تشكن باربيكيو", categoryId: "crepe-savory", sizes: [{ size: "M", label: "وسط M", price: 70 }, { size: "L", label: "كبير L", price: 120 }] },
  { id: "cv-7", name: "كريب زنجر", categoryId: "crepe-savory", isSpicy: true, isPopular: true, sizes: [{ size: "M", label: "وسط M", price: 60 }, { size: "L", label: "كبير L", price: 120 }] },
  { id: "cv-8", name: "كريب شاورما فراخ", categoryId: "crepe-savory", sizes: [{ size: "M", label: "وسط M", price: 70 }, { size: "L", label: "كبير L", price: 120 }] },
  { id: "cv-9", name: "كريب شيش طاووق", categoryId: "crepe-savory", sizes: [{ size: "M", label: "وسط M", price: 70 }, { size: "L", label: "كبير L", price: 120 }] },
  { id: "cv-10", name: "كريب تشكن رانش", categoryId: "crepe-savory", isPopular: true, sizes: [{ size: "M", label: "وسط M", price: 70 }, { size: "L", label: "كبير L", price: 130 }] },
  { id: "cv-11", name: "كريب مكس فراخ", categoryId: "crepe-savory", isPopular: true, sizes: [{ size: "M", label: "وسط M", price: 75 }, { size: "L", label: "كبير L", price: 130 }] },
  { id: "cv-12", name: "كريب مكس لحوم", categoryId: "crepe-savory", isPopular: true, sizes: [{ size: "M", label: "وسط M", price: 75 }, { size: "L", label: "كبير L", price: 130 }] },

  // 5. الوجبات
  { id: "ml-1", name: "تشكن ريزو", categoryId: "meals", price: 50, isPopular: true },
  { id: "ml-2", name: "وجبة كرسبي ناجتس", categoryId: "meals", price: 70 },
  { id: "ml-3", name: "وجبة سجق مشوي", categoryId: "meals", price: 70 },
  { id: "ml-4", name: "وجبة كفتة مشوية", categoryId: "meals", price: 100, isPopular: true },
  { id: "ml-5", name: "وجبة شيش طاووق", categoryId: "meals", price: 100 },
  { id: "ml-6", name: "وجبة استربس", categoryId: "meals", price: 100, isPopular: true },
  { id: "ml-7", name: "وجبة شاورما فراخ", categoryId: "meals", price: 100 },
  { id: "ml-8", name: "وجبة مستر زنجر", categoryId: "meals", price: 120, isSpicy: true, isPopular: true },
  { id: "ml-9", name: "وجبة بلانت ستارز", categoryId: "meals", price: 120 },
  { id: "ml-10", name: "وجبة شاورما لحم", categoryId: "meals", price: 130 },

  // 6. البيف
  { id: "bf-1", name: "كلاسيك بيف", categoryId: "beef", price: 120, isPopular: true },
  { id: "bf-2", name: "سلامي بيف", categoryId: "beef", price: 120 },
  { id: "bf-3", name: "بيف بسطرمة", categoryId: "beef", price: 120, isPopular: true },
  { id: "bf-4", name: "بيف روز بيف", categoryId: "beef", price: 120 },

  // 7. الكالزوني
  { id: "cz-1", name: "زنجر رانش", categoryId: "calzone", price: 120, isSpicy: true, isPopular: true },
  { id: "cz-2", name: "تشكن باربيكيو", categoryId: "calzone", price: 120 },
  { id: "cz-3", name: "سوبر كرانشي", categoryId: "calzone", price: 120 },
  { id: "cz-4", name: "عكس جبن", categoryId: "calzone", price: 120, isPopular: true },
  { id: "cz-5", name: "عكس فراخ", categoryId: "calzone", price: 130, isPopular: true },
  { id: "cz-6", name: "مستر زنجر", categoryId: "calzone", price: 130, isSpicy: true, isPopular: true },
  { id: "cz-7", name: "مكس لحوم", categoryId: "calzone", price: 130 },

  // 8. الوايت صوص
  { id: "ws-1", name: "مكرونة بالبشاميل", categoryId: "white-sauce", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 40 }, { size: "M", label: "وسط M", price: 70 }, { size: "L", label: "كبير L", price: 110 }] },
  { id: "ws-2", name: "نجرسكو فراخ", categoryId: "white-sauce", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 50 }, { size: "M", label: "وسط M", price: 80 }, { size: "L", label: "كبير L", price: 120 }] },
  { id: "ws-3", name: "نجرسكو زنجر", categoryId: "white-sauce", isSpicy: true, isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 50 }, { size: "M", label: "وسط M", price: 80 }, { size: "L", label: "كبير L", price: 120 }] },
  { id: "ws-4", name: "نجرسكو زنجر بسطرمة", categoryId: "white-sauce", sizes: [{ size: "S", label: "صغير S", price: 60 }, { size: "M", label: "وسط M", price: 110 }, { size: "L", label: "كبير L", price: 130 }] },
  { id: "ws-5", name: "نجرسكو مستر زنجر", categoryId: "white-sauce", isPopular: true, sizes: [{ size: "S", label: "صغير S", price: 60 }, { size: "M", label: "وسط M", price: 110 }, { size: "L", label: "كبير L", price: 130 }] },

  // 9. الفرايد تشكن
  { id: "fc-1", name: "تشكن كلاسيك", categoryId: "fried-chicken", price: 100 },
  { id: "fc-2", name: "تشكن تكساس", categoryId: "fried-chicken", price: 100, isPopular: true },
  { id: "fc-3", name: "تشكن رانش", categoryId: "fried-chicken", price: 100, isPopular: true },
  { id: "fc-4", name: "تشكن سوبر كرانشي", categoryId: "fried-chicken", price: 100, isPopular: true },

  // 10. المناقيش
  { id: "mq-1", name: "منقوشة موتزاريلا", categoryId: "manaqeesh", price: 20 },
  { id: "mq-2", name: "منقوشة سجق", categoryId: "manaqeesh", price: 20, isPopular: true },
  { id: "mq-3", name: "منقوشة كيري بسطرمة", categoryId: "manaqeesh", price: 25, isPopular: true },
  { id: "mq-4", name: "منقوشة سلامي", categoryId: "manaqeesh", price: 20 },
  { id: "mq-5", name: "منقوشة سوسيس", categoryId: "manaqeesh", price: 20 },
  { id: "mq-6", name: "منقوشة فراخ", categoryId: "manaqeesh", price: 25, isPopular: true },

  // 11. السندوتشات
  { id: "sw-1", name: "كبدة إسكندراني", categoryId: "sandwiches", price: 20 },
  { id: "sw-2", name: "سجق إسكندراني", categoryId: "sandwiches", price: 20 },
  { id: "sw-3", name: "سوسيس", categoryId: "sandwiches", price: 20 },
  { id: "sw-4", name: "بطاطس", categoryId: "sandwiches", price: 20 },
  { id: "sw-5", name: "كفتة", categoryId: "sandwiches", price: 20 },
  { id: "sw-6", name: "كرسبي ناجتس", categoryId: "sandwiches", price: 20 },
  { id: "sw-7", name: "زنجر رانش", categoryId: "sandwiches", price: 50, isSpicy: true, isPopular: true },
  { id: "sw-8", name: "شيش طاووق", categoryId: "sandwiches", price: 50 },
  { id: "sw-9", name: "شاورما فراخ", categoryId: "sandwiches", price: 50, isPopular: true },
  { id: "sw-10", name: "تشكن موتزاريلا", categoryId: "sandwiches", price: 80, isPopular: true },

  // 12. الحواوشي
  { id: "hw-1", name: "حواوشي إسكندراني", categoryId: "hawawshi", sizes: [{ size: "M", label: "وسط M", price: 30 }, { size: "L", label: "كبير L", price: 60 }] },
  { id: "hw-2", name: "حواوشي وش بيتزا", categoryId: "hawawshi", isPopular: true, sizes: [{ size: "M", label: "وسط M", price: 40 }, { size: "L", label: "كبير L", price: 80 }] },
  { id: "hw-3", name: "حواوشي بسطرمة", categoryId: "hawawshi", sizes: [{ size: "M", label: "وسط M", price: 40 }, { size: "L", label: "كبير L", price: 90 }] },
  { id: "hw-4", name: "حواوشي مستر زنجر", categoryId: "hawawshi", isPopular: true, sizes: [{ size: "M", label: "وسط M", price: 50 }, { size: "L", label: "كبير L", price: 100 }] },
  { id: "hw-5", name: "حواوشي بلدي", categoryId: "hawawshi", price: 50 },
  { id: "hw-6", name: "حواوشي بلدي موتزاريلا", categoryId: "hawawshi", price: 70, isPopular: true },
  { id: "hw-7", name: "حواوشي بلدي جبنة رومي", categoryId: "hawawshi", price: 70 },
  { id: "hw-8", name: "حواوشي بلدي بسطرمة", categoryId: "hawawshi", price: 100, isPopular: true },

  // 13. كرانشي تشيز
  { id: "cc-1", name: "زنجر كرانشي تشيز", categoryId: "crunchy-cheese", price: 70, isSpicy: true, isPopular: true },
  { id: "cc-2", name: "كرانشي تشيز تكساس", categoryId: "crunchy-cheese", price: 70 },
  { id: "cc-3", name: "كرانشي تشيز شيدر", categoryId: "crunchy-cheese", price: 70, isPopular: true },
  { id: "cc-4", name: "كرانشي تشيز سويت شيلي", categoryId: "crunchy-cheese", price: 70 },
  { id: "cc-5", name: "كرانشي تشيز هالينو", categoryId: "crunchy-cheese", price: 70, isSpicy: true },
  { id: "cc-6", name: "كرانشي تشيز نيويورك", categoryId: "crunchy-cheese", price: 70, isPopular: true },
];
