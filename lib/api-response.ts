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
