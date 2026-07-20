"use client";
import { format } from "date-fns";
import { useProductHistory } from "../api/use-products";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ForecastPlaceholderCard } from "./forecast-placeholder-card";
import { SupplierPriceComparison } from "./supplier-price-comparison";

export function ProductHistoryTabs({ productId }: { productId: string }) {
  const { data, isLoading } = useProductHistory(productId);

  return (
    <Tabs defaultValue="sales">
      <TabsList>
        <TabsTrigger value="sales">Sales History</TabsTrigger>
        <TabsTrigger value="purchases">Purchase History</TabsTrigger>
        <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
        <TabsTrigger value="suppliers">Supplier Prices</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
      </TabsList>

      <TabsContent value="sales">
        <Card className="rounded-2xl">
          <CardContent className="p-0">
            {isLoading ? (
              <Skeleton className="m-6 h-40" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.sales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No sales recorded for this product yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.sales.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.invoiceNumber}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{formatCurrency(row.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(row.lineTotal)}</TableCell>
                      <TableCell>{format(new Date(row.soldAt), "d MMM yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="purchases">
        <Card className="rounded-2xl">
          <CardContent className="p-0">
            {isLoading ? (
              <Skeleton className="m-6 h-40" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Ordered</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.purchases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No purchase orders for this product yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.purchases.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.poNumber}</TableCell>
                      <TableCell>{row.supplierName}</TableCell>
                      <TableCell>{row.quantityOrdered}</TableCell>
                      <TableCell>{row.quantityReceived}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(row.createdAt), "d MMM yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card className="rounded-2xl">
          <CardContent className="space-y-4 p-6">
            {isLoading && <Skeleton className="h-40" />}
            {data?.activity.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
            )}
            {data?.activity.map((row) => (
              <div key={row.id} className="flex gap-3 border-l-2 border-border pl-4">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{row.action.replace(/_/g, " ")}</p>
                  <p className="text-sm text-muted-foreground">{row.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.actorName ? `${row.actorName} · ` : ""}
                    {format(new Date(row.createdAt), "d MMM yyyy, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="suppliers">
        <SupplierPriceComparison productId={productId} />
      </TabsContent>

      <TabsContent value="forecast">
        <ForecastPlaceholderCard productId={productId} />
      </TabsContent>
    </Tabs>
  );
}
