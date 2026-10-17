export interface BranchInfo {
  id: string;
  name: string;
  address: string;
  landmark: string;
  phone: string;
  whatsappNumber: string;
  mapQuery: string;
}

export const RESTAURANT_CONFIG = {
  brandName: "MR. ZINGER",
  brandSubtitle: "CREPE • PIZZA • ZINGER",
  establishedYear: 2019,
  
  // Primary WhatsApp number for orders (international format without +)
  // 01050738483 -> 201050738483
  primaryWhatsAppNumber: "201050738483",
  secondaryWhatsAppNumber: "201104636405",
  
  phoneNumbers: ["01050738483", "01104636405"],
  complaintsPhone: "01155588213",
  chefName: "الشيف مصطفى",
  
  branches: [
    {
      id: "branch-rashah",
      name: "فرع شارع الرشاح",
      address: "شارع الرشاح، خلف معرض سيراميكا كليوباترا",
      landmark: "خلف معرض سيراميكا كليوباترا",
      phone: "01050738483",
      whatsappNumber: "201050738483",
      mapQuery: "شارع الرشاح، خلف معرض سيراميكا كليوباترا",
    },
    {
      id: "branch-corniche",
      name: "فرع كورنيش حلوان",
      address: "كورنيش حلوان، منشية جمال عبد الناصر، بجوار عصارة الحسيني",
      landmark: "بجوار عصارة الحسيني",
      phone: "01104636405",
      whatsappNumber: "201104636405",
      mapQuery: "منشية جمال عبد الناصر، كورنيش حلوان",
    },
  ] as BranchInfo[],

  openingHours: "يوميًا من 12:00 ظهرًا حتى 3:00 فجرًا",
};
