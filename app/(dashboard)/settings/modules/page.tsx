import type { Metadata } from "next";
import { ModulesSettingsForm } from "@/features/settings/components/modules-settings-form";

export const metadata: Metadata = { title: "Modules & AI Features" };

export default function ModulesSettingsPage() {
  return <ModulesSettingsForm />;
}
