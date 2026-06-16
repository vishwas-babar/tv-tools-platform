"use server";

import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/validations/auth";
import type { ActionResponse } from "@/types";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function registerUser(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    tradingViewId: formData.get("tradingViewId") as string,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError ?? "Validation failed" };
  }

  const { name, email, password, tradingViewId } = parsed.data;

  // Check for duplicate email
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Hash password
  const hashedPassword = await bcryptjs.hash(password, 10);

  // Create user
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      tradingViewId,
      role: "USER",
    },
  });

  // Auto sign-in after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Failed to sign in after registration" };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function loginUser(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError ?? "Validation failed" };
  }

  try {
    await signIn("credentials", {
      email: rawData.email,
      password: rawData.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function logoutUser(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/login");
}
