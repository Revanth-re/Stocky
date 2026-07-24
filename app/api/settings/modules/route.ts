import { NextRequest } from "next/server";
import { updateEnabledModulesSchema } from "@/validators/settings";
import { getModulesSettingsView, updateEnabledModules } from "@/services/settings-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

// This is read right after every module/AI-feature toggle save to confirm the new state — it must
// never be served from a cache (Next's route cache or the browser's), or a just-saved toggle can
// appear to silently revert. `requireSession()` (via `cookies()`) already makes this dynamic in
// practice, but this is explicit rather than relying on that side effect.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSession();
    const view = await getModulesSettingsView(session.storeId);
    return ok(view);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not load module settings", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = updateEnabledModulesSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    await updateEnabledModules(session.storeId, parsed.data);
    return ok({ saved: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    // Surface the real reason (e.g. the "no store row matched" stale-session error from
    // `updateEnabledModules`) instead of a generic message — this is exactly the kind of error
    // that was previously silent, making a no-op update look like a successful save.
    return fail(error instanceof Error ? error.message : "Could not update module settings", 500);
  }
}
