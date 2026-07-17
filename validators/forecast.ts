import { z } from "zod";

export const generateForecastSchema = z.object({
  productIds: z.array(z.string()).optional(),
});
export type GenerateForecastInput = z.infer<typeof generateForecastSchema>;

export const forecastQuerySchema = z.object({
  priority: z.enum(["high", "medium", "low"]).optional(),
});
