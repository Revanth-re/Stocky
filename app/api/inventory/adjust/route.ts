import { NextRequest } from "next/server";
import { stockAdjustmentSchema } from "@/validators/product";
import { adjustStock } from "@/services/product-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = stockAdjustmentSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const newQuantity = await adjustStock(
      session.storeId,
      session.id,
      parsed.data.productId,
      parsed.data.quantityDelta,
      parsed.data.reason,
    );
    return ok({ newQuantity });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/inventory/adjust POST]", error);
    return fail("Could not adjust stock", 500);
  }
}
