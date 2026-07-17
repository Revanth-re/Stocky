import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { ProfileForm } from "@/features/settings/components/profile-form";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function ProfileSettingsPage() {
  const session = await getSession();
  if (!session) return null;
  return <ProfileForm user={session} />;
}
