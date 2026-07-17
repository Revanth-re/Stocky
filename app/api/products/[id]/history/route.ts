import { requireSession } from "@/lib/auth/session";
import { getProductHistory } from "@/services/product-history-service";
import { ok, fail } from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    const history = await getProductHistory(session.storeId, id);
    return ok(history);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id/history]", error);
    return fail("Could not load product history", 500);
  }
}
