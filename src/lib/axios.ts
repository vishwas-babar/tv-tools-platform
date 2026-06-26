import axios from "axios";
import type { FieldErrors } from "@/lib/validation";

export class ApiError extends Error {
  details?: FieldErrors;

  constructor(message: string, details?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}

/**
 * Singleton Axios instance configured with the base URL and common defaults.
 * Import and use this everywhere instead of calling axios directly.
 *
 * Usage:
 *   import { api } from "@/lib/axios";
 *   const { data } = await api.get("/tools");
 */
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

// ─── Response interceptor ────────────────────────────────────────────────────
// Unwrap the `{ success, data, error }` envelope automatically so callers
// receive `response.data` as the actual payload.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const details = data?.details as FieldErrors | undefined;
    const message =
      data?.error ??
      error.message ??
      "Something went wrong";

    return Promise.reject(new ApiError(message, details));
  }
);

export { api };
