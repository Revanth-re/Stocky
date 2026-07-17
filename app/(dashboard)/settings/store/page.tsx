import type { Metadata } from "next";
import { StoreSettingsForm } from "@/features/settings/components/store-settings-form";

export const metadata: Metadata = { title: "Store Settings" };

export default function StoreSettingsPage() {
  return <StoreSettingsForm />;
}
