"use client";
import { useBrands, useCreateBrand } from "@/features/settings/api/use-catalog";
import { SimpleCatalogManager } from "@/features/settings/components/simple-catalog-manager";

export default function BrandsSettingsPage() {
  const { data, isLoading } = useBrands();
  const createBrand = useCreateBrand();

  return (
    <SimpleCatalogManager
      title="Brands"
      items={data}
      isLoading={isLoading}
      isSaving={createBrand.isPending}
      onAdd={(name) => createBrand.mutate({ name })}
    />
  );
}
