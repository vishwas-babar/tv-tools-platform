import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
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
