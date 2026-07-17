import type { Metadata } from "next";
import { InvoiceView } from "@/features/sales/components/invoice-view";

export const metadata: Metadata = { title: "Invoice" };

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoiceView saleId={id} />;
}
