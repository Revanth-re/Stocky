"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { useCreateBundle, useUpdateBundle } from "../api/use-bundles";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useProducts } from "@/features/inventory/api/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import type { BundleDTO } from "@/types/bundle";
import type { BundleInput } from "@/validators/bundle";

type LineItem = { productId: string; productName: string; unitPrice: number; quantity: number };

export function BundleFormDialog({ bundle, trigger }: { bundle?: BundleDTO; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(bundle?.name ?? "");
  const [description, setDescription] = useState(bundle?.description ?? "");
  const [comboPrice, setComboPrice] = useState(bundle ? String(bundle.comboPrice) : "");
  const [isActive, setIsActive] = useState(bundle?.isActive ?? true);
  const [items, setItems] = useState<LineItem[]>(
    bundle?.items.map((i) => ({ productId: i.productId, productName: i.productName, unitPrice: i.unitPrice, quantity: i.quantity })) ?? [],
  );

  const createBundle = useCreateBundle();
  const updateBundle = useUpdateBundle(bundle?.id ?? "");
  const saving = createBundle.isPending || updateBundle.isPending;

  useEffect(() => {
    if (!open) return;
    setName(bundle?.name ?? "");
    setDescription(bundle?.description ?? "");
    setComboPrice(bundle ? String(bundle.comboPrice) : "");
    setIsActive(bundle?.isActive ?? true);
    setItems(bundle?.items.map((i) => ({ productId: i.productId, productName: i.productName, unitPrice: i.unitPrice, quantity: i.quantity })) ?? []);
  }, [open, bundle]);

  const regularTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  function addItem(productId: string, productName: string, unitPrice: number) {
    setItems((prev) => {
      if (prev.some((i) => i.productId === productId)) return prev;
      return [...prev, { productId, productName, unitPrice, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleSave() {
    const input: BundleInput = {
      name,
      description,
      comboPrice: Number(comboPrice),
      isActive,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };
    if (bundle) {
      await updateBundle.mutateAsync(input);
    } else {
      await createBundle.mutateAsync(input);
    }
    setOpen(false);
  }

  const canSave = name.trim().length >= 2 && Number(comboPrice) > 0 && items.length >= 2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bundle ? "Edit combo" : "New combo"}</DialogTitle>
          <DialogDescription>Bundle 2+ products together at a fixed price, e.g. a Diwali snack pack.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Combo name</Label>
              <Input placeholder="Diwali Snack Pack" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Combo price</Label>
              <Input type="number" step="0.01" value={comboPrice} onChange={(e) => setComboPrice(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Products in this combo</Label>
            <ComboProductPicker onSelect={(p) => addItem(p.id, p.name, p.sellingPrice)} />

            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Add at least 2 products.
              </p>
            ) : (
              <div className="space-y-1.5">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="font-medium">{item.productName}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        className="w-16"
                        onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Regular total: {formatCurrency(regularTotal)}
                  {Number(comboPrice) > 0 && ` · Customer saves ${formatCurrency(Math.max(0, regularTotal - Number(comboPrice)))}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!canSave} loading={saving} onClick={handleSave}>
            Save combo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ComboProductPicker({ onSelect }: { onSelect: (product: { id: string; name: string; sellingPrice: number }) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query);
  const { data, isLoading } = useProducts({ search: debouncedQuery, page: 1, pageSize: 8 });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="size-4" /> Add product
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus placeholder="Search products…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {isLoading && <p className="p-3 text-center text-xs text-muted-foreground">Searching…</p>}
          {data?.items.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onSelect(product);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <span>{product.name}</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(product.sellingPrice)}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
