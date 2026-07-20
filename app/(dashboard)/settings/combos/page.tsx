import type { Metadata } from "next";
import { BundleList } from "@/features/bundles/components/bundle-list";

export const metadata: Metadata = { title: "Combos & Offers" };

export default function CombosSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Combos & Offers</h1>
        <p className="text-sm text-muted-foreground">Festival packs and bundle deals, applied automatically at billing.</p>
      </div>
      <BundleList />
    </div>
  );
}
