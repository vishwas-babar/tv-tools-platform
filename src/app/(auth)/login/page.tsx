"use client";

import { useActionState } from "react";
import { loginUser } from "@/actions/auth";
import Link from "next/link";

const inputClassName =
  "mt-1 w-full rounded border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginUser, undefined);

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Login</h1>
      <p className="mt-1 text-sm text-foreground-secondary">
        Sign in to your account to access your tools.
      </p>

      {state?.error && (
        <div className="mt-4 rounded border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-foreground-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary-light hover:text-primary">
          Register
        </Link>
      </p>
    </>
  );
}
