import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          TradingView Tools Platform
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Premium TradingView indicators and tools to enhance your trading
          strategy. Subscribe to the tools you need and get instant access.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/tools"
            className="rounded bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700"
          >
            Browse Tools
          </Link>
          <Link
            href="/register"
            className="rounded border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Premium Indicators
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Professional-grade TradingView indicators built by experienced
            traders.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Flexible Plans
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Choose monthly, quarterly, or yearly subscriptions that fit your
            needs.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Instant Access
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Get immediate access to your subscribed tools on TradingView after
            payment.
          </p>
        </div>
      </div>
    </div>
  );
}
