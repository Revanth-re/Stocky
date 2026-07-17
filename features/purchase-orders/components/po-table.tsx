"use client";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePurchaseOrders } from "../api/use-purchase-orders";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { PO_STATUS_BADGE_VARIANT, PO_STATUS_LABEL } from "../lib/po-status";

export function PurchaseOrderTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePurchaseOrders(page);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 20));

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expected Delivery</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!isLoading && data?.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                No purchase orders yet.
              </TableCell>
            </TableRow>
          )}
          {data?.items.map((po) => (
            <TableRow key={po.id}>
              <TableCell>
                <Link href={`/purchase-orders/${po.id}` as never} className="font-medium text-primary hover:underline">
                  {po.poNumber}
                </Link>
              </TableCell>
              <TableCell>{po.supplierName}</TableCell>
              <TableCell>{po.itemCount}</TableCell>
              <TableCell className="font-medium">{formatCurrency(po.totalAmount)}</TableCell>
              <TableCell>
                <Badge variant={PO_STATUS_BADGE_VARIANT[po.status]} className="capitalize">
                  {PO_STATUS_LABEL[po.status]}
                </Badge>
              </TableCell>
              <TableCell>{po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), "d MMM yyyy") : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
