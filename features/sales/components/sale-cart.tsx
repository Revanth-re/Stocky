"use client";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { CartLine } from "./record-sale-form";

export function SaleCart({
  lines,
  onUpdateLine,
  onRemoveLine,
}: {
  lines: CartLine[];
  onUpdateLine: (productId: string, patch: Partial<CartLine>) => void;
  onRemoveLine: (productId: string) => void;
}) {
  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No products added yet. Search above to start a sale.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Line Total</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((line) => {
          const lineTotal = Math.max(0, line.sellingPrice * line.quantity - line.discountAmount);
          return (
            <TableRow key={line.productId}>
              <TableCell>
                <p className="font-medium">{line.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(line.sellingPrice)} / unit · {line.currentStock} in stock</p>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  max={line.currentStock}
                  value={line.quantity}
                  className="w-20"
                  onChange={(e) => onUpdateLine(line.productId, { quantity: Number(e.target.value) })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  value={line.discountAmount}
                  className="w-24"
                  onChange={(e) => onUpdateLine(line.productId, { discountAmount: Number(e.target.value) })}
                />
              </TableCell>
              <TableCell className="font-medium">{formatCurrency(lineTotal)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onRemoveLine(line.productId)} aria-label="Remove">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
