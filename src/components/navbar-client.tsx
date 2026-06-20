"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isNavActive } from "@/lib/nav";
import { NavIcon } from "@/components/nav-icons";
import { NavbarCartButton } from "@/components/navbar-cart-button";
import { LogoutButton } from "@/components/logout-button";

interface NavbarClientProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userName?: string | null;
}

interface NavLink {
  href: string;
  label: string;
}

export function NavbarClient({ isLoggedIn, isAdmin, userName }: NavbarClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainLinks: NavLink[] = [{ href: "/tools", label: "Tools" }];

  const authLinks: NavLink[] = isLoggedIn
    ? [
        { href: "/dashboard", label: "Dashboard" },
        ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [];

  const initials = (userName ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function linkClass(href: string) {
    const active = isNavActive(pathname, href, ["/dashboard", "/admin", "/tools"]);
    return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "bg-primary/15 text-primary-light"
        : "text-foreground-secondary hover:bg-surface-elevated hover:text-foreground"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-purple text-foreground shadow-lg shadow-primary/20">
            <NavIcon name="chart" className="h-5 w-5" />
          </span>
          <span className="hidden font-bold text-foreground sm:inline">
            TV Tools Platform
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {mainLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {authLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <NavbarCartButton />
              <Link
                href="/profile"
                className="hidden items-center gap-2.5 rounded-xl border border-border-subtle bg-surface/50 px-2.5 py-1.5 transition-colors hover:border-primary/30 hover:bg-surface-elevated sm:flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-bold text-primary-light">
                  {initials}
                </span>
                <span className="max-w-[120px] truncate text-sm font-medium text-foreground-secondary">
                  {userName ?? "Account"}
                </span>
              </Link>
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className={linkClass("/login")}>
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary-hover"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-foreground-secondary hover:bg-surface-elevated hover:text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface/95 px-4 py-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className={linkClass("/profile")}
                >
                  Profile
                </Link>
                <div className="mt-2 border-t border-border pt-2">
                  <LogoutButton className="w-full justify-start rounded-lg px-3 py-2.5 text-sm hover:bg-surface-elevated" />
                </div>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={linkClass("/login")}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-foreground"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
