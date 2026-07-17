"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "../api/use-products";
import type { ProductListRow } from "@/types/product";

export function DeleteProductDialog({
  product,
  onOpenChange,
}: {
  product: ProductListRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteProduct = useDeleteProduct();

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete product?</DialogTitle>
          <DialogDescription>
            {product?.name} will be removed from your active catalog. This can be undone from Settings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={deleteProduct.isPending}
            onClick={() => product && deleteProduct.mutate(product.id, { onSuccess: () => onOpenChange(false) })}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
