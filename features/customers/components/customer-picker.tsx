"use client";
import { useState } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useCustomers, useCreateCustomer } from "../api/use-customers";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CustomerListRow } from "@/types/customer";

/** Search-and-pick for udhaar/credit sales, with an inline "add new customer" fallback when no match exists. */
export function CustomerPicker({
  value,
  onSelect,
}: {
  value: CustomerListRow | null;
  onSelect: (customer: CustomerListRow | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const debouncedQuery = useDebouncedSearch(query);
  const { data, isLoading } = useCustomers(debouncedQuery);
  const createCustomer = useCreateCustomer();

  const looksLikeNewName = query.trim().length > 1 && data?.items.length === 0;

  async function handleCreate() {
    if (!query.trim() || !newPhone.trim()) return;
    const created = await createCustomer.mutateAsync({ name: query.trim(), phone: newPhone.trim(), creditLimit: 0 });
    onSelect({ id: created.id, name: query.trim(), phone: newPhone.trim(), currentBalance: 0, creditLimit: 0, createdAt: new Date().toISOString() });
    setOpen(false);
    setQuery("");
    setNewPhone("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start sm:w-72">
          <Search className="size-4" />
          {value ? `${value.name} · ${value.phone}` : "Select udhaar customer…"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <Input
          autoFocus
          placeholder="Search name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {isLoading && <p className="p-3 text-center text-xs text-muted-foreground">Searching…</p>}
          {data?.items.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => {
                onSelect(customer);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
            >
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-xs text-muted-foreground">{customer.phone}</p>
              </div>
              {customer.currentBalance > 0 && (
                <span className="text-xs font-medium text-destructive">Owes {formatCurrency(customer.currentBalance)}</span>
              )}
              {value?.id === customer.id && <Check className="size-3.5 text-primary" />}
            </button>
          ))}

          {looksLikeNewName && (
            <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <UserPlus className="size-3.5" /> No match — add &quot;{query.trim()}&quot; as a new customer
              </p>
              <Input placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={!newPhone.trim() || createCustomer.isPending}
                loading={createCustomer.isPending}
                onClick={handleCreate}
              >
                Add & select
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
