import type { Metadata } from "next";
import { PurchaseOrderDetailView } from "@/features/purchase-orders/components/po-detail-view";

export const metadata: Metadata = { title: "Purchase Order" };

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PurchaseOrderDetailView poId={id} />;
}
