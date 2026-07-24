"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMobileNav, type ResolvedNavItem } from "@/lib/nav-config";
import { useLanguage } from "@/lib/i18n/language-context";
import type { UserRole } from "@/db/schema";

export function MobileBottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const nav = getMobileNav({ role });
  const leftItems = nav.slice(0, 2);
  const rightItems = nav.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <div className="relative flex items-center justify-between px-2 py-2">
        <div className="flex flex-1 justify-around">
          {leftItems.map((item) => (
            <NavLink key={item.id} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </div>

        <Link
          href="/sales/new"
          aria-label="Quick action"
          className="mx-2 -mt-8 flex size-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-elevated active:scale-95"
        >
          <Plus className="size-6" />
        </Link>

        <div className="flex flex-1 justify-around">
          {rightItems.map((item) => (
            <NavLink key={item.id} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ item, active }: { item: ResolvedNavItem; active: boolean }) {
  const Icon = item.icon;
  const { t } = useLanguage();
  const label = item.labelKey ? t(item.labelKey) : item.label;
  return (
    <Link
      href={item.href as never}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("size-5", active && "fill-accent")} />
      {label}
    </Link>
  );
}
