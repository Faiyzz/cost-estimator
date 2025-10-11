// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, type User, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { JWT } from "next-auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// app/api/auth/[...nextauth]/route.ts

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // ... your CredentialsProvider stays the same
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "ADMIN";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = "ADMIN";
      }
      return session;
    },

    // ➜ Add this here
    async redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        if (u.pathname.startsWith("/login")) return `${baseUrl}/admin`;
        if (u.origin === baseUrl) return u.toString();
        return `${baseUrl}/admin`;
      } catch {
        if (url.startsWith("/login")) return `${baseUrl}/admin`;
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        return `${baseUrl}/admin`;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
