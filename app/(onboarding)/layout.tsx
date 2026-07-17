import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { stores } from "@/db/schema";
import { Package2 } from "lucide-react";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const store = await db.query.stores.findFirst({ where: eq(stores.id, session.storeId) });
  if (store?.onboardingStep === "completed") redirect("/dashboard");

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-card/60 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <Package2 className="size-4" />
          </span>
          Kirana AI Setup
        </div>
      </header>
      <main className="px-4">{children}</main>
    </div>
  );
}
