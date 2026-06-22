"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { isNavActive } from "@/lib/nav";
import type { SidebarItem } from "@/components/sidebar";

interface AppShellProps {
  items: SidebarItem[];
  title: string;
  exactRoots?: string[];
  children: React.ReactNode;
}

export function AppShell({ items, title, exactRoots, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeItem = items.find((item) =>
    isNavActive(pathname, item.href, exactRoots)
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar
        items={items}
        title={title}
        exactRoots={exactRoots}
        className="hidden md:flex"
      />

      {mobileNavOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <Sidebar
            items={items}
            title={title}
            exactRoots={exactRoots}
            onNavigate={() => setMobileNavOpen(false)}
            className="fixed top-16 bottom-0 left-0 z-50 flex w-64 md:hidden"
          />
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b border-border bg-surface/50 px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-expanded={mobileNavOpen}
            aria-label={`Open ${title} menu`}
            className="flex w-full items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30"
          >
            <MenuIcon />
            <span className="text-foreground-muted">{title}</span>
            {activeItem && (
              <>
                <span className="text-foreground-muted">·</span>
                <span className="truncate text-primary-light">{activeItem.label}</span>
              </>
            )}
          </button>
        </div>

        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-foreground-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}
