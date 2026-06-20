export function ToolDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse">
      <div className="mb-8 h-4 w-32 rounded bg-surface-elevated" />

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-10 w-2/3 rounded bg-surface-elevated" />
          <div className="aspect-video rounded-2xl bg-surface-elevated" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-surface-elevated" />
            <div className="h-4 w-full rounded bg-surface-elevated" />
            <div className="h-4 w-full rounded bg-surface-elevated" />
            <div className="h-4 w-3/4 rounded bg-surface-elevated" />
          </div>
          <div className="h-48 rounded-2xl bg-surface-elevated" />
        </div>

        <div className="h-96 rounded-2xl bg-surface-elevated" />
      </div>
    </div>
  );
}
