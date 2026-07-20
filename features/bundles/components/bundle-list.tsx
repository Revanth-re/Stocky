"use client";
import { Pencil, Plus, Trash2, Sparkles } from "lucide-react";
import { useBundles, useDeleteBundle } from "../api/use-bundles";
import { BundleFormDialog } from "./bundle-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export function BundleList() {
  const { data: bundles, isLoading } = useBundles();
  const deleteBundle = useDeleteBundle();

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <BundleFormDialog
          trigger={
            <Button>
              <Plus className="size-4" /> New combo
            </Button>
          }
        />
      </div>

      {bundles?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Sparkles className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No combos yet</p>
          <p className="text-sm text-muted-foreground">Create a festival pack or buy-more-save-more offer.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {bundles?.map((bundle) => (
          <Card key={bundle.id} className="rounded-2xl">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{bundle.name}</p>
                  {bundle.description && <p className="text-xs text-muted-foreground">{bundle.description}</p>}
                </div>
                <Badge variant={bundle.isActive ? "success" : "outline"}>{bundle.isActive ? "Active" : "Inactive"}</Badge>
              </div>

              <ul className="space-y-1 text-sm text-muted-foreground">
                {bundle.items.map((item) => (
                  <li key={item.productId}>
                    {item.quantity} × {item.productName}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <div>
                  <p className="font-semibold">{formatCurrency(bundle.comboPrice)}</p>
                  <p className="text-xs text-muted-foreground">Saves {formatCurrency(bundle.savings)}</p>
                </div>
                <div className="flex gap-1">
                  <BundleFormDialog
                    bundle={bundle}
                    trigger={
                      <Button variant="outline" size="icon">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <Button variant="outline" size="icon" onClick={() => deleteBundle.mutate(bundle.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
