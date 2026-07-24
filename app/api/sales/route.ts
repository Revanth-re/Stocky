// import { NextRequest } from "next/server";
// import { recordSaleSchema, saleListQuerySchema } from "@/validators/sale";
// import { recordSale, listSales } from "@/services/sale-service";
// import { requireSession } from "@/lib/auth/session";
// import { ok, fail, failFromZod } from "@/lib/api-response";

// export async function GET(req: NextRequest) {
//   const parsed = saleListQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
//   if (!parsed.success) return failFromZod(parsed.error);

//   try {
//     const session = await requireSession();
//     const result = await listSales(session.storeId, parsed.data.page, parsed.data.pageSize);
//     return ok(result);
//   } catch (error) {
//     if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
//     console.error("[api/sales GET]", error);
//     return fail("Could not load sales", 500);
//   }
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json().catch(() => null);
//   const parsed = recordSaleSchema.safeParse(body);
//   if (!parsed.success) return failFromZod(parsed.error);

//   try {
//     const session = await requireSession();
//     const result = await recordSale(session.storeId, session.id, parsed.data);
//     return ok(result, 201);
//   } catch (error) {
//     if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
//     if (error instanceof Error) return fail(error.message, 400);
//     console.error("[api/sales POST]", error);
//     return fail("Could not record sale", 500);
//   }
// }
import { NextRequest } from "next/server";
import { recordSaleSchema, saleListQuerySchema } from "@/validators/sale";
import { recordSale, listSales } from "@/services/sale-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod, describeError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const parsed = saleListQuerySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await listSales(session.storeId, parsed.data.page, parsed.data.pageSize);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/sales GET]", error);
    return fail("Could not load sales", 500);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = recordSaleSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await recordSale(session.storeId, session.id, parsed.data);
    return ok(result, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/sales POST]", error);
    if (error instanceof Error) return fail(describeError(error), 400);
    return fail("Could not record sale", 500);
  }
}