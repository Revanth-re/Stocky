import { NextRequest } from "next/server";
import { customerSchema } from "@/validators/customer";
import { getCustomerDetail, updateCustomer } from "@/services/customer-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    const customer = await getCustomerDetail(session.storeId, id);
    if (!customer) return fail("Customer not found", 404);
    return ok(customer);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/customers/:id GET]", error);
    return fail("Could not load customer", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    await updateCustomer(session.storeId, id, parsed.data);
    return ok({ id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/customers/:id PATCH]", error);
    return fail("Could not update customer", 500);
  }
}
