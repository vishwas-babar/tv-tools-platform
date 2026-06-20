"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProfile } from "@/actions/profile";

export interface ProfileFormUser {
  name: string;
  email: string;
  tradingViewId: string | null;
  phone: string;
  role: string;
  createdAt: string;
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none";

interface ProfileFormProps {
  user: ProfileFormUser;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
    }
  }, [state?.success]);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-surface/80 p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent-purple text-xl font-bold text-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold text-foreground">{user.name}</h2>
          <p className="truncate text-sm text-foreground-muted">{user.email}</p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              user.role === "ADMIN"
                ? "bg-accent-purple/15 text-accent-purple"
                : "bg-primary/15 text-primary-light"
            }`}
          >
            {user.role}
          </span>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            Edit Profile
          </button>
        )}
      </div>

      {state?.error && (
        <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      {state?.success && !editing && (
        <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
          Profile updated successfully.
        </div>
      )}

      {editing ? (
        <form action={formAction} className="mt-6 space-y-5 rounded-2xl border border-border bg-surface p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground-secondary">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={user.name}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="tradingViewId" className="block text-sm font-medium text-foreground-secondary">
              TradingView ID
            </label>
            <input
              id="tradingViewId"
              name="tradingViewId"
              type="text"
              required
              defaultValue={user.tradingViewId ?? ""}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-foreground-muted">
              Used to grant indicator access on TradingView
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground-secondary">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              minLength={10}
              maxLength={15}
              defaultValue={user.phone}
              className={inputClassName}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-border-subtle px-5 py-2.5 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-muted">
            Account Details
          </h3>
          <dl className="grid gap-5 sm:grid-cols-2">
            <DetailItem label="Full Name" value={user.name} />
            <DetailItem label="Email" value={user.email} />
            <DetailItem
              label="TradingView ID"
              value={user.tradingViewId ?? "Not set"}
            />
            <DetailItem label="Phone" value={user.phone} />
            <DetailItem label="Member Since" value={user.createdAt} />
          </dl>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-foreground-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
