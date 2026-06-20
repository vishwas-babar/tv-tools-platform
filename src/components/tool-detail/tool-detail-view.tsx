import Image from "next/image";
import Link from "next/link";
import { toEmbedUrl } from "@/lib/youtube";
import { PlanSelector } from "./plan-selector";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

export interface ToolDetailData {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  youtubeUrl: string | null;
  isActive: boolean;
  plans: Plan[];
}

interface ToolDetailViewProps {
  tool: ToolDetailData;
}

export function ToolDetailView({ tool }: ToolDetailViewProps) {
  const embedUrl = tool.youtubeUrl ? toEmbedUrl(tool.youtubeUrl) : null;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/tools" className="transition-colors hover:text-foreground">
          Tools
        </Link>
        <span>/</span>
        <span className="text-foreground-secondary">{tool.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {tool.name}
            </h1>
            {tool.isActive ? (
              <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs font-medium text-foreground-muted">
                Inactive
              </span>
            )}
          </div>

          {/* Preview image */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated">
            {tool.imageUrl ? (
              <div className="relative aspect-video w-full">
                <Image
                  src={tool.imageUrl}
                  alt={`${tool.name} preview`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-3 text-foreground-muted">
                <ChartPlaceholderIcon />
                <span className="text-sm">No preview available</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">About this tool</h2>
            <p className="mt-3 text-base leading-relaxed text-foreground-secondary">
              {tool.description}
            </p>
          </div>

          {/* Demo video */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Demo Video</h2>
            {embedUrl ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-lg">
                <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={embedUrl}
                    title={`${tool.name} demo`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-elevated/50 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover text-foreground-muted">
                  <PlayIcon />
                </div>
                <p className="text-sm font-medium text-foreground-secondary">
                  Demo video coming soon
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Check back later for a walkthrough of this indicator
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky pricing sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <PlanSelector
              toolId={tool.id}
              toolName={tool.name}
              plans={tool.plans}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholderIcon() {
  return (
    <svg className="h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
  );
}
