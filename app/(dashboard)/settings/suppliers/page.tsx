"use client";
import { useSuppliers, useCreateSupplier } from "@/features/settings/api/use-catalog";
import { SimpleCatalogManager } from "@/features/settings/components/simple-catalog-manager";

export default function SuppliersSettingsPage() {
  const { data, isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();

  return (
    <SimpleCatalogManager
      title="Suppliers"
      items={data}
      isLoading={isLoading}
      isSaving={createSupplier.isPending}
      onAdd={(name) => createSupplier.mutate({ name })}
    />
  );
}
