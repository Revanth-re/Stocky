import type { Metadata } from "next";
import { CustomersTable } from "@/features/customers/components/customers-table";
import { NewCustomerDialog } from "@/features/customers/components/new-customer-dialog";
import { CustomersPageHeading } from "@/features/customers/components/customers-page-heading";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CustomersPageHeading />
        <NewCustomerDialog />
      </div>
      <CustomersTable />
    </div>
  );
}
