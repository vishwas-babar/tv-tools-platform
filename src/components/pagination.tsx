"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      aria-label="Pagination"
    >
      <p className="text-center text-sm text-foreground-muted sm:text-left">
        Page {page} of {totalPages}
        <span className="hidden sm:inline"> · {total} tools</span>
      </p>

      <div className="flex w-full max-w-xs items-center justify-center gap-1 sm:max-w-none sm:justify-end">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>

        <span className="min-w-[2.25rem] rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-foreground sm:hidden">
          {page}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-foreground-muted">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-foreground"
                    : "text-foreground-secondary hover:bg-surface-elevated"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
