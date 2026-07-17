import type { Metadata } from "next";
import Link from "next/link";
import {
  IndianRupee,
  TrendingUp,
  Receipt,
  Boxes,
  Rocket,
  TrendingDown,
  Ghost,
  PieChart,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reports" };

const REPORTS = [
  { type: "revenue", label: "Revenue", description: "Daily revenue trends", icon: IndianRupee },
  { type: "profit", label: "Profit", description: "Estimated gross profit", icon: TrendingUp },
  { type: "sales", label: "Sales", description: "All recorded transactions", icon: Receipt },
  { type: "inventory", label: "Inventory", description: "Current stock valuation", icon: Boxes },
  { type: "fast-moving", label: "Fast Moving Products", description: "Best sellers by velocity", icon: Rocket },
  { type: "slow-moving", label: "Slow Moving Products", description: "Products losing momentum", icon: TrendingDown },
  { type: "dead-stock", label: "Dead Stock", description: "No sales in 60+ days", icon: Ghost },
  { type: "category-performance", label: "Category Performance", description: "Revenue by category", icon: PieChart },
] as const;

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">Deep-dive into how your store is performing.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map(({ type, label, description, icon: Icon }) => (
          <Link key={type} href={`/reports/${type}` as never}>
            <Card className="h-full rounded-2xl transition-shadow hover:shadow-elevated">
              <CardContent className="flex items-center gap-4 p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-brand-soft text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
