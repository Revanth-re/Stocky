import Link from "next/link";
import { Package2, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 lg:p-12">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
            <Package2 className="size-5" />
          </span>
          Kirana AI
        </Link>

        <div className="mx-auto w-full max-w-sm">{children}</div>

        <p className="text-center text-xs text-muted-foreground lg:text-left">
          © {new Date().getFullYear()} Kirana AI. All rights reserved.
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-brand lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
        <div className="relative flex h-full flex-col justify-center gap-6 p-16 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="size-3.5" /> AI Reorder Recommendations
          </span>
          <h2 className="text-4xl font-semibold leading-tight">
            Run your Kirana store like an enterprise, without the complexity.
          </h2>
          <p className="max-w-md text-white/80">
            Track inventory, sales, and purchase orders in one place — and let AI tell you exactly
            what to reorder, before you run out.
          </p>
        </div>
      </div>
    </div>
  );
}
