import { NextRequest } from "next/server";
import { registerSchema } from "@/validators/auth";
import { registerOwner, AuthError } from "@/services/auth-service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const { accessToken, refreshToken } = await registerOwner(parsed.data);
    await setAuthCookies(accessToken, refreshToken);
    return ok({ redirectTo: "/onboarding" }, 201);
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, 409);
    console.error("[auth/register]", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
