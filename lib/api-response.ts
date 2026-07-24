import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import type { ApiResponse } from "@/types/auth";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status: init ?? 200 });
}

export function fail(error: string, status = 400, fieldErrors?: Record<string, string[]>) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error, fieldErrors },
    { status },
  );
}

export function failFromZod(error: ZodError, status = 422) {
  return fail("Validation failed", status, error.flatten().fieldErrors as Record<string, string[]>);
}

/**
 * Drizzle wraps the real MySQL driver error in `.cause` — the outer
 * error's own `.message` is just `"Failed query: <sql>\nparams: <params>"`,
 * which tells you nothing about *why* it failed. Route handlers that do
 * `fail(error.message, 400)` on a raw caught error end up showing that
 * useless wrapper to the user instead of the actual reason (e.g. a MySQL
 * charset/constraint/enum error). This walks the cause chain to the
 * deepest real error and returns *that* message instead.
 */
export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return "Something went wrong";
  let deepest: Error = error;
  while (deepest.cause instanceof Error) {
    deepest = deepest.cause;
  }
  return deepest.message;
}
