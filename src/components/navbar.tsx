import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { NavbarCartButton } from "@/components/navbar-cart-button";

export async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-gray-900">
          TV Tools Platform
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/tools"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Tools
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Admin
                </Link>
              )}
              <NavbarCartButton />
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
