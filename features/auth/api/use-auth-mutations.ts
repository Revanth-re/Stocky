"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/validators/auth";
import type { ApiResponse } from "@/types/auth";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: RegisterInput) => postJson<{ redirectTo: string }>("/api/auth/register", input),
    onSuccess: (data) => {
      toast.success("Account created — let's set up your store");
      router.push(data.redirectTo);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: LoginInput) => postJson<{ redirectTo: string }>("/api/auth/login", input),
    onSuccess: (data) => {
      toast.success("Welcome back!");
      router.push(data.redirectTo);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      postJson<{ message: string }>("/api/auth/forgot-password", input),
    onSuccess: (data) => toast.success(data.message),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      postJson<{ message: string }>("/api/auth/reset-password", input),
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/login");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: () => postJson<{ redirectTo: string }>("/api/auth/logout", {}),
    onSuccess: (data) => router.push(data.redirectTo),
  });
}
