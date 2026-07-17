"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { createPurchaseOrderSchema, type CreatePurchaseOrderInput } from "@/validators/purchase-order";
import { useSuppliers } from "@/features/settings/api/use-catalog";
import { useCreatePurchaseOrder } from "../api/use-purchase-orders";
import { ProductPicker } from "@/features/sales/components/product-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatCurrency } from "@/lib/utils";

export function PurchaseOrderForm({
  prefill,
  initialProductNames,
}: {
  prefill?: Partial<CreatePurchaseOrderInput>;
  initialProductNames?: Record<string, string>;
}) {
  const { data: suppliers } = useSuppliers();
  const createPO = useCreatePurchaseOrder();
  const form = useForm<CreatePurchaseOrderInput>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: { supplierId: "", items: [], expectedDeliveryDate: "", notes: "", ...prefill },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const [productNames, setProductNames] = useState<Record<string, string>>(initialProductNames ?? {});
  const items = form.watch("items");
  const total = items.reduce((sum, item) => sum + (item.quantityOrdered || 0) * (item.unitCost || 0), 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createPO.mutate(values))} className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expectedDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected delivery</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Delivery instructions, payment terms…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductPicker
              onSelect={(product) => {
                append({ productId: product.id, quantityOrdered: 1, unitCost: product.purchasePrice });
                setProductNames((prev) => ({ ...prev, [product.id]: product.name }));
              }}
            />

            {fields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No products added yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Line Total</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <input type="hidden" {...form.register(`items.${index}.productId`)} />
                        {productNames[field.productId] ?? `Product #${index + 1}`}
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={1} className="w-20" {...form.register(`items.${index}.quantityOrdered`)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} step="0.01" className="w-28" {...form.register(`items.${index}.unitCost`)} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency((items[index]?.quantityOrdered || 0) * (items[index]?.unitCost || 0))}
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="flex justify-end border-t border-border pt-4 text-lg font-semibold">
              Total: {formatCurrency(total)}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={createPO.isPending} disabled={fields.length === 0}>
            <Plus className="size-4" /> Create Purchase Order
          </Button>
        </div>
      </form>
    </Form>
  );
}
