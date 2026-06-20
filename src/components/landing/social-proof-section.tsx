"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimateOnScroll } from "./animate-on-scroll";
import { BoltIcon, PlayIcon, ShieldIcon, UsersIcon } from "./icons";

const BENEFITS = [
  {
    icon: BoltIcon,
    title: "Easy to Use",
    desc: "Plug-and-play on TradingView",
    color: "text-accent-purple",
    bg: "bg-accent-purple/15",
  },
  {
    icon: UsersIcon,
    title: "Trusted by Traders",
    desc: "10,000+ active users",
    color: "text-primary-light",
    bg: "bg-primary/15",
  },
  {
    icon: ShieldIcon,
    title: "Regular Updates",
    desc: "Always improving accuracy",
    color: "text-success",
    bg: "bg-success/15",
  },
];

const PAYMENT_LABELS = ["UPI", "VISA", "MC", "RuPay"];

export function SocialProofSection() {
  const [thumbError, setThumbError] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <AnimateOnScroll>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-sm">
          <div className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {/* Video thumbnail */}
            <div className="relative aspect-video lg:aspect-auto">
              {!thumbError ? (
                <Image
                  src="/images/landing/demo-thumbnail.jpg"
                  alt="See the indicator in action"
                  fill
                  className="object-cover"
                  onError={() => setThumbError(true)}
                />
              ) : (
                <div className="flex h-full min-h-[200px] flex-col items-center justify-center bg-surface-elevated p-6">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-danger/20 text-danger">
                    <PlayIcon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">See the indicator in action</p>
                  <p className="mt-1 text-xs text-foreground-muted">Add demo-thumbnail.jpg</p>
                </div>
              )}
              {!thumbError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/50">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-foreground shadow-lg transition-transform hover:scale-110">
                    <PlayIcon className="h-7 w-7" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-foreground">
                Watch Demo
              </div>
            </div>

            {/* Benefits */}
            <div className="flex flex-col justify-center gap-5 p-8">
              {BENEFITS.map(({ icon: Icon, title, desc, color, bg }, i) => (
                <AnimateOnScroll key={title} delay={i * 100}>
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="text-sm text-foreground-muted">{desc}</p>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>

            {/* Payments */}
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <ShieldIcon className="h-8 w-8 text-success" />
              <p className="font-semibold text-foreground">Secure & Safe Payments</p>
              <p className="text-sm text-foreground-muted">
                All major payment methods supported
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {PAYMENT_LABELS.map((label) => (
                  <span
                    key={label}
                    className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-foreground-secondary"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
