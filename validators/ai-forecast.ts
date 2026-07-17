import { z } from "zod";

/** Shape we require back from Gemini for each product — validated before anything touches the DB. */
export const geminiForecastItemSchema = z.object({
  productId: z.string(),
  next7DaysUnits: z.number().min(0),
  next30DaysUnits: z.number().min(0),
  marketDemandTrend: z.enum(["rising", "stable", "declining"]),
  confidenceScore: z.number().min(0).max(100),
  reason: z.string().min(1).max(400),
  dailySeries: z
    .array(z.object({ date: z.string(), predictedUnits: z.number().min(0) }))
    .length(7),
});

export const geminiForecastResponseSchema = z.object({
  forecasts: z.array(geminiForecastItemSchema),
});

export type GeminiForecastItem = z.infer<typeof geminiForecastItemSchema>;
