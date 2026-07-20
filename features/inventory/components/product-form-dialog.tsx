"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductForm } from "./product-form";
import { ProductLibraryPicker } from "./product-library-picker";
import { useCreateProduct, useUpdateProduct } from "../api/use-products";
import type { ProductInput } from "@/validators/product";
import type { ProductListRow } from "@/types/product";

export function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct?: ProductListRow | null;
}) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(editingProduct?.id ?? "");
  const isEditing = !!editingProduct;

  function handleSubmit(values: ProductInput) {
    const mutation = isEditing ? updateProduct : createProduct;
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update product details and stock." : "Add a product manually or pull one from the catalog library."}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <ProductForm
            defaultValues={{
              name: editingProduct.name,
              sku: editingProduct.sku,
              barcode: editingProduct.barcode ?? "",
              purchasePrice: editingProduct.purchasePrice,
              sellingPrice: editingProduct.sellingPrice,
              currentStock: editingProduct.currentStock,
              minStock: editingProduct.minStock,
              expiryDate: editingProduct.nearestExpiryDate ?? "",
            }}
            submitting={updateProduct.isPending}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <Tabs defaultValue="manual">
            <TabsList>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="library">Product Library</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <ProductForm submitting={createProduct.isPending} onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
            </TabsContent>
            <TabsContent value="library">
              <ProductLibraryPicker
                onPick={(prefill) => handleSubmit(prefill)}
                submitting={createProduct.isPending}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
