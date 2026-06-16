import { z } from "zod";

export const planSchema = z.object({
  toolId: z.string().min(1, "Tool ID is required"),
  durationDays: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 day")
    .max(365, "Duration must be less than 365 days"),
  price: z
    .number()
    .min(0, "Price must be non-negative")
    .max(99999, "Price must be reasonable"),
});

export type PlanInput = z.infer<typeof planSchema>;
