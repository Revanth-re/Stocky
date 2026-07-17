import { requireSession } from "@/lib/auth/session";
import { getPurchaseOrderDetail } from "@/services/purchase-order-service";
import { ok, fail } from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    const po = await getPurchaseOrderDetail(session.storeId, id);
    if (!po) return fail("Purchase order not found", 404);
    return ok(po);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/purchase-orders/:id GET]", error);
    return fail("Could not load purchase order", 500);
  }
}
