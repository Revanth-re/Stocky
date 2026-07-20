import { NextRequest } from "next/server";
import { customerSchema, customerListQuerySchema } from "@/validators/customer";
import { listCustomers, createCustomer } from "@/services/customer-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const parsed = customerListQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await listCustomers(session.storeId, parsed.data);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/customers GET]", error);
    return fail("Could not load customers", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const id = await createCustomer(session.storeId, parsed.data);
    return ok({ id }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/customers POST]", error);
    return fail("Could not add customer", 500);
  }
}
