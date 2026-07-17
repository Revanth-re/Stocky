"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Barcode, FileScan, FileSpreadsheet, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GlobalCatalogProduct } from "@/lib/catalog/global-catalog";
import type { ApiResponse } from "@/types/auth";
import type { ProductInput } from "@/validators/product";

/** Import methods planned but not yet wired to a backend — buttons are disabled placeholders. */
const FUTURE_IMPORT_METHODS = [
  { icon: Barcode, label: "Scan barcode" },
  { icon: FileScan, label: "OCR invoice" },
  { icon: FileSpreadsheet, label: "Import Excel" },
];

export function ProductLibraryPicker({
  onPick,
  submitting,
}: {
  onPick: (prefill: ProductInput) => void;
  submitting: boolean;
}) {
  const [search, setSearch] = useState("");
  const { data: catalog, isLoading } = useQuery({
    queryKey: ["global-catalog-all"],
    queryFn: async () => {
      const res = await fetch("/api/onboarding/catalog");
      const json: ApiResponse<GlobalCatalogProduct[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const filtered = (catalog ?? []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search catalog…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {isLoading && <p className="py-6 text-center text-sm text-muted-foreground">Loading catalog…</p>}
        {filtered.map((product) => (
          <button
            key={product.id}
            type="button"
            disabled={submitting}
            onClick={() =>
              onPick({
                name: product.name,
                sku: product.id.toUpperCase(),
                unit: product.unit,
                packSize: product.packSize,
                purchasePrice: 0,
                sellingPrice: product.suggestedSellingPrice,
                taxPercent: 0,
                minStock: product.minStock,
                currentStock: 0,
                description: "",
                barcode: "",
                imageUrl: "",
              })
            }
            className="flex w-full items-center justify-between rounded-xl border border-border p-3 text-left transition-colors hover:border-primary hover:bg-accent disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-lg">{product.imageEmoji}</span>
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.packSize}</p>
              </div>
            </div>
            <span className="text-xs text-primary">Use this</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">More import methods, coming soon</p>
        <TooltipProvider>
          <div className="flex gap-1.5">
            {FUTURE_IMPORT_METHODS.map(({ icon: Icon, label }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="icon" disabled aria-label={label}>
                    <Icon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label} — coming soon</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
