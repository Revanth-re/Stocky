import { NextRequest } from "next/server";
import { brandSchema } from "@/validators/catalog";
import { listBrands, createBrand } from "@/services/catalog-service";
import { getStoreProfile } from "@/services/settings-service";
import { hasSeededCatalog } from "@/business/registry";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    const store = await getStoreProfile(session.storeId);
    const includeGlobal = store?.businessTemplate ? hasSeededCatalog(store.businessTemplate) : false;
    return ok(await listBrands(session.storeId, includeGlobal));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not load brands", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const id = await createBrand(session.storeId, parsed.data);
    return ok({ id }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    return fail("Could not create brand", 500);
  }
}
