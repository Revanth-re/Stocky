import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getProductDetail } from "@/services/product-service";
import { ProductDetailHeader } from "@/features/inventory/components/product-detail-header";
import { ProductHistoryTabs } from "@/features/inventory/components/product-history-tabs";

export const metadata: Metadata = { title: "Product Details" };

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  const product = await getProductDetail(session.storeId, id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <ProductDetailHeader product={product} />
      <ProductHistoryTabs productId={product.id} />
    </div>
  );
}
