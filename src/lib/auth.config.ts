import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/validations/auth";

/**
 * Auth.js configuration that can be used in both server and proxy contexts.
 * This file avoids importing Prisma directly so it remains edge-compatible.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Actual authorization logic is handled in auth.ts
        // This is a placeholder that gets overridden
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role as string) ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN";

      // Admin routes
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (!isAdmin) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      // Authenticated routes
      const protectedPaths = ["/dashboard", "/profile", "/purchases"];
      const isProtected = protectedPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
      );
      if (isProtected && !isLoggedIn) return false;

      return true;
    },
  },
};
