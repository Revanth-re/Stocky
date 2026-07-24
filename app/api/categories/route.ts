import { NextRequest } from "next/server";
import { categorySchema } from "@/validators/catalog";
import { listCategories, createCategory } from "@/services/catalog-service";
import { getStoreProfile } from "@/services/settings-service";
import { hasSeededCatalog } from "@/business/registry";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    const store = await getStoreProfile(session.storeId);
    const includeGlobal = store?.businessTemplate ? hasSeededCatalog(store.businessTemplate) : false;
    return ok(await listCategories(session.storeId, includeGlobal));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not load categories", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const id = await createCategory(session.storeId, parsed.data);
    return ok({ id }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not create category", 500);
  }
}
