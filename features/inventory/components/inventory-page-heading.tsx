"use client";
import { useLanguage } from "@/lib/i18n/language-context";

export function InventoryPageHeading() {
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("inventory.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("inventory.subtitle")}</p>
    </div>
  );
}
