import { NextRequest } from "next/server";
import { productSchema } from "@/validators/product";
import { getProductDetail, updateProduct, deleteProduct } from "@/services/product-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    const product = await getProductDetail(session.storeId, id);
    if (!product) return fail("Product not found", 404);
    return ok(product);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id GET]", error);
    return fail("Could not load product", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    await updateProduct(session.storeId, session.id, id, parsed.data);
    return ok({ id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id PATCH]", error);
    return fail("Could not update product", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    await deleteProduct(session.storeId, session.id, id);
    return ok({ id });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id DELETE]", error);
    return fail("Could not delete product", 500);
  }
}
