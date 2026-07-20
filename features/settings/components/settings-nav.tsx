"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SETTINGS_NAV = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/store", label: "Store" },
  { href: "/settings/users", label: "Users" },
  { href: "/settings/roles", label: "Roles & Permissions" },
  { href: "/settings/suppliers", label: "Suppliers" },
  { href: "/settings/combos", label: "Combos & Offers" },
  { href: "/settings/brands", label: "Brands" },
  { href: "/settings/categories", label: "Categories" },
  { href: "/settings/appearance", label: "Appearance" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/language", label: "Language" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:w-56 lg:flex-col lg:overflow-visible">
      {SETTINGS_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href as never}
          className={cn(
            "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === item.href ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
