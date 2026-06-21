import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/landing/animate-on-scroll";
import { BoltIcon, ChartIcon, ShieldIcon, UsersIcon } from "@/components/landing/icons";
import { SITE_LOGO, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn how Akruti Algo helps traders turn real-time data into smarter decisions with clear, accessible trading tools.",
};

const OFFERINGS = [
  {
    icon: ChartIcon,
    title: "Actionable Signals",
    description: "Trading signals across all available timeframes and markets.",
  },
  {
    icon: BoltIcon,
    title: "Alert Automation",
    description: "Custom alert automation via TradingView.",
  },
  {
    icon: ShieldIcon,
    title: "Strategy Tools",
    description: "Strategy building and backtesting with no coding required.",
  },
  {
    icon: UsersIcon,
    title: "Real Support",
    description: "Friendly support to help you optimize faster.",
  },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 landing-grid" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-4 py-16 lg:py-24">
        <AnimateOnScroll>
          <div className="flex flex-col items-center text-center">
            <Image
              src={SITE_LOGO}
              alt={SITE_NAME}
              width={72}
              height={72}
              className="h-16 w-16 rounded-full object-cover shadow-lg shadow-primary/20"
            />
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              About Us
            </h1>
            <p className="mt-3 text-lg text-primary-light">{SITE_NAME}</p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="mt-12 space-y-6 text-base leading-relaxed text-foreground-secondary">
            <p>
              At Akruti Algo, we help traders turn real-time data into smarter
              decisions without false promises or unnecessary complexity. Built by
              a small team of traders and developers, Akruti Algo was created to
              make advanced trading tools clear, accessible, and practical for
              everyone, from beginners to professionals.
            </p>
            <p>
              Frustrated by overpriced indicators that often lag or repaint, we
              developed a system that prioritizes performance, simplicity, and
              transparency. Our trading tools offer actionable trading signals
              across all available timeframes and markets, custom alert automation
              via TradingView, strategy building and backtesting tools that require
              no coding, and friendly support to help users optimize faster.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-10 grid auto-rows-fr gap-4 sm:grid-cols-2">
          {OFFERINGS.map(({ icon: Icon, title, description }, i) => (
            <AnimateOnScroll key={title} delay={150 + i * 80} className="flex h-full">
              <div className="flex w-full flex-1 flex-col rounded-2xl border border-white/10 bg-surface/50 p-5 backdrop-blur-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary-light">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-semibold text-foreground">{title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground-muted">
                  {description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={200}>
          <div className="mt-12 space-y-6 text-base leading-relaxed text-foreground-secondary">
            <p>
              Our users include individual traders, prop firms, and strategy
              testers who rely on Akruti Algo to stay ahead in fast-moving
              markets. We don&apos;t believe in shortcuts or secret formulas —
              just smart tools, consistent signals, and real support to help you
              trade with confidence.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={250}>
          <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-surface/50 to-accent-purple/10 px-8 py-10 text-center">
            <p className="text-xl font-semibold text-foreground sm:text-2xl">
              Akruti Algo is your edge in the market.
            </p>
            <Link
              href="/tools"
              className="mt-6 inline-flex rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:scale-[1.02]"
            >
              Explore Our Tools
            </Link>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
