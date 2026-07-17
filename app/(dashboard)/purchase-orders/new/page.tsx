import type { Metadata } from "next";
import { PurchaseOrderForm } from "@/features/purchase-orders/components/po-form";
import { getSession } from "@/lib/auth/session";
import { getProductDetail } from "@/services/product-service";

export const metadata: Metadata = { title: "New Purchase Order" };

export default async function NewPurchaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; qty?: string }>;
}) {
  const { productId, qty } = await searchParams;
  const session = await getSession();

  let prefill: { items: { productId: string; quantityOrdered: number; unitCost: number }[] } | undefined;
  let initialProductNames: Record<string, string> | undefined;

  if (productId && session) {
    const product = await getProductDetail(session.storeId, productId);
    if (product) {
      prefill = {
        items: [{ productId: product.id, quantityOrdered: Number(qty) || product.minStock, unitCost: product.purchasePrice }],
      };
      initialProductNames = { [product.id]: product.name };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Purchase Order</h1>
        <p className="text-sm text-muted-foreground">Order stock from a supplier.</p>
      </div>
      <PurchaseOrderForm prefill={prefill} initialProductNames={initialProductNames} />
    </div>
  );
}
