"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useUnreadNotificationCount } from "@/features/notifications/api/use-notifications";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import type { SessionUser } from "@/types/auth";

export function Topbar({ user }: { user: SessionUser }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedSearch(query);
  const { data: unreadCount } = useUnreadNotificationCount();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6">
      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, orders, suppliers…"
          className="pl-9"
          aria-label="Search"
        />
        {debouncedQuery ? (
          <p className="absolute left-0 top-full mt-1 text-xs text-muted-foreground">
            Searching for &ldquo;{debouncedQuery}&rdquo;…
          </p>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" asChild aria-label="Notifications" className="relative">
          <Link href="/notifications">
            <Bell className="size-4.5" />
            {!!unreadCount && (
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 h-4.5 min-w-4.5 justify-center rounded-full px-1 text-[10px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Link>
        </Button>
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
