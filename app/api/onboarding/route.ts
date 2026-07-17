import { NextRequest } from "next/server";
import { completeOnboardingSchema } from "@/validators/onboarding";
import { completeOnboarding } from "@/services/onboarding-service";
import { requireSession } from "@/lib/auth/session";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = completeOnboardingSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const session = await requireSession();
    const result = await completeOnboarding(session.storeId, parsed.data);
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return fail("Not authenticated", 401);
    console.error("[onboarding]", error);
    return fail("Could not complete onboarding. Please try again.", 500);
  }
}
