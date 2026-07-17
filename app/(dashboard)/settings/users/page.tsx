import type { Metadata } from "next";
import { UsersList } from "@/features/settings/components/users-list";

export const metadata: Metadata = { title: "Team Settings" };

export default function UsersSettingsPage() {
  return <UsersList />;
}
