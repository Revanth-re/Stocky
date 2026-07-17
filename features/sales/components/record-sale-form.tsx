"use client";
import { useMemo, useState } from "react";
import { Wallet, Smartphone, CreditCard } from "lucide-react";
import { ProductPicker } from "./product-picker";
import { SaleCart } from "./sale-cart";
import { useRecordSale } from "../api/use-sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProductListRow } from "@/types/product";
import type { PaymentMethod } from "@/db/schema";

export type CartLine = {
  productId: string;
  name: string;
  sellingPrice: number;
  currentStock: number;
  quantity: number;
  discountAmount: number;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Wallet }[] = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
];

export function RecordSaleForm() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const recordSale = useRecordSale();

  const total = useMemo(
    () => lines.reduce((sum, line) => sum + Math.max(0, line.sellingPrice * line.quantity - line.discountAmount), 0),
    [lines],
  );

  function addProduct(product: ProductListRow) {
    setLines((prev) => {
      if (prev.some((l) => l.productId === product.id)) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sellingPrice: product.sellingPrice,
          currentStock: product.currentStock,
          quantity: 1,
          discountAmount: 0,
        },
      ];
    });
  }

  function updateLine(productId: string, patch: Partial<CartLine>) {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l)));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function handleSubmit() {
    recordSale.mutate({
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, discountAmount: l.discountAmount })),
      paymentMethod,
      customerName,
      customerPhone,
    });
  }

  return (
    <div className="space-y-6 pb-28">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductPicker onSelect={addProduct} />
          <SaleCart lines={lines} onUpdateLine={updateLine} onRemoveLine={removeLine} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 py-4 transition-colors",
                  paymentMethod === value ? "border-primary bg-accent" : "border-border",
                )}
              >
                <Icon className="size-5" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Input placeholder="Customer phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-4 backdrop-blur lg:bottom-0 lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-2">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-semibold">{formatCurrency(total)}</p>
          </div>
          <Button size="lg" disabled={lines.length === 0} loading={recordSale.isPending} onClick={handleSubmit}>
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
