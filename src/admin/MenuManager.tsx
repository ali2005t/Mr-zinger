import React, { useMemo, useState } from "react";
import { MenuCategory, MenuItem, MenuItemSize, MenuItemSizeOption } from "../data/menuData";
import { RestaurantMenu } from "../firebase/data";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { saveImageAsText } from "../firebase/data";
import { useDatabaseImage } from "../hooks/useDatabaseImage";

interface MenuManagerProps {
  menu: RestaurantMenu;
  saving: boolean;
  saveMenu: (menu: RestaurantMenu) => Promise<void>;
}

const SIZE_OPTIONS: { size: MenuItemSize; label: string }[] = [
  { size: "S", label: "صغير S" },
  { size: "M", label: "وسط M" },
  { size: "L", label: "كبير L" },
];

const fieldClass = "w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10";
const labelClass = "mb-1.5 block text-xs font-bold text-stone-600";

export const MenuManager: React.FC<MenuManagerProps> = ({ menu, saving, saveMenu }) => {
  const [section, setSection] = useState<"items" | "categories">("items");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const visibleItems = useMemo(() => menu.items.filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.categoryId === categoryFilter;
    const query = searchQuery.trim().toLowerCase();
    return matchesCategory && (!query || item.name.toLowerCase().includes(query));
  }), [menu.items, categoryFilter, searchQuery]);

  const commit = async (nextMenu: RestaurantMenu) => {
    setError("");
    try {
      await saveMenu(nextMenu);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر حفظ التعديل.");
    }
  };

  const saveItem = (item: MenuItem) => {
    const exists = menu.items.some((current) => current.id === item.id);
    const items = exists
      ? menu.items.map((current) => current.id === item.id ? item : current)
      : [item, ...menu.items];
    void commit({ ...menu, items });
    setShowItemForm(false);
    setEditingItem(null);
  };

  const deleteItem = (item: MenuItem) => {
    if (!window.confirm(`حذف «${item.name}» من المنيو؟`)) return;
    void commit({ ...menu, items: menu.items.filter((current) => current.id !== item.id) });
  };

  const saveCategory = (category: MenuCategory) => {
    const exists = menu.categories.some((current) => current.id === category.id);
    if (!editingCategory && exists) {
      setError("معرّف القسم مستخدم بالفعل.");
      return;
    }
    const categories = exists
      ? menu.categories.map((current) => current.id === category.id ? category : current)
      : [...menu.categories, category];
    void commit({ ...menu, categories });
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const deleteCategory = (category: MenuCategory) => {
    if (menu.items.some((item) => item.categoryId === category.id)) {
      setError("انقل أصناف هذا القسم أو احذفها أولًا، ثم احذف القسم.");
      return;
    }
    if (!window.confirm(`حذف قسم «${category.title}»؟`)) return;
    void commit({ ...menu, categories: menu.categories.filter((current) => current.id !== category.id) });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div>
          <h2 className="text-xl font-black text-stone-900">إدارة المنيو</h2>
          <p className="mt-1 text-sm text-stone-500">عدّل الأصناف والأسعار والأقسام، وتظهر التغييرات على الموقع بعد الحفظ.</p>
        </div>
        <div className="flex w-full rounded-xl bg-stone-100 p-1 text-xs sm:w-auto sm:text-sm">
          <button onClick={() => setSection("items")} className={`flex-1 rounded-lg px-3 py-2 font-bold text-center sm:flex-none sm:px-4 ${section === "items" ? "bg-white text-emerald-900 shadow-sm" : "text-stone-500"}`}>الأصناف ({menu.items.length})</button>
          <button onClick={() => setSection("categories")} className={`rounded-lg px-4 py-2 font-bold ${section === "categories" ? "bg-white text-emerald-900 shadow-sm" : "text-stone-500"}`}>الأقسام ({menu.categories.length})</button>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {saving && <div className="text-xs font-semibold text-emerald-800">جارٍ حفظ التغييرات…</div>}

      {section === "items" ? (
        <>
          <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:gap-3">
            <label className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input className={`${fieldClass} pr-9`} placeholder="ابحث عن صنف" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </label>
            <select className={`${fieldClass} min-w-0 sm:max-w-56`} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">كل الأقسام</option>
              {menu.categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
            </select>
            <button onClick={() => { setEditingItem(null); setShowItemForm(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900">
              <Plus className="h-4 w-4" /> إضافة صنف
            </button>
          </div>

          {showItemForm && <ItemForm item={editingItem} categories={menu.categories} onCancel={() => setShowItemForm(false)} onSave={saveItem} />}

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => {
              const category = menu.categories.find((current) => current.id === item.categoryId);
              const price = item.sizes?.length
                ? item.sizes.map((size) => `${size.label}: ${size.price} ج`).join(" · ")
                : `${item.price ?? 0} جنيه`;
              return (
                <article key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    <MenuImage source={item.imageUrl} alt={item.name} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-stone-900">{item.name}</h3>
                      <p className="mt-0.5 text-xs text-stone-500">{category?.title ?? "قسم غير محدد"}</p>
                      <p className="mt-2 text-xs font-bold leading-5 text-emerald-900">{price}</p>
                    </div>
                  </div>
                  {item.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-stone-500">{item.description}</p>}
                  <div className="mt-4 flex justify-end gap-2 border-t border-stone-100 pt-3">
                    <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700"><Pencil className="h-3.5 w-3.5" /> تعديل</button>
                    <button onClick={() => deleteItem(item)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><Trash2 className="h-3.5 w-3.5" /> حذف</button>
                  </div>
                </article>
              );
            })}
          </div>
          {!visibleItems.length && <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">لا توجد أصناف مطابقة.</p>}
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900"><Plus className="h-4 w-4" /> إضافة قسم</button>
          </div>
          {showCategoryForm && <CategoryForm category={editingCategory} onCancel={() => setShowCategoryForm(false)} onSave={saveCategory} />}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {menu.categories.map((category) => (
              <article key={category.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-2xl">{category.icon || "🍽️"}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-stone-900">{category.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-stone-500">{category.subtitle}</p>
                </div>
                <div className="flex gap-1">
                  <button aria-label="تعديل القسم" onClick={() => { setEditingCategory(category); setShowCategoryForm(true); }} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"><Pencil className="h-4 w-4" /></button>
                  <button aria-label="حذف القسم" onClick={() => deleteCategory(category)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

function MenuImage({ source, alt }: { source?: string; alt: string }) {
  const resolved = useDatabaseImage(source);
  return <img src={resolved || "/mr-zinger-logo.jpg"} alt={alt} className="h-14 w-14 rounded-xl bg-stone-100 object-cover" />;
}

function ItemForm({ item, categories, onCancel, onSave }: {
  item: MenuItem | null;
  categories: MenuCategory[];
  onCancel: () => void;
  onSave: (item: MenuItem) => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPopular, setIsPopular] = useState(Boolean(item?.isPopular));
  const [isSpicy, setIsSpicy] = useState(Boolean(item?.isSpicy));
  const [useSizes, setUseSizes] = useState(Boolean(item?.sizes?.length));
  const [sizes, setSizes] = useState<MenuItemSizeOption[]>(SIZE_OPTIONS.map((option) => {
    const existing = item?.sizes?.find((size) => size.size === option.size);
    return { ...option, price: existing?.price ?? 0, label: existing?.label ?? option.label };
  }));
  const [error, setError] = useState("");
  const imagePreview = useDatabaseImage(imageUrl);

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    setError(""); setUploadingImage(true);
    try { setImageUrl(await saveImageAsText(file)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر رفع الصورة."); }
    finally { setUploadingImage(false); }
  };

  const updateSizePrice = (size: MenuItemSize, value: string) => {
    setSizes((current) => current.map((option) => option.size === size ? { ...option, price: Number(value) || 0 } : option));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price);
    const activeSizes = sizes.filter((option) => option.price > 0);
    if (!name.trim() || !categoryId) return setError("أدخل اسم الصنف واختر القسم.");
    if (useSizes && !activeSizes.length) return setError("أدخل سعر حجم واحد على الأقل.");
    if (!useSizes && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) return setError("أدخل سعرًا صحيحًا.");

    const nextItem: MenuItem = {
      id: item?.id ?? `${categoryId}-${Date.now()}`,
      name: name.trim(),
      categoryId,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isPopular,
      isSpicy,
      ...(useSizes ? { sizes: activeSizes } : { price: parsedPrice }),
    };
    onSave(nextItem);
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-black text-stone-900">{item ? "تعديل الصنف" : "إضافة صنف جديد"}</h3><button type="button" onClick={onCancel} className="rounded-lg p-2 text-stone-500 hover:bg-white"><X className="h-4 w-4" /></button></div>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <label><span className={labelClass}>اسم الصنف *</span><input required className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label><span className={labelClass}>القسم *</span><select required className={fieldClass} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label>
        <label className="sm:col-span-2"><span className={labelClass}>الوصف</span><textarea rows={2} className={fieldClass} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <div className="sm:col-span-2 rounded-xl border border-stone-200 bg-white p-3"><label className={labelClass}>صورة الصنف — ارفع صورة من جهازك</label><div className="flex flex-wrap items-center gap-3"><input type="file" accept="image/*" disabled={uploadingImage} onChange={(event) => void handleImageUpload(event.target.files?.[0])} className="min-w-0 flex-1 text-sm" />{imagePreview && <img src={imagePreview} alt="معاينة الصورة" className="h-16 w-16 rounded-lg object-cover" />}{uploadingImage && <span className="text-xs text-emerald-800">جارٍ ضغط الصورة وحفظها...</span>}</div><p className="mt-2 text-[11px] leading-5 text-stone-500">تُضغط الصورة ثم تُحفظ كنص داخل مستند مستقل في قاعدة بيانات Firestore، وليس في Firebase Storage.</p></div>
        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm"><input type="checkbox" checked={isPopular} onChange={(event) => setIsPopular(event.target.checked)} /> الأكثر طلبًا</label>
        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm"><input type="checkbox" checked={isSpicy} onChange={(event) => setIsSpicy(event.target.checked)} /> حار</label>
        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm sm:col-span-2"><input type="checkbox" checked={useSizes} onChange={(event) => setUseSizes(event.target.checked)} /> للصنف أحجام وأسعار مختلفة</label>
        {useSizes ? sizes.map((option) => (
          <label key={option.size}><span className={labelClass}>{option.label} — السعر بالجنيه</span><input type="number" min="0" step="1" className={fieldClass} value={option.price || ""} onChange={(event) => updateSizePrice(option.size, event.target.value)} /></label>
        )) : <label><span className={labelClass}>السعر بالجنيه *</span><input required type="number" min="0" step="1" className={fieldClass} value={price} onChange={(event) => setPrice(event.target.value)} /></label>}
      </div>
      {error && <p className="mt-3 text-xs font-bold text-red-700">{error}</p>}
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-bold text-stone-600">إلغاء</button><button disabled={uploadingImage} className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" /> حفظ الصنف</button></div>
    </form>
  );
}

function CategoryForm({ category, onCancel, onSave }: {
  category: MenuCategory | null;
  onCancel: () => void;
  onSave: (category: MenuCategory) => void;
}) {
  const [id, setId] = useState(category?.id ?? "");
  const [title, setTitle] = useState(category?.title ?? "");
  const [subtitle, setSubtitle] = useState(category?.subtitle ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "🍽️");
  const [sizesEnabled, setSizesEnabled] = useState(Boolean(category?.hasSizes));
  const [formError, setFormError] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<MenuItemSize[]>(
    category?.availableSizes?.map((option) => option.size) ?? SIZE_OPTIONS.map((option) => option.size)
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!id.trim() || !title.trim()) return;
    if (sizesEnabled && !selectedSizes.length) {
      setFormError("اختر حجمًا واحدًا على الأقل أو أوقف خيار الأحجام.");
      return;
    }
    onSave({
      id: id.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      icon: icon.trim() || "🍽️",
      hasSizes: sizesEnabled,
      ...(sizesEnabled ? { availableSizes: SIZE_OPTIONS.filter((option) => selectedSizes.includes(option.size)) } : {}),
    });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-black text-stone-900">{category ? "تعديل القسم" : "إضافة قسم جديد"}</h3><button type="button" onClick={onCancel} className="rounded-lg p-2 text-stone-500 hover:bg-white"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className={labelClass}>معرّف القسم *</span><input required disabled={Boolean(category)} className={fieldClass} placeholder="مثال: drinks" value={id} onChange={(event) => setId(event.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())} /></label>
        <label><span className={labelClass}>اسم القسم *</span><input required className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label><span className={labelClass}>الأيقونة</span><input className={fieldClass} value={icon} onChange={(event) => setIcon(event.target.value)} /></label>
        <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm"><input type="checkbox" checked={sizesEnabled} onChange={(event) => setSizesEnabled(event.target.checked)} /> يدعم الأحجام</label>
        {sizesEnabled && <fieldset className="flex flex-wrap gap-3 rounded-xl bg-white px-3 py-2.5 text-sm sm:col-span-2"><legend className="text-xs font-bold text-stone-600">الأحجام المتاحة</legend>{SIZE_OPTIONS.map((option) => <label key={option.size} className="flex items-center gap-1.5"><input type="checkbox" checked={selectedSizes.includes(option.size)} onChange={(event) => setSelectedSizes((current) => event.target.checked ? [...current, option.size] : current.filter((size) => size !== option.size))} />{option.label}</label>)}</fieldset>}
        <label className="sm:col-span-2"><span className={labelClass}>وصف القسم</span><textarea rows={2} className={fieldClass} value={subtitle} onChange={(event) => setSubtitle(event.target.value)} /></label>
      </div>
      {formError && <p className="mt-3 text-xs font-bold text-red-700">{formError}</p>}
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-bold text-stone-600">إلغاء</button><button className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white"><Check className="h-4 w-4" /> حفظ القسم</button></div>
    </form>
  );
}
