import Link from "next/link";
import { HeroChart } from "./hero-chart";
import {
  BellIcon,
  BoltIcon,
  ChartIcon,
  RocketIcon,
  ShieldIcon,
  SparklesIcon,
} from "./icons";

const HERO_FEATURES = [
  { icon: ChartIcon, label: "High Accuracy" },
  { icon: BoltIcon, label: "Real-time Alerts" },
  { icon: ShieldIcon, label: "Risk Management" },
  { icon: BellIcon, label: "Smart Notifications" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 landing-grid" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 rounded-full bg-accent-purple/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* Left — copy */}
        <div className="animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-light">
            <SparklesIcon className="h-4 w-4" />
            Professional Trading Indicators
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Powerful{" "}
            <span className="bg-gradient-to-r from-primary-light to-accent-purple bg-clip-text text-transparent">
              Indicators.
            </span>
            <br />
            Smarter Decisions.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-foreground-secondary">
            Premium TradingView indicators and tools to enhance your trading
            strategy. Subscribe to the tools you need and get instant access.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2">
            {HERO_FEATURES.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-surface/50 px-3 py-2.5 text-sm text-foreground-secondary animate-fade-in-up"
                style={{ animationDelay: `${200 + i * 100}ms` }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary-light">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </div>
            ))}
          </div>

          <div
            className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <Link
              href="/tools"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-primary/40 hover:scale-[1.02]"
            >
              Browse Indicators
              <RocketIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface/50 px-7 py-3.5 text-sm font-semibold text-foreground-secondary backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface-elevated hover:text-foreground"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right — chart visual */}
        <HeroChart />
      </div>
    </section>
  );
}
