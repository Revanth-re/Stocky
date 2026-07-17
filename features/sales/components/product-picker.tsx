"use client";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useProducts } from "@/features/inventory/api/use-products";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { ProductListRow } from "@/types/product";

export function ProductPicker({ onSelect }: { onSelect: (product: ProductListRow) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query);
  const { data, isLoading } = useProducts({ search: debouncedQuery, page: 1, pageSize: 8 });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start sm:w-72">
          <Search className="size-4" /> Search products to add…
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <Input
          autoFocus
          placeholder="Search by name or SKU"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {isLoading && <p className="p-3 text-center text-xs text-muted-foreground">Searching…</p>}
          {!isLoading && data?.items.length === 0 && (
            <p className="p-3 text-center text-xs text-muted-foreground">No products found.</p>
          )}
          {data?.items.map((product) => (
            <button
              key={product.id}
              type="button"
              disabled={product.currentStock <= 0}
              onClick={() => {
                onSelect(product);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.sku} · {product.currentStock} in stock
                </p>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <span className="text-xs font-medium">{formatCurrency(product.sellingPrice)}</span>
                <Plus className="size-3.5" />
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
