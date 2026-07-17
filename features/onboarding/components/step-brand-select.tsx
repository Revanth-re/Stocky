"use client";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GLOBAL_BRANDS } from "@/lib/catalog/global-catalog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function StepBrandSelect({
  defaultValue,
  onBack,
  onNext,
}: {
  defaultValue: string[];
  onBack: () => void;
  onNext: (brandSlugs: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultValue));

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Which brands do you stock?</CardTitle>
        <CardDescription>Pick the brands you sell — we&apos;ll pre-load their popular products.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GLOBAL_BRANDS.map((brand) => {
            const isSelected = selected.has(brand.slug);
            return (
              <button
                key={brand.slug}
                type="button"
                onClick={() => toggle(brand.slug)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-5 transition-all hover:shadow-soft",
                  isSelected ? "border-primary bg-accent" : "border-border bg-card",
                )}
              >
                {isSelected && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-gradient-brand text-white">
                    <Check className="size-3" />
                  </span>
                )}
                <span
                  className="flex size-12 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: brand.color }}
                >
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-sm font-medium">{brand.name}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between pt-6">
          <Button type="button" variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={selected.size === 0}
            onClick={() => onNext(Array.from(selected))}
          >
            Continue ({selected.size} selected)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
