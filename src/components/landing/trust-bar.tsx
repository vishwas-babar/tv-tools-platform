import Link from "next/link";
import { AnimateOnScroll } from "./animate-on-scroll";
import { BoltIcon, RocketIcon, ShieldIcon, UsersIcon } from "./icons";

const TRUST_ITEMS = [
  { icon: BoltIcon, label: "Lifetime Access" },
  { icon: ShieldIcon, label: "All Future Updates" },
  { icon: UsersIcon, label: "Trusted & Proven" },
  { icon: RocketIcon, label: "Priority Support" },
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-surface/50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, label }, i) => (
          <AnimateOnScroll key={label} delay={i * 80}>
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-light">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-foreground-secondary">{label}</span>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20">
      <AnimateOnScroll>
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-surface to-accent-purple/10 px-8 py-16 text-center">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-purple/20 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Level Up Your Trading?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground-secondary">
              Join thousands of traders using our premium indicators on TradingView.
              Get started in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/tools"
                className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:scale-[1.02]"
              >
                Browse All Tools
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-white/5"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
