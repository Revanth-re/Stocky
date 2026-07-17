"use client";
import { useCategories, useCreateCategory } from "@/features/settings/api/use-catalog";
import { SimpleCatalogManager } from "@/features/settings/components/simple-catalog-manager";

export default function CategoriesSettingsPage() {
  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();

  return (
    <SimpleCatalogManager
      title="Categories"
      items={data}
      isLoading={isLoading}
      isSaving={createCategory.isPending}
      onAdd={(name) => createCategory.mutate({ name })}
    />
  );
}
