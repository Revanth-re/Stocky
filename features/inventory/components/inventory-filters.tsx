"use client";
import { Search, Plus } from "lucide-react";
import { useSuppliers, useCategories, useBrands } from "@/features/settings/api/use-catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductFilters } from "../api/use-products";
import { useLanguage } from "@/lib/i18n/language-context";

const STATUS_OPTIONS = [
  { value: "good", label: "Good" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "critical", label: "Critical" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export function InventoryFilters({
  filters,
  onChange,
  onAddProduct,
}: {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  onAddProduct: () => void;
}) {
  const { data: suppliers } = useSuppliers();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("inventory.searchPlaceholder")}
            className="pl-9"
            defaultValue={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>

        <FilterSelect
          placeholder="Category"
          value={filters.categoryId}
          options={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
          onChange={(value) => onChange({ ...filters, categoryId: value, page: 1 })}
        />
        <FilterSelect
          placeholder="Brand"
          value={filters.brandId}
          options={brands?.map((b) => ({ value: b.id, label: b.name })) ?? []}
          onChange={(value) => onChange({ ...filters, brandId: value, page: 1 })}
        />
        <FilterSelect
          placeholder="Supplier"
          value={filters.supplierId}
          options={suppliers?.map((s) => ({ value: s.id, label: s.name })) ?? []}
          onChange={(value) => onChange({ ...filters, supplierId: value, page: 1 })}
        />
        <FilterSelect
          placeholder="Stock Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(value) => onChange({ ...filters, status: value, page: 1 })}
        />
      </div>

      <Button onClick={onAddProduct}>
        <Plus className="size-4" /> {t("inventory.addProduct")}
      </Button>
    </div>
  );
}

function FilterSelect({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
}) {
  return (
    <Select value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? undefined : v)}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
