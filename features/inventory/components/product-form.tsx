"use client";
import { useState } from "react";
import { ScanLine } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/validators/product";
import { useSuppliers, useCategories, useBrands } from "@/features/settings/api/use-catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { BarcodeScannerDialog } from "@/components/shared/barcode-scanner-dialog";

const DEFAULTS: ProductInput = {
  name: "",
  description: "",
  sku: "",
  barcode: "",
  imageUrl: "",
  brandId: "",
  categoryId: "",
  supplierId: "",
  unit: "pcs",
  packSize: "",
  pricingType: "unit",
  purchasePrice: 0,
  sellingPrice: 0,
  taxPercent: 0,
  minStock: 5,
  maxStock: undefined,
  currentStock: 0,
};

export function ProductForm({
  defaultValues,
  submitting,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<ProductInput>;
  submitting: boolean;
  onSubmit: (values: ProductInput) => void;
  onCancel: () => void;
}) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: suppliers } = useSuppliers();
  const pricingType = form.watch("pricingType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Product name</FormLabel>
                <FormControl>
                  <Input placeholder="Amul Milk Packet 500ml" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="AMUL-MILK-500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="8901030..." {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setScannerOpen(true)}
                    aria-label="Scan barcode"
                  >
                    <ScanLine className="size-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectField control={form.control} name="categoryId" label="Category" options={categories} />
          <SelectField control={form.control} name="brandId" label="Brand" options={brands} />
          <SelectField control={form.control} name="supplierId" label="Supplier" options={suppliers} />

          <FormField
            control={form.control}
            name="pricingType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sold as</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unit">Whole pieces (pcs, packet, box…)</SelectItem>
                    <SelectItem value="weight">Loose / by weight (kg, g, ltr…)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {pricingType === "weight"
                    ? "Billing will accept fractional quantities (e.g. 0.5) in this unit."
                    : "Billing will use whole-number quantities."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{pricingType === "weight" ? "Weight unit" : "Unit"}</FormLabel>
                <FormControl>
                  <Input placeholder={pricingType === "weight" ? "kg, g, ltr…" : "pcs, packet, box…"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase price {pricingType === "weight" && <span className="text-muted-foreground">(per {form.watch("unit") || "unit"})</span>}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling price {pricingType === "weight" && <span className="text-muted-foreground">(per {form.watch("unit") || "unit"})</span>}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current stock</FormLabel>
                <FormControl>
                  <Input type="number" step={pricingType === "weight" ? "0.001" : "1"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum stock</FormLabel>
                <FormControl>
                  <Input type="number" step={pricingType === "weight" ? "0.001" : "1"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional product notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save product
          </Button>
        </DialogFooter>
      </form>

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        title="Scan product barcode"
        description="Point the camera at the barcode to fill it in automatically."
        onScan={(code) => form.setValue("barcode", code, { shouldValidate: true, shouldDirty: true })}
      />
    </Form>
  );
}

function SelectField({
  control,
  name,
  label,
  options,
}: {
  control: ReturnType<typeof useForm<ProductInput>>["control"];
  name: "categoryId" | "brandId" | "supplierId";
  label: string;
  options?: { id: string; name: string }[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
