import type { Metadata } from "next";
import { InventoryList } from "@/features/inventory/components/inventory-list";
import { InventoryPageHeading } from "@/features/inventory/components/inventory-page-heading";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <InventoryPageHeading />
      <InventoryList />
    </div>
  );
}
