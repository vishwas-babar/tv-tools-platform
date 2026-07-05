import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function usesSecureCookies(request: NextRequest) {
  return (
    request.nextUrl.protocol === "https:" ||
    process.env.AUTH_URL?.startsWith("https://") === true
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    // Production uses __Secure-authjs.session-token; dev uses authjs.session-token.
    secureCookie: usesSecureCookies(request),
  });

  const isLoggedIn = !!token;
  const isAdmin = token?.role === "ADMIN";

  // Admin routes: require admin role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Authenticated routes: require login
  const protectedPaths = ["/dashboard", "/profile", "/purchases"];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Checkout page requires login, but post-payment return URLs must stay public
  // because the session cookie can be unavailable right after Cashfree redirects.
  const isCheckoutPage =
    pathname === "/checkout" ||
    (pathname.startsWith("/checkout/") &&
      !pathname.startsWith("/checkout/status") &&
      !pathname.startsWith("/checkout/autopay"));

  if (isCheckoutPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
