import { requireSession } from "@/lib/auth/session";
import { getSaleDetail } from "@/services/sale-service";
import { ok, fail } from "@/lib/api-response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    const sale = await getSaleDetail(session.storeId, id);
    if (!sale) return fail("Sale not found", 404);
    return ok(sale);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/sales/:id GET]", error);
    return fail("Could not load sale", 500);
  }
}
