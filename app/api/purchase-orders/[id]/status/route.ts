import { NextRequest } from "next/server";
import { updatePurchaseOrderStatusSchema } from "@/validators/purchase-order";
import { updatePurchaseOrderStatus } from "@/services/purchase-order-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updatePurchaseOrderStatusSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    await updatePurchaseOrderStatus(session.storeId, session.id, id, parsed.data.status, parsed.data.items);
    return ok({ id, status: parsed.data.status });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/purchase-orders/:id/status PATCH]", error);
    return fail("Could not update status", 500);
  }
}
