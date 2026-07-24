/**
 * @deprecated Replaced by `step-business-template.tsx`, which offers all
 * 12 business templates from the config-driven registry (`business/registry.ts`)
 * instead of 5 hardcoded grocery sub-types. Kept only as a re-export so any
 * stale import doesn't hard-fail the build; safe to delete once nothing
 * references it.
 */
export { StepBusinessTemplate as StepStoreType } from "./step-business-template";
