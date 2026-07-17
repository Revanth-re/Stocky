import { NextRequest } from "next/server";
import { salesImportSchema } from "@/validators/sales-import";
import { importSalesHistory } from "@/services/sales-import-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = salesImportSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await importSalesHistory(session.storeId, session.id, parsed.data.rows);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[api/sales/import]", error);
    return fail("Could not import sales history", 500);
  }
}
