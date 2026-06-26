import type { ZodError, ZodType } from "zod";

export type FieldErrors = Record<string, string[] | undefined>;

export function getZodFieldErrors(error: ZodError): FieldErrors {
  return error.flatten().fieldErrors;
}

export function getFirstZodError(error: ZodError): string {
  const first = Object.values(getZodFieldErrors(error))
    .flat()
    .find(Boolean);
  return first ?? "Validation failed";
}

export function formatValidationError(error: ZodError): {
  error: string;
  details: FieldErrors;
} {
  const details = getZodFieldErrors(error);
  return {
    error: getFirstZodError(error),
    details,
  };
}

export function validateForm<T>(
  schema: ZodType<T>,
  data: unknown,
):
  | { success: true; data: T }
  | { success: false; error: string; details: FieldErrors } {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  return { success: false, ...formatValidationError(parsed.error) };
}

export function getFieldError(
  details: FieldErrors,
  field: string,
): string | undefined {
  return details[field]?.[0];
}
