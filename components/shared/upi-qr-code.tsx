"use client";
import { useEffect, useState } from "react";
import { buildUpiPaymentUri } from "@/lib/upi";

/** Renders a scan-to-pay UPI QR code for a bill total, generated client-side (no external QR API call needed). */
export function UpiQrCode({
  vpa,
  payeeName,
  amount,
  note,
}: {
  vpa: string;
  payeeName: string;
  amount: number;
  note?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const QRCode = (await import("qrcode")).default;
      const uri = buildUpiPaymentUri({ vpa, payeeName, amount, note });
      try {
        const url = await QRCode.toDataURL(uri, { width: 176, margin: 1 });
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setDataUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vpa, payeeName, amount, note]);

  if (!dataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="UPI payment QR code" width={110} height={110} />
      <p className="text-[10px] text-muted-foreground">Scan to pay via UPI</p>
    </div>
  );
}
