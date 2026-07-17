import { NextRequest } from "next/server";
import { storeProfileSchema } from "@/validators/settings";
import { getStoreProfile, updateStoreProfile } from "@/services/settings-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    return ok(await getStoreProfile(session.storeId));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not load store profile", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = storeProfileSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    await updateStoreProfile(session.storeId, parsed.data);
    return ok({ saved: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not update store profile", 500);
  }
}
