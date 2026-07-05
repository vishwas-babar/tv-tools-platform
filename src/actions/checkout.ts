"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function restoreCheckoutSession(orderId: string, token: string) {
  if (!orderId || !token) {
    return { success: false as const, error: "Missing checkout return credentials" };
  }

  try {
    await signIn("checkout-return", {
      orderId,
      token,
      redirect: false,
    });
    return { success: true as const };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: "Failed to restore session" };
    }
    throw error;
  }
}
