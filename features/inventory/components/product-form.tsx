"use client";
import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
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
import { DynamicProductFields } from "@/components/shared/dynamic-product-fields";
import { useStoreProfile } from "@/features/settings/api/use-store-profile";
import { useModulesSettings } from "@/features/settings/api/use-modules";
import { getBusinessTemplate } from "@/business/registry";

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
  customFields: {},
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
  const { data: store } = useStoreProfile();
  const templateConfig = store?.businessTemplate ? getBusinessTemplate(store.businessTemplate) : null;
  const templateProductFields = templateConfig?.productFields ?? [];
  // Only show fields relevant to the tenant's business template — a fashion store shouldn't see
  // grocery's expiry date / weight-based pricing, and vice versa. See business/types.ts.
  const showExpiry = templateConfig?.usesExpiryTracking ?? true;
  const showWeightPricing = templateConfig?.usesWeightBasedPricing ?? true;
  const { data: modulesSettings } = useModulesSettings();
  // "Barcode Recognition" is a Live AI feature (Settings > Modules & AI) — its toggle controls
  // whether the camera-scan entry point shows up here, not just a recorded preference.
  const barcodeScanEnabled = modulesSettings?.aiFeatures.some((f) => f.id === "barcode-recognition" && f.enabled) ?? true;
  const queryClient = useQueryClient();

  /** Match an existing category/brand by name, or create a new one on the fly — so scanning still fills the field in even on a brand-new, empty catalog. */
  async function findOrCreateCatalogEntry(
    kind: "categories" | "brands",
    existing: { id: string; name: string }[] | undefined,
    name: string,
  ): Promise<string | null> {
    const lower = name.toLowerCase();
    const match = existing?.find((c) => c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase()));
    if (match) return match.id;

    try {
      const res = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return null;
      queryClient.invalidateQueries({ queryKey: [kind] });
      return json.data.id as string;
    } catch {
      return null;
    }
  }

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
      if (info.category && !form.getValues("categoryId")) {
        const categoryId = await findOrCreateCatalogEntry("categories", categories, info.category);
        if (categoryId) form.setValue("categoryId", categoryId, { shouldDirty: true });
      }
      if (info.brand && !form.getValues("brandId")) {
        const brandId = await findOrCreateCatalogEntry("brands", brands, info.brand);
        if (brandId) form.setValue("brandId", brandId, { shouldDirty: true });
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
                  <Input placeholder="Product name" {...field} />
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
                  <Input placeholder="Unique product code" {...field} />
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
                  {barcodeScanEnabled && (
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
                  )}
                </div>
                <FormDescription>
                  {barcodeScanEnabled
                    ? "Scanning also tries to auto-fill name, pack size and category."
                    : "You can still type a barcode in manually — camera scanning is turned off in Settings > Modules & AI."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Business-template-specific fields (Size/Color for fashion, IMEI for electronics, batch number
            for pharmacy, ...) surface right up front — not buried under generic fields that may not even
            apply to this template. See business/<template>/config.ts#productFields. */}
        <DynamicProductFields
          control={form.control}
          fields={templateProductFields}
          templateLabel={templateConfig?.label}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField control={form.control} name="categoryId" label="Category" options={categories} />
          <SelectField control={form.control} name="brandId" label="Brand" options={brands} />
          <SelectField control={form.control} name="supplierId" label="Supplier" options={suppliers} />

          {showWeightPricing && (
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
          )}
          {showExpiry && (
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
          )}

          {showWeightPricing && (
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
          )}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{showWeightPricing && pricingType === "weight" ? "Weight unit" : "Unit"}</FormLabel>
                <FormControl>
                  <Input placeholder={showWeightPricing && pricingType === "weight" ? "kg, g, ltr…" : "pcs, pair, box…"} {...field} />
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
