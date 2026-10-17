import { CartItem, OrderDetails } from '../types/order';
import { RESTAURANT_CONFIG } from '../data/restaurantConfig';

/**
 * Ensures phone number is in international WhatsApp format:
 * Example: '01050738483' -> '201050738483'
 */
export function formatToInternationalWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  
  if (cleaned.startsWith("0020")) {
    cleaned = cleaned.substring(2); // remove leading 00
  } else if (cleaned.startsWith("002")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("20") && cleaned.length >= 12) {
    // already 201...
    return cleaned;
  } else if (cleaned.startsWith("01") && cleaned.length === 11) {
    // Egyptian local format (010, 011, 012, 015) -> prepend 2
    cleaned = "2" + cleaned;
  } else if (cleaned.startsWith("1") && cleaned.length === 10) {
    cleaned = "20" + cleaned;
  }
  
  return cleaned;
}

/**
 * Builds clean, universally compatible WhatsApp message without complex emojis
 * that cause question marks or square glyphs on mobile/web.
 */
export function buildWhatsAppMessage(
  cartItems: CartItem[],
  orderDetails: OrderDetails,
  totalAmount: number,
  finalAmount: number = totalAmount,
  discountAmount = 0,
  couponCode?: string,
  paymentMethodLabel?: string
): string {
  const selectedBranch = RESTAURANT_CONFIG.branches.find(
    (branch) => branch.id === orderDetails.branchId
  ) || RESTAURANT_CONFIG.branches[0];
  const lines = [
    "\u0637\u0644\u0628 \u062c\u062f\u064a\u062f \u0645\u0646 \u0645\u0648\u0642\u0639 \u0645\u0633\u062a\u0631 \u0632\u0646\u062c\u0631",
    "\u064a\u0631\u062c\u0649 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628 \u0648\u0628\u062f\u0621 \u062a\u062c\u0647\u064a\u0632\u0647.",
    "",
    "\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0639\u0645\u064a\u0644",
    `\u0627\u0644\u0627\u0633\u0645: ${orderDetails.customerName.trim()}`,
    `\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641: ${orderDetails.customerPhone.trim()}`,
  ];
  if (orderDetails.customerPhone2?.trim()) lines.push(`\u0631\u0642\u0645 \u0628\u062f\u064a\u0644: ${orderDetails.customerPhone2.trim()}`);
  lines.push("", "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0637\u0644\u0628");
  cartItems.forEach((item, index) => {
    const size = item.sizeLabel ? ` (${item.sizeLabel})` : "";
    lines.push(`${index + 1}. ${item.name}${size} - ${item.quantity} x ${item.unitPrice} = ${item.quantity * item.unitPrice} \u062c\u0646\u064a\u0647`);
  });
  lines.push("", `\u0627\u0644\u0645\u062c\u0645\u0648\u0639 \u0642\u0628\u0644 \u0627\u0644\u062e\u0635\u0645: ${totalAmount} \u062c\u0646\u064a\u0647`);
  if (couponCode && discountAmount > 0) lines.push(`\u0643\u0648\u0628\u0648\u0646 \u0627\u0644\u062e\u0635\u0645: ${couponCode}`, `\u0642\u064a\u0645\u0629 \u0627\u0644\u062e\u0635\u0645: ${discountAmount} \u062c\u0646\u064a\u0647`);
  const deliveryFee = Math.max(0, finalAmount - (totalAmount - discountAmount));
  if (deliveryFee > 0) lines.push(`\u0631\u0633\u0648\u0645 \u0627\u0644\u062a\u0648\u0635\u064a\u0644: ${deliveryFee} \u062c\u0646\u064a\u0647`);
  lines.push(
    `\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0646\u0647\u0627\u0626\u064a: ${finalAmount} \u062c\u0646\u064a\u0647`,
    `\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645: ${orderDetails.deliveryMethod === "delivery" ? "\u062a\u0648\u0635\u064a\u0644 \u0644\u0644\u0639\u0646\u0648\u0627\u0646" : "\u0627\u0633\u062a\u0644\u0627\u0645 \u0645\u0646 \u0627\u0644\u0641\u0631\u0639"}`,
    `\u0627\u0644\u0641\u0631\u0639: ${selectedBranch.name}`,
  );
  lines.push(`\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639: ${paymentMethodLabel || "\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645"}`);
  if (orderDetails.deliveryMethod === "delivery") {
    if (orderDetails.manualAddress.trim()) lines.push(`\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${orderDetails.manualAddress.trim()}`);
    if (orderDetails.location?.mapsUrl) lines.push(`\u0645\u0648\u0642\u0639 \u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${orderDetails.location.mapsUrl}`);
    if (orderDetails.addressDetails.trim()) lines.push(`\u062a\u0641\u0627\u0635\u064a\u0644 \u0625\u0636\u0627\u0641\u064a\u0629: ${orderDetails.addressDetails.trim()}`);
  } else {
    lines.push(`\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639: ${selectedBranch.address}`);
  }
  if (orderDetails.notes.trim()) lines.push(`\u0645\u0644\u0627\u062d\u0638\u0627\u062a: ${orderDetails.notes.trim()}`);
  lines.push("", "\u0634\u0643\u0631\u064b\u0627.");
  return lines.join("\n");
}
/**
 * Generates direct WhatsApp chat URL
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = formatToInternationalWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  // wa.me is the official, universal WhatsApp link that works on both mobile apps and WhatsApp Web
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function openWhatsAppChat(phone: string, message: string): void {
  const url = getWhatsAppUrl(phone, message);
  
  // Try opening in new window/tab
  const win = window.open(url, "_blank", "noopener,noreferrer");
  
  // If browser blocked popup, redirect location
  if (!win || win.closed || typeof win.closed === "undefined") {
    window.location.href = url;
  }
}
