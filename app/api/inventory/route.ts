import { NextRequest } from "next/server";
import { productListQuerySchema } from "@/validators/product";
import { listProducts } from "@/services/product-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

/** Stock-centric view over products — same underlying data as /api/products, filterable by stock status. */
export async function GET(req: NextRequest) {
  const parsed = productListQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await listProducts(session.storeId, parsed.data);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/inventory GET]", error);
    return fail("Could not load inventory", 500);
  }
}
