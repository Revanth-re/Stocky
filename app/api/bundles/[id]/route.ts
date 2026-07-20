import { NextRequest } from "next/server";
import { bundleSchema } from "@/validators/bundle";
import { getBundleDetail, updateBundle, deleteBundle } from "@/services/bundle-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    const bundle = await getBundleDetail(session.storeId, id);
    if (!bundle) return fail("Combo not found", 404);
    return ok(bundle);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/bundles/:id GET]", error);
    return fail("Could not load combo", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = bundleSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    await updateBundle(session.storeId, id, parsed.data);
    return ok({ id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/bundles/:id PATCH]", error);
    return fail("Could not update combo", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    await deleteBundle(session.storeId, id);
    return ok({ id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/bundles/:id DELETE]", error);
    return fail("Could not delete combo", 500);
  }
}
