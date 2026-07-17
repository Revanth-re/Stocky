import { NextRequest } from "next/server";
import { updateUserRoleSchema, updateUserStatusSchema } from "@/validators/settings";
import { updateUserRole, updateUserStatus } from "@/services/user-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  try {
    const session = await requireSession();
    if (session.role !== "owner") return fail("Only the store owner can manage users", 403);

    const roleParsed = updateUserRoleSchema.safeParse(body);
    if (roleParsed.success) {
      await updateUserRole(session.storeId, id, roleParsed.data.role);
      return ok({ id, role: roleParsed.data.role });
    }

    const statusParsed = updateUserStatusSchema.safeParse(body);
    if (statusParsed.success) {
      await updateUserStatus(session.storeId, id, statusParsed.data.isActive);
      return ok({ id, isActive: statusParsed.data.isActive });
    }

    return failFromZod(roleParsed.error!);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not update user", 500);
  }
}
