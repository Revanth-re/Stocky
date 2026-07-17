import { NextRequest } from "next/server";
import { listCatalogForBrands } from "@/services/onboarding-service";
import { ok } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const brandsParam = req.nextUrl.searchParams.get("brands") ?? "";
  const brandSlugs = brandsParam.split(",").map((s) => s.trim()).filter(Boolean);
  return ok(listCatalogForBrands(brandSlugs));
}
