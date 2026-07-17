import type { Metadata } from "next";
import { InventoryList } from "@/features/inventory/components/inventory-list";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <p className="text-sm text-muted-foreground">Manage your product catalog and stock levels.</p>
      </div>
      <InventoryList />
    </div>
  );
}
