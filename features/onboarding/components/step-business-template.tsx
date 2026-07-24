"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listBusinessTemplates } from "@/business/registry";
import type { BusinessTemplate } from "@/db/schema";

const TEMPLATES = listBusinessTemplates();

/**
 * The onboarding step that picks the tenant's business template — the one
 * decision that drives the whole config-driven engine (sidebar, dashboard
 * widgets, product fields, AI features; see `business/registry.ts`).
 * Sourced entirely from the registry, so a 13th template shows up here
 * automatically once it's added there.
 */
export function StepBusinessTemplate({
  defaultValue,
  onBack,
  onNext,
}: {
  defaultValue?: BusinessTemplate;
  onBack: () => void;
  onNext: (value: BusinessTemplate) => void;
}) {
  const [selected, setSelected] = useState<BusinessTemplate | undefined>(defaultValue);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>What kind of business do you run?</CardTitle>
        <CardDescription>
          We&apos;ll tailor the sidebar, dashboard, product fields, and AI features to match. You can fine-tune
          enabled modules later in Settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map(({ id, label, description, icon: Icon, featureTags }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={cn(
                "flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:shadow-soft",
                selected === id ? "border-primary bg-accent" : "border-border bg-card",
              )}
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  selected === id ? "bg-gradient-brand text-white" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {featureTags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                    {tag}
                  </Badge>
                ))}
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
