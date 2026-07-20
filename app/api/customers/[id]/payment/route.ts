import { NextRequest } from "next/server";
import { recordPaymentSchema } from "@/validators/customer";
import { recordPayment } from "@/services/customer-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = recordPaymentSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await recordPayment(session.storeId, session.id, id, parsed.data);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    if (error instanceof Error && error.message === "Customer not found") return fail(error.message, 404);
    console.error("[api/customers/:id/payment POST]", error);
    return fail("Could not record payment", 500);
  }
}
