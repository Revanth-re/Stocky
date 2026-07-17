import type { Metadata } from "next";
import { ForecastDashboard } from "@/features/forecast/components/forecast-dashboard";

export const metadata: Metadata = { title: "AI Forecast" };

export default function ForecastPage() {
  return <ForecastDashboard />;
}
