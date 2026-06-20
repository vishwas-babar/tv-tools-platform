"use client";

import { useCart } from "@/contexts/cart-context";
import { formatDuration, formatPrice } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, totalAmount, itemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDuration: "200ms" }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-surface shadow-2xl shadow-black/50 animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary-light">
              <CartIcon />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">Your Cart</h2>
              <p className="text-xs text-foreground-muted">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
              <span className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-elevated text-foreground-muted">
                <CartIcon className="h-10 w-10 opacity-50" />
              </span>
              <p className="text-base font-medium text-foreground">Your cart is empty</p>
              <p className="mt-2 max-w-[240px] text-sm text-foreground-muted">
                Browse our premium TradingView indicators and add a plan to get started.
              </p>
              <Link
                href="/tools"
                onClick={onClose}
                className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover"
              >
                Browse Tools
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={`${item.toolId}-${item.planId}`}
                  className="group rounded-xl border border-white/10 bg-surface-elevated/80 p-4 transition-colors hover:border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{item.toolName}</p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        {item.planName} · {formatDuration(item.durationDays)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.toolId, item.planId)}
                      className="shrink-0 rounded-lg p-1.5 text-foreground-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                      aria-label={`Remove ${item.toolName} from cart`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <p className="mt-3 text-lg font-bold text-foreground">
                    {formatPrice(item.price)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface-elevated/50 px-5 py-4">
          {items.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Subtotal</span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-primary/40"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={onClose}
                className="mt-2 w-full rounded-xl py-2.5 text-center text-sm text-foreground-muted transition-colors hover:text-foreground-secondary"
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <p className="text-center text-xs text-foreground-muted">
              Secure checkout powered by Cashfree
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function CartIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}
