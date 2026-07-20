"use client";
import { format, differenceInCalendarDays } from "date-fns";
import { useInventoryBatches } from "../api/use-inventory-batches";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function ExpiryBatchesList({ productId }: { productId: string }) {
  const { data, isLoading } = useInventoryBatches(productId);

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-0">
        {isLoading ? (
          <Skeleton className="m-6 h-40" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch received</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    No stock batches recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {data?.map((batch) => {
                const daysLeft = batch.expiryDate ? differenceInCalendarDays(new Date(batch.expiryDate), new Date()) : null;
                return (
                  <TableRow key={batch.id}>
                    <TableCell>{format(new Date(batch.receivedAt), "d MMM yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {batch.source === "purchase_order" ? "Purchase order" : "Opening stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>{batch.quantity}</TableCell>
                    <TableCell>
                      {!batch.expiryDate ? (
                        <span className="text-muted-foreground">—</span>
                      ) : daysLeft !== null && daysLeft < 0 ? (
                        <Badge variant="destructive">Expired {format(new Date(batch.expiryDate), "d MMM yyyy")}</Badge>
                      ) : daysLeft !== null && daysLeft <= 7 ? (
                        <Badge variant="destructive">{format(new Date(batch.expiryDate), "d MMM yyyy")} ({daysLeft}d left)</Badge>
                      ) : daysLeft !== null && daysLeft <= 30 ? (
                        <Badge variant="warning">{format(new Date(batch.expiryDate), "d MMM yyyy")}</Badge>
                      ) : (
                        format(new Date(batch.expiryDate), "d MMM yyyy")
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
