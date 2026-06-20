import { z } from "zod";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  tradingViewId: z
    .string()
    .min(1, "TradingView ID is required")
    .max(100, "TradingView ID must be less than 100 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
