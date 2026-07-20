import { NextRequest } from "next/server";
import { listProductBatches } from "@/services/product-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await requireSession();
    const batches = await listProductBatches(session.storeId, id);
    return ok(batches);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/products/:id/batches GET]", error);
    return fail("Could not load batches", 500);
  }
}
