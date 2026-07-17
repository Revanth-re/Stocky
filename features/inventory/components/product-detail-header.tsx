"use client";
import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { STOCK_STATUS_LABEL, STOCK_STATUS_BADGE_VARIANT } from "@/lib/inventory-status";
import type { ProductDetail } from "@/types/product";

export function ProductDetailHeader({ product }: { product: ProductDetail }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} width={96} height={96} className="object-cover" />
          ) : (
            <Package className="size-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <Badge variant={STOCK_STATUS_BADGE_VARIANT[product.status]}>{STOCK_STATUS_LABEL[product.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{product.description || "No description added yet."}</p>

          <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
            <Field label="SKU" value={product.sku} />
            <Field label="Barcode" value={product.barcode ?? "—"} />
            <Field label="Supplier" value={product.supplierName ?? "—"} />
            <Field label="Category" value={product.categoryName ?? "—"} />
            <Field label="Purchase Price" value={formatCurrency(product.purchasePrice)} />
            <Field label="Selling Price" value={formatCurrency(product.sellingPrice)} />
            <Field label="Current Stock" value={`${product.currentStock} ${product.unit}`} />
            <Field label="Minimum Stock" value={`${product.minStock} ${product.unit}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
