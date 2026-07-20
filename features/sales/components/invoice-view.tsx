"use client";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { useSale } from "../api/use-sales";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { UpiQrCode } from "@/components/shared/upi-qr-code";

/** Print-to-PDF invoice. Uses the browser's native print dialog ("Save as PDF")
 *  rather than a server PDF library — zero extra dependencies, works offline,
 *  and gives the owner a familiar OS-level "Save as PDF" flow. */
export function InvoiceView({ saleId }: { saleId: string }) {
  const { data: sale, isLoading } = useSale(saleId);

  if (isLoading || !sale) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="size-4" /> Download / Print Invoice
        </Button>
      </div>

      <Card className="rounded-2xl print:rounded-none print:border-none print:shadow-none">
        <CardContent className="p-8">
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div>
              <p className="text-lg font-semibold">{sale.storeName}</p>
              <p className="text-sm text-muted-foreground">Invoice {sale.invoiceNumber}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{format(new Date(sale.createdAt), "d MMM yyyy, h:mm a")}</p>
              <p>Served by {sale.soldByName ?? "—"}</p>
            </div>
          </div>

          {(sale.customerName || sale.customerPhone) && (
            <div className="border-b border-border py-4 text-sm">
              <p className="text-muted-foreground">Billed to</p>
              <p className="font-medium">{sale.customerName || "Walk-in customer"}</p>
              {sale.customerPhone && <p className="text-muted-foreground">{sale.customerPhone}</p>}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.discountAmount)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex flex-col items-end gap-4 sm:flex-row sm:items-start sm:justify-end">
            {sale.storeUpiId && sale.paymentMethod !== "credit" && (
              <UpiQrCode
                vpa={sale.storeUpiId}
                payeeName={sale.storeName}
                amount={sale.totalAmount}
                note={sale.invoiceNumber}
              />
            )}
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-{formatCurrency(sale.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatCurrency(sale.taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(sale.totalAmount)}</span>
              </div>
              <p className="pt-2 text-xs uppercase text-muted-foreground">
                Paid via {sale.paymentMethod === "credit" ? "Udhaar / Credit" : sale.paymentMethod}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
