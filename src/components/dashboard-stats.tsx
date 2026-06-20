import type { ReactNode } from "react";
import Link from "next/link";

interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-white/10 bg-surface/80 p-5 transition-colors hover:border-primary/20"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground-muted">{stat.label}</p>
            {stat.icon && (
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.accent ?? "bg-surface-elevated text-foreground-muted"}`}
              >
                {stat.icon}
              </span>
            )}
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

interface QuickActionsProps {
  hasSubscriptions: boolean;
}

export function QuickActions({ hasSubscriptions }: QuickActionsProps) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Link
        href="/tools"
        className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-surface/80 p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary-light">
          <ToolsIcon />
        </span>
        <div>
          <p className="font-semibold text-foreground group-hover:text-primary-light">
            Browse Tools
          </p>
          <p className="text-sm text-foreground-muted">
            Explore premium indicators
          </p>
        </div>
      </Link>

      <Link
        href="/purchases"
        className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-surface/80 p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/15 text-success">
          <PurchasesIcon />
        </span>
        <div>
          <p className="font-semibold text-foreground group-hover:text-primary-light">
            {hasSubscriptions ? "My Purchases" : "View Purchases"}
          </p>
          <p className="text-sm text-foreground-muted">
            {hasSubscriptions
              ? "Manage your subscriptions"
              : "No subscriptions yet"}
          </p>
        </div>
      </Link>
    </div>
  );
}

function ToolsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function PurchasesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}
