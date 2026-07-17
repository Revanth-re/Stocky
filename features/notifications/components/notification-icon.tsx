import { AlertTriangle, Bell, ClipboardList, Receipt, Sparkles, TriangleAlert } from "lucide-react";
import type { NotificationType } from "@/db/schema";

export const NOTIFICATION_ICON: Record<NotificationType, typeof Bell> = {
  low_stock: AlertTriangle,
  critical_stock: TriangleAlert,
  purchase_order: ClipboardList,
  sale: Receipt,
  ai_forecast_ready: Sparkles,
  system_alert: Bell,
};

export const NOTIFICATION_COLOR: Record<NotificationType, string> = {
  low_stock: "text-warning bg-warning/10",
  critical_stock: "text-destructive bg-destructive/10",
  purchase_order: "text-info bg-info/10",
  sale: "text-success bg-success/10",
  ai_forecast_ready: "text-primary bg-accent",
  system_alert: "text-muted-foreground bg-muted",
};
