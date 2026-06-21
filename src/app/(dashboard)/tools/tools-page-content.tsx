"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import { ToolCard } from "@/components/tool-card";
import { Pagination } from "@/components/pagination";

interface ToolPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  planCount: number;
  startingPrice: number | null;
  lowestPlan: ToolPlan | null;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

const searchInputClassName =
  "w-full rounded-lg border border-border-subtle bg-surface-elevated py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none";

function ToolCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface animate-pulse">
      <div className="h-48 bg-surface-elevated" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded bg-surface-elevated" />
        <div className="h-4 w-full rounded bg-surface-elevated" />
        <div className="h-4 w-4/5 rounded bg-surface-elevated" />
        <div className="mt-4 border-t border-border pt-4">
          <div className="h-7 w-24 rounded bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}

export function ToolsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const searchQuery = searchParams.get("search")?.trim() ?? "";

  const [tools, setTools] = useState<Tool[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const fetchTools = useCallback(async (currentPage: number, search: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get<{
        success: boolean;
        data: Tool[];
        pagination: PaginationMeta;
      }>("/tools", {
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          ...(search ? { search } : {}),
        },
      });

      setTools(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tools");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchQuery) return;

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      params.delete("page");

      const query = params.toString();
      router.push(query ? `/tools?${query}` : "/tools", { scroll: false });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchQuery, searchParams, router]);

  useEffect(() => {
    fetchTools(page, searchQuery);
  }, [page, searchQuery, fetchTools]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(newPage));
    }
    const query = params.toString();
    router.push(query ? `/tools?${query}` : "/tools", { scroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleClearSearch() {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `/tools?${query}` : "/tools", { scroll: false });
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">All Tools</h1>
          <p className="mt-2 text-foreground-secondary">
            Browse our collection of premium TradingView indicators and tools.
          </p>
        </div>
        {pagination && !loading && (
          <p className="text-sm text-foreground-muted">
            {pagination.total} tool{pagination.total !== 1 ? "s" : ""}
            {searchQuery ? " found" : " available"}
          </p>
        )}
      </div>

      <div className="relative mt-6 max-w-xl">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
          />
        </svg>
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search tools by name or description..."
          aria-label="Search tools"
          className={searchInputClassName}
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted transition-colors hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-lg border border-danger/30 bg-danger/10 p-4 text-center text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && tools.length === 0 && (
        <p className="mt-8 text-center text-foreground-muted">
          {searchQuery
            ? `No tools found for "${searchQuery}".`
            : "No tools available at the moment."}
        </p>
      )}

      {!loading && !error && tools.length > 0 && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                name={tool.name}
                slug={tool.slug}
                description={tool.description}
                imageUrl={tool.imageUrl}
                isActive={tool.isActive}
                planCount={tool.planCount}
                startingPrice={tool.startingPrice}
                lowestPlan={tool.lowestPlan}
              />
            ))}
          </div>

          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </>
  );
}
