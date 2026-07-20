"use client";
import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
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
  expiryDate: "",
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
  const [lookingUp, setLookingUp] = useState(false);
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: suppliers } = useSuppliers();

  async function handleScan(code: string) {
    form.setValue("barcode", code, { shouldValidate: true, shouldDirty: true });
    // SKU is required to save the product — auto-fill something from the
    // barcode straight away so a fast scan-then-save never gets silently
    // blocked by a missing SKU (you can still edit it before saving).
    if (!form.getValues("sku")) {
      form.setValue("sku", `SKU-${code}`, { shouldValidate: true, shouldDirty: true });
    }
    setLookingUp(true);
    try {
      const res = await fetch(`/api/products/lookup-barcode/${encodeURIComponent(code)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast(json.error === "No product details found for this barcode"
          ? "Barcode saved. No product details found online — fill the rest in manually."
          : "Barcode saved. Couldn't look up product details.");
        return;
      }
      const info = json.data as { name: string | null; brand: string | null; category: string | null; quantity: string | null; imageUrl: string | null };
      if (info.name && !form.getValues("name")) form.setValue("name", info.name, { shouldDirty: true });
      if (info.quantity && !form.getValues("packSize")) form.setValue("packSize", info.quantity, { shouldDirty: true });
      if (info.imageUrl && !form.getValues("imageUrl")) form.setValue("imageUrl", info.imageUrl, { shouldDirty: true });
      if (info.category && categories?.length) {
        const match = categories.find((c) => c.name.toLowerCase().includes(info.category!.toLowerCase()) || info.category!.toLowerCase().includes(c.name.toLowerCase()));
        if (match && !form.getValues("categoryId")) form.setValue("categoryId", match.id, { shouldDirty: true });
      }
      if (info.brand && brands?.length) {
        const brandMatch = brands.find((b) => b.name.toLowerCase().includes(info.brand!.toLowerCase()) || info.brand!.toLowerCase().includes(b.name.toLowerCase()));
        if (brandMatch && !form.getValues("brandId")) form.setValue("brandId", brandMatch.id, { shouldDirty: true });
      }
      toast.success("Filled in product details from barcode — please review before saving.");
    } catch {
      toast("Barcode saved. Couldn't reach the product lookup service.");
    } finally {
      setLookingUp(false);
    }
  }
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
                    disabled={lookingUp}
                    aria-label="Scan barcode"
                  >
                    {lookingUp ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
                  </Button>
                </div>
                <FormDescription>Scanning also tries to auto-fill name, pack size and category.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <SelectField control={form.control} name="categoryId" label="Category" options={categories} />
          <SelectField control={form.control} name="brandId" label="Brand" options={brands} />
          <SelectField control={form.control} name="supplierId" label="Supplier" options={suppliers} />

          <FormField
            control={form.control}
            name="packSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pack size / weight</FormLabel>
                <FormControl>
                  <Input placeholder="500 g, 1 kg, 1 ltr..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Optional — leave blank if this item doesn't expire.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
        onScan={handleScan}
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
