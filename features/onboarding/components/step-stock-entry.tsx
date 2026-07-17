"use client";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { stockEntrySchema, type StockEntryInput } from "@/validators/onboarding";
import { useCatalogForBrands } from "../api/use-onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function StepStockEntry({
  brandSlugs,
  onBack,
  onSubmit,
  submitting,
}: {
  brandSlugs: string[];
  onBack: () => void;
  onSubmit: (values: StockEntryInput) => void;
  submitting: boolean;
}) {
  const { data: catalog, isLoading } = useCatalogForBrands(brandSlugs);
  const form = useForm<StockEntryInput>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: { rows: [] },
  });
  const { fields, replace } = useFieldArray({ control: form.control, name: "rows" });

  useEffect(() => {
    if (catalog) {
      replace(
        catalog.map((product) => ({
          productId: product.id,
          purchasePrice: 0,
          currentStock: 0,
          supplierName: "",
        })),
      );
    }
  }, [catalog, replace]);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Just a few final details</CardTitle>
        <CardDescription>
          Everything else is already set up. Add purchase price, current stock &amp; supplier for each product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Purchase price</TableHead>
                  <TableHead>Current stock</TableHead>
                  <TableHead>Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-medium">{catalog?.[index]?.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="₹0.00"
                        className="w-28"
                        {...form.register(`rows.${index}.purchasePrice`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-24"
                        {...form.register(`rows.${index}.currentStock`)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Supplier name"
                        className="w-44"
                        {...form.register(`rows.${index}.supplierName`)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={onBack}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button type="submit" size="lg" loading={submitting}>
                Finish setup
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
