import { NextRequest } from "next/server";
import { upsertSettingSchema } from "@/validators/settings";
import { listSettingsByCategory, upsertSetting } from "@/services/settings-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  if (!category) return fail("category is required", 400);

  try {
    const session = await requireSession();
    return ok(await listSettingsByCategory(session.storeId, category));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not load settings", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = upsertSettingSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    await upsertSetting(session.storeId, parsed.data.category, parsed.data.key, parsed.data.value);
    return ok({ saved: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not save setting", 500);
  }
}
