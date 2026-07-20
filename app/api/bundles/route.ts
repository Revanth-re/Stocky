import { NextRequest } from "next/server";
import { bundleSchema } from "@/validators/bundle";
import { listBundles, createBundle } from "@/services/bundle-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const activeOnly = req.nextUrl.searchParams.get("activeOnly") === "true";
  try {
    const session = await requireSession();
    const bundles = await listBundles(session.storeId, activeOnly);
    return ok(bundles);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/bundles GET]", error);
    return fail("Could not load combos", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = bundleSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const id = await createBundle(session.storeId, parsed.data);
    return ok({ id }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/bundles POST]", error);
    return fail("Could not create combo", 500);
  }
}
