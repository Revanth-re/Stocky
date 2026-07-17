"use client";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSales } from "../api/use-sales";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function SalesTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSales(page);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / 20));

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Sold By</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
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
                No sales recorded yet.
              </TableCell>
            </TableRow>
          )}
          {data?.items.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                <Link href={`/sales/${sale.id}` as never} className="font-medium text-primary hover:underline">
                  {sale.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>{sale.itemCount}</TableCell>
              <TableCell>
                <Badge variant="outline" className="uppercase">
                  {sale.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell>{sale.soldByName ?? "—"}</TableCell>
              <TableCell className="font-medium">{formatCurrency(sale.totalAmount)}</TableCell>
              <TableCell>{format(new Date(sale.createdAt), "d MMM, h:mm a")}</TableCell>
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
