"use client";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { useCatalogForBrands } from "../api/use-onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function StepCatalogPreview({
  brandSlugs,
  onBack,
  onNext,
}: {
  brandSlugs: string[];
  onBack: () => void;
  onNext: () => void;
}) {
  const { data: catalog, isLoading } = useCatalogForBrands(brandSlugs);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PackageCheck className="size-5 text-primary" />
          <CardTitle>Your catalog is ready</CardTitle>
        </div>
        <CardDescription>
          We&apos;ve auto-populated {catalog?.length ?? "…"} products from your selected brands. You&apos;ll only
          need to add price, stock &amp; supplier next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          {catalog?.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-lg">
                  {product.imageEmoji}
                </span>
                <div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.packSize}</p>
                </div>
              </div>
              <Badge variant="outline">{product.category}</Badge>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-6">
          <Button type="button" variant="ghost" onClick={onBack}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <Button type="button" size="lg" onClick={onNext} disabled={isLoading || !catalog?.length}>
            Looks good, continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
