"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useModulesSettings, useUpdateModulesSettings } from "../api/use-modules";

/**
 * Settings > Modules — lets a tenant see the active business template
 * (`business/registry.ts`) and toggle its optional sidebar modules and AI
 * features on/off. Core modules (Dashboard, Sales, Inventory, ...) are
 * always on and shown read-only. This is the UI half of the "custom"
 * template's whole pitch: everyone gets the same engine, `custom` tenants
 * just start from nothing and opt in here.
 */
export function ModulesSettingsForm() {
  const { data, isLoading } = useModulesSettings();
  const updateModules = useUpdateModulesSettings();

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;

  const liveAiFeatures = data.aiFeatures.filter((f) => f.implemented);
  const upcomingAiFeatures = data.aiFeatures.filter((f) => !f.implemented);

  function toggleModule(id: string, next: boolean) {
    if (!data) return;
    const enabled = new Set(data.templateModules.filter((m) => m.enabled).map((m) => m.id));
    if (next) enabled.add(id);
    else enabled.delete(id);
    updateModules.mutate({ enabledModules: Array.from(enabled) });
  }

  function toggleAiFeature(id: string, next: boolean) {
    if (!data) return;
    const enabled = new Set(data.aiFeatures.filter((f) => f.enabled).map((f) => f.id));
    if (next) enabled.add(id);
    else enabled.delete(id);
    updateModules.mutate({ enabledAiFeatures: Array.from(enabled) });
  }

  // `null` tells the server "use the template's defaults" instead of an explicit list — the way
  // out if a tenant's stored override ever gets out of sync with what the toggles should show.
  function resetModules() {
    updateModules.mutate({ enabledModules: null });
  }
  function resetAiFeatures() {
    updateModules.mutate({ enabledAiFeatures: null });
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Business template</CardTitle>
          <CardDescription>
            Active template: <span className="font-medium text-foreground">{data.templateLabel}</span>. Change it
            from Store settings — it drives which modules and AI features are available below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.coreModules.map((m) => (
              <Badge key={m.id} variant="outline" className="font-normal">
                {m.label} · always on
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Optional modules</CardTitle>
            <CardDescription>Extras contributed by your business template. Toggle off anything you don&apos;t need.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={resetModules} disabled={updateModules.isPending}>
            Reset to defaults
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {data.templateModules.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              This template has no optional modules yet.
            </p>
          )}
          {data.templateModules.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{m.label}</p>
                {m.comingSoon && <Badge variant="outline" className="text-[10px]">Soon</Badge>}
              </div>
              <Switch checked={m.enabled} disabled={m.comingSoon} onCheckedChange={(v) => toggleModule(m.id, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>AI features · Live now</CardTitle>
            <CardDescription>
              These actually change what the app does. Turning one off here turns off that feature everywhere it
              shows up — e.g. Sales Forecast off hides the AI Forecast page&apos;s recommendations.
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={resetAiFeatures} disabled={updateModules.isPending}>
            Reset to defaults
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {liveAiFeatures.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{f.label}</p>
                  <Badge variant="success" className="text-[10px]">Live</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
              <Switch checked={f.enabled} onCheckedChange={(v) => toggleAiFeature(f.id, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-dashed">
        <CardHeader>
          <CardTitle>AI features · Coming soon</CardTitle>
          <CardDescription>
            On the roadmap, not built yet — no model or logic behind these. Toggling records your interest for
            when they ship; it doesn&apos;t change the app today.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border opacity-75">
          {upcomingAiFeatures.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{f.label}</p>
                  <Badge variant="outline" className="text-[10px]">Not wired yet</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{f.description}</p>
              </div>
              <Switch checked={f.enabled} onCheckedChange={(v) => toggleAiFeature(f.id, v)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
