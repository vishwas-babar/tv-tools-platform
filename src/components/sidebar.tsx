"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive } from "@/lib/nav";
import { NavIcon, type NavIconName } from "@/components/nav-icons";

export interface SidebarItem {
  href: string;
  label: string;
  icon: NavIconName;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  exactRoots?: string[];
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({
  items,
  title,
  exactRoots = ["/dashboard", "/admin"],
  className = "",
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-64 shrink-0 flex-col border-r border-white/10 bg-surface/50 ${className}`}
    >
      <div className="border-b border-border px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          {title}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href, exactRoots);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary/15 text-primary-light shadow-sm shadow-primary/5"
                  : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-primary/20 text-primary-light"
                    : "bg-surface-elevated text-foreground-muted group-hover:text-foreground-secondary"
                }`}
              >
                <NavIcon name={item.icon} className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
