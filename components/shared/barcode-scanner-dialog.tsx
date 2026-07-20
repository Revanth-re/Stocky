"use client";
import { useEffect, useRef, useState } from "react";
import { ScanLine, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SCANNER_ELEMENT_ID = "barcode-scanner-viewport";

/**
 * Camera-based barcode/QR scanner dialog, built on `html5-qrcode` (works via
 * getUserMedia in any modern mobile or desktop browser — no native app or
 * dedicated hardware scanner required).
 *
 * - `continuous = false` (default): closes itself after the first successful
 *   scan — used for "scan to fill this field" (e.g. product barcode entry).
 * - `continuous = true`: keeps the camera open after a scan so the caller can
 *   scan several items in a row — used for the billing "scan to add" flow.
 *   The same code won't fire `onScan` again until a *different* code is seen.
 */
export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onScan,
  continuous = false,
  title = "Scan barcode",
  description = "Point the camera at the product's barcode.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => void;
  continuous?: boolean;
  title?: string;
  description?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const lastScanAtRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText) => {
            const now = Date.now();
            // Debounce: ignore the same code re-firing within 2s (html5-qrcode
            // calls back on every frame it still sees the code in).
            if (decodedText === lastCodeRef.current && now - lastScanAtRef.current < 2000) return;
            lastCodeRef.current = decodedText;
            lastScanAtRef.current = now;

            onScan(decodedText);
            if (!continuous) onOpenChange(false);
          },
          undefined,
        );
      } catch {
        if (!cancelled) setError("Could not access the camera. Check permissions and try again.");
      }
    })();

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {
            /* already stopped */
          });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="size-5 text-primary" /> {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-border bg-black">
          <div id={SCANNER_ELEMENT_ID} className="aspect-video w-full" />
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <X className="size-4" /> {error}
          </p>
        )}

        {continuous && (
          <p className="text-center text-xs text-muted-foreground">
            Scanning continues — each new barcode is added automatically. Close this dialog when done.
          </p>
        )}

        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Close scanner
        </Button>
      </DialogContent>
    </Dialog>
  );
}
