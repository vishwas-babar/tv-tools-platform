"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { restoreCheckoutSession } from "@/actions/checkout";

/**
 * Re-establish the login session after returning from Cashfree.
 * Payment gateways redirect through external domains, which can prevent the
 * auth cookie from being sent on the first request back.
 */
export function useRestoreCheckoutSession(
  orderId: string | null,
  returnToken: string | null,
) {
  const router = useRouter();
  const [ready, setReady] = useState(!returnToken);

  useEffect(() => {
    if (!orderId || !returnToken) {
      setReady(true);
      return;
    }

    let cancelled = false;

    restoreCheckoutSession(orderId, returnToken).then((result) => {
      if (cancelled) return;
      if (result.success) {
        router.refresh();
      }
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [orderId, returnToken, router]);

  return ready;
}
