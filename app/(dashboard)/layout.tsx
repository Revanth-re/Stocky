import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { stores } from "@/db/schema";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const store = await db.query.stores.findFirst({ where: eq(stores.id, session.storeId) });
  if (store && store.onboardingStep !== "completed") redirect("/onboarding");

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={session} />
        <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-8">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
