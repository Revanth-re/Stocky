/**
 * Builds a "click-to-WhatsApp" (wa.me) deep link with a pre-filled message.
 * No WhatsApp Business API / credentials needed — this just opens the
 * owner's own WhatsApp with the message ready to review and send. Works on
 * both mobile (opens the app) and desktop (opens WhatsApp Web).
 */
function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`; // bare 10-digit local number -> assume India
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizeIndianPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** The specific "you have dues" reminder used by the udhaar/khata customer ledger. */
export function buildDuesReminderLink(params: {
  phone: string;
  customerName: string;
  storeName: string;
  balance: number;
}): string {
  const { phone, customerName, storeName, balance } = params;
  const amount = balance.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const message = `Hi ${customerName}, this is a reminder from ${storeName} — your current outstanding balance is ₹${amount}. Please pay at your earliest convenience. Thank you!`;
  return buildWhatsAppLink(phone, message);
}
