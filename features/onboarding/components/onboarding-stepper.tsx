import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FULL_STEPS = ["Store Info", "Business Type", "Brands", "Catalog", "Stock"];
const SHORT_STEPS = ["Store Info", "Business Type"];

/**
 * `totalSteps` picks between the full 5-step flow (templates with a seeded
 * catalog — grocery today) and the short 2-step flow (every other
 * template, which onboards straight into an empty catalog).
 */
export function OnboardingStepper({ currentStep, totalSteps = 5 }: { currentStep: number; totalSteps?: number }) {
  const steps = totalSteps <= 2 ? SHORT_STEPS : FULL_STEPS;
  return (
    <div className="mx-auto mb-10 flex w-full max-w-2xl items-center">
      {steps.map((label, index) => {
        const step = index + 1;
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isDone && "bg-gradient-brand text-white",
                  isActive && !isDone && "bg-gradient-brand text-white shadow-elevated",
                  !isActive && !isDone && "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-4" /> : step}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isActive || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {step !== steps.length && (
              <div className={cn("mx-2 h-0.5 flex-1 rounded-full", isDone ? "bg-gradient-brand" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
