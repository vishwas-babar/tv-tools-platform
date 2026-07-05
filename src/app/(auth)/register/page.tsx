"use client";

import { useActionState, useState } from "react";
import { registerUser } from "@/actions/auth";
import Link from "next/link";

const inputClassName =
  "mt-1 w-full rounded border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

const emptyFields = {
  name: "",
  email: "",
  password: "",
  tradingViewId: "",
  phone: "",
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, undefined);
  const [fields, setFields] = useState(emptyFields);

  function updateField(field: keyof typeof emptyFields) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">Register</h1>
      <p className="mt-1 text-sm text-foreground-secondary">
        Create an account to start using our trading tools.
      </p>

      {state?.error && (
        <div className="mt-4 rounded border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={fields.name}
            onChange={updateField("name")}
            className={inputClassName}
          />
        </div>

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
            value={fields.email}
            onChange={updateField("email")}
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
            minLength={8}
            value={fields.password}
            onChange={updateField("password")}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="tradingViewId"
            className="block text-sm font-medium text-foreground-secondary"
          >
            TradingView ID
          </label>
          <input
            id="tradingViewId"
            name="tradingViewId"
            type="text"
            required
            value={fields.tradingViewId}
            onChange={updateField("tradingViewId")}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-foreground-secondary"
          >
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            minLength={10}
            maxLength={15}
            placeholder="e.g. 9876543210"
            value={fields.phone}
            onChange={updateField("phone")}
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-foreground-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-light hover:text-primary">
          Login
        </Link>
      </p>
    </>
  );
}
