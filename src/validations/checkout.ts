import { z } from "zod";

export const cartItemsSchema = z
  .array(
    z.object({
      toolId: z.string().min(1),
      planId: z.string().min(1),
    }),
  )
  .min(1, "Cart must have at least one item");

export const checkoutItemsSchema = z.object({
  items: cartItemsSchema,
});

export const checkoutWithCouponSchema = checkoutItemsSchema.extend({
  couponCode: z.string().trim().toUpperCase().optional(),
});

export type CartItemInput = z.infer<typeof cartItemsSchema>[number];
