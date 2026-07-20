"use client";
import { useMemo, useState } from "react";
import { Wallet, Smartphone, CreditCard, HandCoins, ScanLine } from "lucide-react";
import { ProductPicker } from "./product-picker";
import { SaleCart } from "./sale-cart";
import { BundlePicker } from "./bundle-picker";
import { useRecordSale } from "../api/use-sales";
import { fetchProductByBarcode } from "@/features/inventory/api/use-products";
import { CustomerPicker } from "@/features/customers/components/customer-picker";
import { BarcodeScannerDialog } from "@/components/shared/barcode-scanner-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ProductListRow } from "@/types/product";
import type { PaymentMethod, PricingType } from "@/db/schema";
import type { CustomerListRow } from "@/types/customer";
import type { BundleDTO } from "@/types/bundle";

export type CartLine = {
  productId: string;
  name: string;
  sellingPrice: number;
  currentStock: number;
  pricingType: PricingType;
  unit: string;
  quantity: number;
  discountAmount: number;
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Wallet }[] = [
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "credit", label: "Udhaar", icon: HandCoins },
];

export function RecordSaleForm() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [udhaarCustomer, setUdhaarCustomer] = useState<CustomerListRow | null>(null);
  const [appliedBundle, setAppliedBundle] = useState<BundleDTO | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const recordSale = useRecordSale();

  const itemsTotal = useMemo(
    () => lines.reduce((sum, line) => sum + Math.max(0, line.sellingPrice * line.quantity - line.discountAmount), 0),
    [lines],
  );
  const bundleDiscount = appliedBundle?.savings ?? 0;
  const total = Math.max(0, itemsTotal - bundleDiscount);

  function addProduct(product: ProductListRow, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sellingPrice: product.sellingPrice,
          currentStock: product.currentStock,
          pricingType: product.pricingType,
          unit: product.unit,
          quantity,
          discountAmount: 0,
        },
      ];
    });
  }

  async function handleBarcodeScan(code: string) {
    const product = await fetchProductByBarcode(code);
    if (!product) {
      toast.error(`No product found for barcode ${code}`);
      return;
    }
    if (product.currentStock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    addProduct(product);
    toast.success(`Added ${product.name}`);
  }

  function applyBundle(bundle: BundleDTO) {
    setLines((prev) => {
      let next = [...prev];
      for (const item of bundle.items) {
        const existingIndex = next.findIndex((l) => l.productId === item.productId);
        if (existingIndex >= 0) {
          next = next.map((l, i) => (i === existingIndex ? { ...l, quantity: l.quantity + item.quantity } : l));
        } else {
          next.push({
            productId: item.productId,
            name: item.productName,
            sellingPrice: item.unitPrice,
            currentStock: Infinity,
            pricingType: "unit",
            unit: "pcs",
            quantity: item.quantity,
            discountAmount: 0,
          });
        }
      }
      return next;
    });
    setAppliedBundle(bundle);
  }

  function updateLine(productId: string, patch: Partial<CartLine>) {
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l)));
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function handleSubmit() {
    if (paymentMethod === "credit" && !udhaarCustomer) {
      toast.error("Select a customer for udhaar/credit sales");
      return;
    }
    recordSale.mutate({
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, discountAmount: l.discountAmount })),
      paymentMethod,
      customerName: paymentMethod === "credit" ? udhaarCustomer?.name ?? "" : customerName,
      customerPhone: paymentMethod === "credit" ? udhaarCustomer?.phone ?? "" : customerPhone,
      customerId: paymentMethod === "credit" ? udhaarCustomer?.id ?? "" : "",
      appliedBundleId: appliedBundle?.id ?? "",
      bundleDiscountAmount: bundleDiscount,
    });
  }

  return (
    <div className="space-y-6 pb-28">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => setScannerOpen(true)}>
            <ScanLine className="size-4" /> Scan to Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductPicker onSelect={(p) => addProduct(p)} />
          <BundlePicker applied={appliedBundle} onApply={applyBundle} onClear={() => setAppliedBundle(null)} />
          <SaleCart lines={lines} onUpdateLine={updateLine} onRemoveLine={removeLine} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

          {paymentMethod === "credit" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Book this sale to a customer&apos;s udhaar/khata balance.</p>
              <CustomerPicker value={udhaarCustomer} onSelect={setUdhaarCustomer} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <Input placeholder="Customer phone (optional)" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-4 backdrop-blur lg:bottom-0 lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-2">
          <div>
            {bundleDiscount > 0 && (
              <p className="text-xs text-success">Combo discount -{formatCurrency(bundleDiscount)}</p>
            )}
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-semibold">{formatCurrency(total)}</p>
          </div>
          <Button size="lg" disabled={lines.length === 0} loading={recordSale.isPending} onClick={handleSubmit}>
            Complete Sale
          </Button>
        </div>
      </div>

      <BarcodeScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        continuous
        title="Scan to add products"
        description="Scan each item's barcode to add it to the cart."
        onScan={handleBarcodeScan}
      />
    </div>
  );
}
