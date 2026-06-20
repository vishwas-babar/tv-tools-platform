import Image from "next/image";
import Link from "next/link";
import { formatDuration, formatPrice } from "@/lib/format";

interface ToolCardPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

export interface ToolCardProps {
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  planCount: number;
  startingPrice: number | null;
  lowestPlan: ToolCardPlan | null;
}

export function ToolCard({
  name,
  slug,
  description,
  imageUrl,
  isActive,
  planCount,
  startingPrice,
  lowestPlan,
}: ToolCardProps) {
  const hasPlans = planCount > 0 && startingPrice !== null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
      {/* Thumbnail */}
      <Link href={`/tools/${slug}`} className="relative block h-48 overflow-hidden bg-surface-elevated">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} preview`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-foreground-muted">
            <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            <span className="text-xs">No preview</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />

        {isActive && (
          <span className="absolute right-3 top-3 rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
            Active
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/tools/${slug}`}>
          <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary-light">
            {name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-foreground-secondary">
          {description}
        </p>

        {/* Pricing */}
        <div className="mt-4 border-t border-border pt-4">
          {hasPlans ? (
            <div className="flex items-end justify-between gap-3">
              <div>
                {planCount > 1 && (
                  <p className="text-xs text-foreground-muted">Starting from</p>
                )}
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(startingPrice)}
                </p>
                {lowestPlan && (
                  <p className="text-xs text-foreground-muted">
                    {lowestPlan.name} · {formatDuration(lowestPlan.durationDays)}
                    {planCount > 1 && (
                      <span className="ml-1 text-primary-light">
                        · {planCount} plans
                      </span>
                    )}
                  </p>
                )}
              </div>
              <Link
                href={`/tools/${slug}`}
                className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary-hover"
              >
                View
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground-muted">Plans coming soon</p>
              <Link
                href={`/tools/${slug}`}
                className="text-sm font-medium text-primary-light hover:text-primary"
              >
                Details →
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
