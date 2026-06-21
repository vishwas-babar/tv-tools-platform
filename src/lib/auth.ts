import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth";
import "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const passwordMatch = await bcryptjs.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
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
      if (token.id) {
        const user = await prisma.user.findUnique({
          where: { id: token.id },
          select: { name: true, email: true, role: true },
        });
        if (user) {
          session.user.id = token.id;
          session.user.role = user.role;
          session.user.name = user.name;
          session.user.email = user.email;
          return session;
        }
      }
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
