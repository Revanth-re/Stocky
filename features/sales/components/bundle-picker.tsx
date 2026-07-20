"use client";
import { Sparkles, X } from "lucide-react";
import { useBundles } from "@/features/bundles/api/use-bundles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { BundleDTO } from "@/types/bundle";

/** Lets the cashier apply a festival/combo offer at billing — shows active combos as tappable chips. */
export function BundlePicker({
  applied,
  onApply,
  onClear,
}: {
  applied: BundleDTO | null;
  onApply: (bundle: BundleDTO) => void;
  onClear: () => void;
}) {
  const { data: bundles, isLoading } = useBundles(true);

  if (isLoading || !bundles || bundles.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" /> Combo offers
      </p>
      <div className="flex flex-wrap gap-2">
        {bundles.map((bundle) => {
          const isApplied = applied?.id === bundle.id;
          return (
            <button
              key={bundle.id}
              type="button"
              onClick={() => (isApplied ? onClear() : onApply(bundle))}
              className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                isApplied ? "border-primary bg-accent" : "border-border hover:border-primary/50"
              }`}
            >
              {bundle.name}
              <Badge variant="outline" className="gap-0.5">
                {formatCurrency(bundle.comboPrice)}
              </Badge>
              {isApplied && <X className="size-3" />}
            </button>
          );
        })}
      </div>
      {applied && (
        <p className="text-xs text-success">
          &quot;{applied.name}&quot; applied — customer saves {formatCurrency(applied.savings)}.{" "}
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onClear}>
            Remove
          </Button>
        </p>
      )}
    </div>
  );
}
