import { NextRequest } from "next/server";
import { upsertSupplierPriceSchema } from "@/validators/supplier-price";
import { listSupplierPricesForProduct, upsertSupplierPrice, deleteSupplierPrice } from "@/services/supplier-price-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await requireSession();
    const prices = await listSupplierPricesForProduct(id);
    return ok(prices);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id/supplier-prices GET]", error);
    return fail("Could not load supplier prices", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = upsertSupplierPriceSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    await requireSession();
    await upsertSupplierPrice(id, parsed.data.supplierId, parsed.data.price);
    return ok({ saved: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id/supplier-prices POST]", error);
    return fail("Could not save supplier price", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplierId = req.nextUrl.searchParams.get("supplierId");
  if (!supplierId) return fail("supplierId is required", 400);

  try {
    await requireSession();
    await deleteSupplierPrice(id, supplierId);
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id/supplier-prices DELETE]", error);
    return fail("Could not remove supplier price", 500);
  }
}
