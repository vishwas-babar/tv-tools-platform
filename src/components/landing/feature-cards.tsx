import { AnimateOnScroll } from "./animate-on-scroll";
import { BoltIcon, ChartIcon, ClockIcon } from "./icons";

const FEATURES = [
  {
    icon: ChartIcon,
    title: "Premium Indicators",
    description:
      "Professional-grade TradingView indicators built by experienced traders.",
    accent: "from-primary/20 to-primary/5",
    iconColor: "text-primary-light",
    iconBg: "bg-primary/15",
  },
  {
    icon: ClockIcon,
    title: "Flexible Plans",
    description:
      "Choose monthly, quarterly, or yearly subscriptions that fit your needs.",
    accent: "from-warning/20 to-warning/5",
    iconColor: "text-warning",
    iconBg: "bg-warning/15",
  },
  {
    icon: BoltIcon,
    title: "Instant Access",
    description:
      "Get immediate access to your subscribed tools on TradingView after payment.",
    accent: "from-success/20 to-success/5",
    iconColor: "text-success",
    iconBg: "bg-success/15",
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <AnimateOnScroll>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Why Choose Our Platform
          </h2>
          <p className="mt-3 text-foreground-secondary">
            Everything you need to trade smarter on TradingView
          </p>
        </div>
      </AnimateOnScroll>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description, accent, iconColor, iconBg }, i) => (
          <AnimateOnScroll key={title} delay={i * 150}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative">
                <span
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                  {description}
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
