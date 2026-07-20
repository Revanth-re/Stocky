"use client";
import { useLanguage } from "@/lib/i18n/language-context";

export function DashboardHeading({ firstName }: { firstName: string }) {
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {t("dashboard.goodMorning")}, {firstName} 👋
      </h1>
      <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
    </div>
  );
}
