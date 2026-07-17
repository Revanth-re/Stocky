import type { UserRole } from "@/db/schema";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string;
  avatarUrl: string | null;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
