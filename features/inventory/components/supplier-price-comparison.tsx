"use client";
import { useState } from "react";
import { Trophy, Plus } from "lucide-react";
import { useSupplierPrices, useUpsertSupplierPrice } from "../api/use-supplier-prices";
import { useSuppliers } from "@/features/settings/api/use-catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

/** Lets the owner record what each local wholesaler quotes for this product, and see who's cheapest before reordering. */
export function SupplierPriceComparison({ productId }: { productId: string }) {
  const { data: prices, isLoading } = useSupplierPrices(productId);
  const { data: suppliers } = useSuppliers();
  const upsertPrice = useUpsertSupplierPrice(productId);
  const [supplierId, setSupplierId] = useState("");
  const [price, setPrice] = useState("");

  async function handleAdd() {
    if (!supplierId || !price || Number(price) <= 0) return;
    await upsertPrice.mutateAsync({ supplierId, price: Number(price) });
    setSupplierId("");
    setPrice("");
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-48 space-y-1.5">
            <p className="text-xs text-muted-foreground">Supplier</p>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32 space-y-1.5">
            <p className="text-xs text-muted-foreground">Quoted price</p>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <Button onClick={handleAdd} loading={upsertPrice.isPending} disabled={!supplierId || !price}>
            <Plus className="size-4" /> Save quote
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : prices?.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No supplier quotes recorded yet. Add prices from each of your local wholesalers to compare.
          </p>
        ) : (
          <div className="space-y-1.5">
            {prices?.map((row) => (
              <div key={row.supplierId} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {row.isCheapest && <Trophy className="size-4 text-warning" />}
                  <span className="font-medium">{row.supplierName}</span>
                  {row.isCheapest && <Badge variant="success">Cheapest</Badge>}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(row.price)}</p>
                  <p className="text-xs text-muted-foreground">Updated {format(new Date(row.updatedAt), "d MMM yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
