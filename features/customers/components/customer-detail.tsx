"use client";
import { useState } from "react";
import { format } from "date-fns";
import { MessageCircle, IndianRupee, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useCustomer, useRecordCustomerPayment } from "../api/use-customers";
import { useStoreProfile } from "@/features/settings/api/use-store-profile";
import { buildDuesReminderLink } from "@/lib/whatsapp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export function CustomerDetail({ customerId }: { customerId: string }) {
  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: store } = useStoreProfile();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const recordPayment = useRecordCustomerPayment(customerId);

  if (isLoading || !customer) return <Skeleton className="h-96 w-full" />;

  const reminderLink = buildDuesReminderLink({
    phone: customer.phone,
    customerName: customer.name,
    storeName: store?.name ?? "our store",
    balance: customer.currentBalance,
  });

  async function handleRecordPayment() {
    const value = Number(amount);
    if (!value || value <= 0) return;
    await recordPayment.mutateAsync({ amount: value, note });
    setPaymentOpen(false);
    setAmount("");
    setNote("");
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
            {customer.address && <p className="text-sm text-muted-foreground">{customer.address}</p>}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <p className="text-xs text-muted-foreground">Outstanding balance</p>
            <Badge variant={customer.currentBalance > 0 ? "destructive" : "success"} className="text-base">
              {formatCurrency(customer.currentBalance)}
            </Badge>
            <div className="flex gap-2">
              {customer.currentBalance > 0 && (
                <Button asChild variant="outline" size="sm">
                  <a href={reminderLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" /> Remind via WhatsApp
                  </a>
                </Button>
              )}
              <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <IndianRupee className="size-4" /> Record payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record a payment</DialogTitle>
                    <DialogDescription>Reduces {customer.name}&apos;s outstanding balance.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input type="number" min={0} step="0.01" placeholder="Amount received" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleRecordPayment} loading={recordPayment.isPending} disabled={!amount || Number(amount) <= 0}>
                      Save payment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {customer.transactions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
          )}
          {customer.transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <div className="flex items-center gap-3">
                {txn.amount >= 0 ? (
                  <ArrowUpCircle className="size-5 text-destructive" />
                ) : (
                  <ArrowDownCircle className="size-5 text-success" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {txn.type === "credit_sale" ? "Credit sale" : txn.type === "payment" ? "Payment received" : "Adjustment"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(txn.createdAt), "d MMM yyyy, h:mm a")}
                    {txn.note ? ` · ${txn.note}` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${txn.amount >= 0 ? "text-destructive" : "text-success"}`}>
                  {txn.amount >= 0 ? "+" : ""}
                  {formatCurrency(txn.amount)}
                </p>
                <p className="text-xs text-muted-foreground">Balance: {formatCurrency(txn.balanceAfter)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
