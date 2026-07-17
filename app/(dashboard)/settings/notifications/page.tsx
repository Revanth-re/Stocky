"use client";
import { useState } from "react";
import { useSaveSetting } from "@/features/settings/api/use-app-setting";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const NOTIFICATION_PREFS = [
  { key: "low_stock", label: "Low stock alerts", description: "When a product drops below its minimum stock." },
  { key: "critical_stock", label: "Critical / out of stock", description: "When a product runs out completely." },
  { key: "purchase_order", label: "Purchase order updates", description: "Order created, received, or cancelled." },
  { key: "sale", label: "Sales activity", description: "Large or unusual sales." },
  { key: "ai_forecast_ready", label: "AI forecast ready", description: "When a new demand forecast is generated." },
  { key: "system_alert", label: "System alerts", description: "Product updates and maintenance notices." },
];

export default function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, true])),
  );
  const saveSetting = useSaveSetting("notifications");

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>Choose which alerts you want to receive.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {NOTIFICATION_PREFS.map((pref) => (
          <div key={pref.key} className="flex items-center justify-between py-4">
            <div>
              <Label className="font-medium">{pref.label}</Label>
              <p className="text-xs text-muted-foreground">{pref.description}</p>
            </div>
            <Switch
              checked={enabled[pref.key]}
              onCheckedChange={(checked) => {
                setEnabled((prev) => ({ ...prev, [pref.key]: checked }));
                saveSetting.mutate({ key: pref.key, value: checked });
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
