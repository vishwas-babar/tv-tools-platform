"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

interface GrantAccessButtonProps {
  subscriptionId: string;
}

export function GrantAccessButton({ subscriptionId }: GrantAccessButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGrantAccess() {
    setLoading(true);
    setError(null);

    try {
      const { data: res } = await api.patch<{ success: boolean; error?: string }>(
        `/subscriptions/${subscriptionId}/activate`
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to grant access");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant access");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleGrantAccess}
        disabled={loading}
        className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Granting..." : "Grant Access"}
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
