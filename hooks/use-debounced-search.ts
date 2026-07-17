"use client";
import { useDebounce } from "./use-debounce";

/** Thin wrapper around useDebounce specifically for search inputs (300ms). */
export function useDebouncedSearch(query: string) {
  return useDebounce(query.trim(), 300);
}
