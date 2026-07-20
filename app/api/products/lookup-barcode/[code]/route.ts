import { NextRequest } from "next/server";
import { lookupBarcodeProduct } from "@/lib/openfoodfacts";
import { requireSession } from "@/lib/auth/session";
import { ok, fail } from "@/lib/api-response";

/** Used by the "Add Product" form: looks up a scanned barcode against OpenFoodFacts to auto-fill name/category/pack size. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    await requireSession();
    const product = await lookupBarcodeProduct(decodeURIComponent(code));
    if (!product) return fail("No product details found for this barcode", 404);
    return ok(product);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/lookup-barcode/:code GET]", error);
    return fail("Could not look up barcode", 500);
  }
}
