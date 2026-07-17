"use client";
import { format } from "date-fns";
import { CheckCircle2, Printer, Sparkles, XCircle } from "lucide-react";
import { usePurchaseOrder, useUpdatePurchaseOrderStatus } from "../api/use-purchase-orders";
import { PO_STATUS_BADGE_VARIANT, PO_STATUS_LABEL } from "../lib/po-status";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function PurchaseOrderDetailView({ poId }: { poId: string }) {
  const { data: po, isLoading } = usePurchaseOrder(poId);
  const updateStatus = useUpdatePurchaseOrderStatus(poId);

  if (isLoading || !po) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          {po.status === "ordered" && (
            <>
              <Button size="sm" loading={updateStatus.isPending} onClick={() => updateStatus.mutate("received")}>
                <CheckCircle2 className="size-4" /> Mark Received
              </Button>
              <Button size="sm" variant="outline" loading={updateStatus.isPending} onClick={() => updateStatus.mutate("cancelled")}>
                <XCircle className="size-4" /> Cancel
              </Button>
            </>
          )}
          {po.sourcedFromForecast && (
            <Badge variant="info" className="gap-1">
              <Sparkles className="size-3" /> From AI Forecast
            </Badge>
          )}
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="size-4" /> Download PDF
        </Button>
      </div>

      <Card className="rounded-2xl print:rounded-none print:border-none print:shadow-none">
        <CardContent className="p-8">
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div>
              <p className="text-lg font-semibold">{po.storeName}</p>
              <p className="text-sm text-muted-foreground">Purchase Order {po.poNumber}</p>
            </div>
            <Badge variant={PO_STATUS_BADGE_VARIANT[po.status]} className="h-fit capitalize">
              {PO_STATUS_LABEL[po.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-border py-4 text-sm sm:grid-cols-4">
            <Field label="Supplier" value={po.supplierName} />
            <Field label="Supplier Phone" value={po.supplierPhone ?? "—"} />
            <Field label="Created By" value={po.createdByName ?? "—"} />
            <Field label="Expected Delivery" value={po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), "d MMM yyyy") : "—"} />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantityOrdered}</TableCell>
                  <TableCell>{item.quantityReceived}</TableCell>
                  <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(item.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="ml-auto mt-6 flex w-full max-w-xs justify-between border-t border-border pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(po.totalAmount)}</span>
          </div>

          {po.notes && (
            <div className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Notes</p>
              {po.notes}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
