import { Suspense } from "react";
import { ToolsPageContent } from "./tools-page-content";

function ToolsPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-48 rounded bg-surface-elevated" />
      <div className="mt-2 h-5 w-96 max-w-full rounded bg-surface-elevated" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="h-48 bg-surface-elevated" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-2/3 rounded bg-surface-elevated" />
              <div className="h-4 w-full rounded bg-surface-elevated" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense fallback={<ToolsPageSkeleton />}>
        <ToolsPageContent />
      </Suspense>
    </div>
  );
}
