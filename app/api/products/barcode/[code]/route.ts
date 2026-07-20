import { NextRequest } from "next/server";
import { getProductByBarcode } from "@/services/product-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail } from "@/lib/api-response";

/** Used by the camera scan-to-add billing flow: exact barcode lookup within the current store. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    const session = await requireSession();
    const product = await getProductByBarcode(session.storeId, decodeURIComponent(code));
    if (!product) return fail("No product found for this barcode", 404);
    return ok(product);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/barcode/:code GET]", error);
    return fail("Could not look up barcode", 500);
  }
}
