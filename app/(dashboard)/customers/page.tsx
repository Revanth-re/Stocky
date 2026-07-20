import type { Metadata } from "next";
import { CustomersTable } from "@/features/customers/components/customers-table";
import { NewCustomerDialog } from "@/features/customers/components/new-customer-dialog";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground">Udhaar/khata balances and customer history.</p>
        </div>
        <NewCustomerDialog />
      </div>
      <CustomersTable />
    </div>
  );
}
