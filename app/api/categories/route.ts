import { NextRequest } from "next/server";
import { categorySchema } from "@/validators/catalog";
import { listCategories, createCategory } from "@/services/catalog-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireSession();
    return ok(await listCategories(session.storeId));
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
