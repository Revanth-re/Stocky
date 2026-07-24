"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSidebarNav, type ResolvedNavItem } from "@/lib/nav-config";
import { useLanguage } from "@/lib/i18n/language-context";
import type { BusinessTemplate, UserRole } from "@/db/schema";
import { Badge } from "@/components/ui/badge";

export function Sidebar({
  businessTemplate,
  role,
  enabledModules,
}: {
  businessTemplate: BusinessTemplate;
  role: UserRole;
  enabledModules?: string[] | null;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const nav = getSidebarNav({ businessTemplate, role, enabledModules });

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 px-6 font-semibold">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
          <Package2 className="size-4" />
        </span>
        {t("app.name")}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => (
          <SidebarLink key={item.id} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="m-3 rounded-xl bg-gradient-brand-soft p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{t("sidebar.upgradeTitle")}</p>
        <p className="mt-1">{t("sidebar.upgradeSubtitle")}</p>
      </div>
    </aside>
  );
}

function SidebarLink({ item, pathname }: { item: ResolvedNavItem; pathname: string }) {
  const { t } = useLanguage();
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const label = item.labelKey ? t(item.labelKey) : item.label;

  if (item.comingSoon) {
    return (
      <div
        aria-disabled
        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/60"
      >
        <Icon className="size-4.5 shrink-0" />
        <span className="flex-1 truncate">{label}</span>
        <Badge variant="outline" className="text-[10px]">Soon</Badge>
      </div>
    );
  }

  return (
    <Link
      href={item.href as never}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-gradient-brand text-white shadow-soft"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {label}
    </Link>
  );
}
