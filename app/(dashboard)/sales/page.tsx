import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesTable } from "@/features/sales/components/sales-table";
import { ImportSalesDialog } from "@/features/sales/components/import-sales-dialog";

export const metadata: Metadata = { title: "Sales" };

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Sales</h1>
          <p className="text-sm text-muted-foreground">Every transaction, in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportSalesDialog />
          <Button asChild>
            <Link href="/sales/new">
              <Plus className="size-4" /> Record Sale
            </Link>
          </Button>
        </div>
      </div>
      <SalesTable />
    </div>
  );
}
