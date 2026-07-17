import { NextRequest } from "next/server";
import { createPurchaseOrderSchema } from "@/validators/purchase-order";
import { createPurchaseOrder, listPurchaseOrders } from "@/services/purchase-order-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
  const pageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? 20);

  try {
    const session = await requireSession();
    const result = await listPurchaseOrders(session.storeId, page, pageSize);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/purchase-orders GET]", error);
    return fail("Could not load purchase orders", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createPurchaseOrderSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await createPurchaseOrder(session.storeId, session.id, parsed.data);
    return ok(result, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/purchase-orders POST]", error);
    return fail("Could not create purchase order", 500);
  }
}
