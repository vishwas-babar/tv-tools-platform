"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/validations/profile";
import { formatValidationError } from "@/lib/validation";
import type { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  _prevState: ActionResponse | undefined,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "You must be logged in" };
  }

  const rawData = {
    name: formData.get("name") as string,
    tradingViewId: formData.get("tradingViewId") as string,
    phone: formData.get("phone") as string,
  };

  const parsed = profileSchema.safeParse(rawData);
  if (!parsed.success) {
    const { error } = formatValidationError(parsed.error);
    return { success: false, error };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true };
}
