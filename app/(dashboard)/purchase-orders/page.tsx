import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseOrderTable } from "@/features/purchase-orders/components/po-table";

export const metadata: Metadata = { title: "Purchase Orders" };

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Track orders from suppliers, start to finish.</p>
        </div>
        <Button asChild>
          <Link href="/purchase-orders/new">
            <Plus className="size-4" /> New Purchase Order
          </Link>
        </Button>
      </div>
      <PurchaseOrderTable />
    </div>
  );
}
