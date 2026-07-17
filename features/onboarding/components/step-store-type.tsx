"use client";
import { useState } from "react";
import { Store, ShoppingCart, Croissant, Pill, Building2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { StoreType } from "@/db/schema";

const STORE_TYPES: { value: StoreType; label: string; icon: typeof Store; description: string }[] = [
  { value: "grocery", label: "Grocery", icon: Store, description: "Daily essentials & packaged goods" },
  { value: "super_market", label: "Super Market", icon: ShoppingCart, description: "Large multi-category store" },
  { value: "bakery", label: "Bakery", icon: Croissant, description: "Breads, cakes & baked goods" },
  { value: "pharmacy", label: "Pharmacy", icon: Pill, description: "Medicines & health products" },
  { value: "general_store", label: "General Store", icon: Building2, description: "Mixed household items" },
];

export function StepStoreType({
  defaultValue,
  onBack,
  onNext,
}: {
  defaultValue?: StoreType;
  onBack: () => void;
  onNext: (value: StoreType) => void;
}) {
  const [selected, setSelected] = useState<StoreType | undefined>(defaultValue);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>What type of store do you run?</CardTitle>
        <CardDescription>We&apos;ll tailor categories and product suggestions to match.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {STORE_TYPES.map(({ value, label, icon: Icon, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-soft",
                selected === value ? "border-primary bg-accent" : "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  selected === value ? "bg-gradient-brand text-white" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-between pt-6">
          <Button type="button" variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button type="button" size="lg" disabled={!selected} onClick={() => selected && onNext(selected)}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
