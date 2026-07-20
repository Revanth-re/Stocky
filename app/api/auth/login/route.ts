import { NextRequest } from "next/server";
import { loginSchema } from "@/validators/auth";
import { loginWithPassword, AuthError } from "@/services/auth-service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { ok, fail, failFromZod } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return failFromZod(parsed.error);

  try {
    const { accessToken, refreshToken, rememberMe } = await loginWithPassword(parsed.data);
    await setAuthCookies(accessToken, refreshToken, rememberMe);
    return ok({ redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) return fail(error.message, 401);
    console.error("[auth/login]", error);
    return fail("Something went wrong. Please try again.", 500);
  }
}
