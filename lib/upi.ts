/**
 * Builds a UPI deep-link payment URI (the same format that generating a
 * "Scan & Pay" QR code encodes). Any UPI app (GPay, PhonePe, Paytm…) can
 * read this string once it's rendered as a QR code.
 * Spec: upi://pay?pa=<VPA>&pn=<payee name>&am=<amount>&cu=INR&tn=<note>
 */
export function buildUpiPaymentUri(params: {
  vpa: string;
  payeeName: string;
  amount: number;
  note?: string;
}): string {
  const { vpa, payeeName, amount, note } = params;
  const search = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    ...(note ? { tn: note } : {}),
  });
  return `upi://pay?${search.toString()}`;
}
