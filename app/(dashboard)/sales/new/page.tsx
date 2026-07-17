import type { Metadata } from "next";
import { RecordSaleForm } from "@/features/sales/components/record-sale-form";

export const metadata: Metadata = { title: "Record Sale" };

export default function NewSalePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Record Sale</h1>
        <p className="text-sm text-muted-foreground">Add products, choose a payment method, and complete the sale.</p>
      </div>
      <RecordSaleForm />
    </div>
  );
}
