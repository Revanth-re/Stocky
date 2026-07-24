"use client";
import type { Control } from "react-hook-form";
import type { ProductInput } from "@/validators/product";
import type { ProductFieldDescriptor } from "@/business/types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

/**
 * Renders one input per `ProductFieldDescriptor` from the active business
 * template (`business/registry.ts`), bound to `customFields.<key>` on the
 * product form. This is the whole point of the dynamic-fields system
 * (PRD: "Dynamic Product Fields") — a new vertical adds descriptors to its
 * config, not a new form component or a schema migration.
 */
export function DynamicProductFields({
  control,
  fields,
  templateLabel,
}: {
  control: Control<ProductInput>;
  fields: ProductFieldDescriptor[];
  /** Active business template's display label (e.g. "Fashion & Footwear"), used in the section heading. */
  templateLabel?: string;
}) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-4 rounded-xl border border-primary/20 bg-accent/40 p-4">
      <p className="text-sm font-medium text-foreground">
        {templateLabel ? `${templateLabel} details` : "Template fields"}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((descriptor) => (
          <DynamicField key={descriptor.key} control={control} descriptor={descriptor} />
        ))}
      </div>
    </div>
  );
}

function DynamicField({ control, descriptor }: { control: Control<ProductInput>; descriptor: ProductFieldDescriptor }) {
  const name = `customFields.${descriptor.key}` as never;

  if (descriptor.type === "boolean") {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3">
            <div>
              <FormLabel className="text-sm font-normal">{descriptor.label}</FormLabel>
              {descriptor.helpText && <FormDescription>{descriptor.helpText}</FormDescription>}
            </div>
            <FormControl>
              <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    );
  }

  if (descriptor.type === "select") {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{descriptor.label}</FormLabel>
            <Select value={(field.value as string) || undefined} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={descriptor.placeholder ?? `Select ${descriptor.label.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {descriptor.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {descriptor.helpText && <FormDescription>{descriptor.helpText}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {descriptor.label}
            {descriptor.required && <span className="text-destructive"> *</span>}
          </FormLabel>
          <FormControl>
            <Input
              type={descriptor.type === "date" ? "date" : descriptor.type === "number" ? "number" : "text"}
              placeholder={descriptor.placeholder}
              value={(field.value as string | number | null) ?? ""}
              onChange={(e) => field.onChange(descriptor.type === "number" ? e.target.valueAsNumber : e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          {descriptor.helpText && <FormDescription>{descriptor.helpText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
