"use client";
import { useState } from "react";
import { useProducts, type ProductFilters } from "../api/use-products";
import { InventoryFilters } from "./inventory-filters";
import { InventoryTable } from "./inventory-table";
import { ProductFormDialog } from "./product-form-dialog";
import { DeleteProductDialog } from "./delete-product-dialog";
import type { ProductListRow } from "@/types/product";

export function InventoryList() {
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, pageSize: 10 });
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductListRow | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductListRow | null>(null);
  const { data, isLoading } = useProducts(filters);

  return (
    <div className="space-y-4">
      <InventoryFilters
        filters={filters}
        onChange={setFilters}
        onAddProduct={() => {
          setEditingProduct(null);
          setFormOpen(true);
        }}
      />

      <InventoryTable
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={filters.page ?? 1}
        pageSize={filters.pageSize ?? 10}
        isLoading={isLoading}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onEdit={(row) => {
          setEditingProduct(row);
          setFormOpen(true);
        }}
        onDelete={setDeletingProduct}
      />

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} editingProduct={editingProduct} />
      <DeleteProductDialog product={deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)} />
    </div>
  );
}
