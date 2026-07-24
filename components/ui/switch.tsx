"use client";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        // Unchecked state used to be `bg-muted` (near-white on a white card — effectively
        // invisible) with no border to compensate. Checked state used to be the diagonal brand
        // gradient, which reads as "faint" at this size — a solid, saturated violet with a matching
        // ring reads as unambiguously "on" at a glance, which is the actual job of a toggle.
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors data-[state=checked]:border-transparent data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_0_3px_rgba(109,74,255,0.25)] data-[state=unchecked]:border-border data-[state=unchecked]:bg-slate-300 dark:data-[state=unchecked]:bg-slate-600",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
