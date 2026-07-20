"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useCustomers } from "../api/use-customers";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export function CustomersTable() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const { data, isLoading } = useCustomers(debouncedSearch);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search name or phone…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-0">
          {isLoading ? (
            <Skeleton className="m-6 h-64" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Credit limit</TableHead>
                  <TableHead>Balance owed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      No customers yet. They&apos;re added automatically the first time you record an udhaar sale, or you can add one from Sales.
                    </TableCell>
                  </TableRow>
                )}
                {data?.items.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link href={`/customers/${customer.id}` as never} className="flex items-center gap-2 font-medium hover:text-primary hover:underline">
                        <UserRound className="size-4 text-muted-foreground" />
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.creditLimit > 0 ? formatCurrency(customer.creditLimit) : "—"}</TableCell>
                    <TableCell>
                      {customer.currentBalance > 0 ? (
                        <Badge variant="destructive">{formatCurrency(customer.currentBalance)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Settled</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
