import { z } from "zod";

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(50, "Code must be less than 50 characters")
    .toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    message: "Discount type is required",
  }),
  discountValue: z
    .number()
    .min(0, "Discount value must be non-negative")
    .max(99999, "Discount value must be reasonable"),
  active: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;
