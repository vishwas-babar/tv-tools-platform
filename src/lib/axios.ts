import axios from "axios";

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
    const message =
      error.response?.data?.error ??
      error.message ??
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export { api };
