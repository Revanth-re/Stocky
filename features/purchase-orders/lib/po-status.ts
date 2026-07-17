import type { PurchaseOrderStatus } from "@/db/schema";

export const PO_STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  draft: "Draft",
  ordered: "Ordered",
  received: "Received",
  cancelled: "Cancelled",
};

export const PO_STATUS_BADGE_VARIANT: Record<PurchaseOrderStatus, "outline" | "info" | "success" | "destructive"> = {
  draft: "outline",
  ordered: "info",
  received: "success",
  cancelled: "destructive",
};
