import { NextRequest } from "next/server";
import { inviteUserSchema } from "@/validators/settings";
import { listStoreUsers, inviteUser } from "@/services/user-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    return ok(await listStoreUsers(session.storeId));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not load users", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = inviteUserSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    if (session.role !== "owner") return fail("Only the store owner can add users", 403);
    const id = await inviteUser(session.storeId, parsed.data);
    return ok({ id }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not add user", 500);
  }
}
