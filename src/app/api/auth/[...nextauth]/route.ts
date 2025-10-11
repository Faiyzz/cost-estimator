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

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: { email: {}, password: {} },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        // Only ADMINs can sign in to the portal
        if (!user || user.role !== "ADMIN" || !user.email) return null;

        // Password hash stored in VerificationToken with identifier: `pwd:<user.id>`
        const pwd = await prisma.verificationToken.findFirst({
          where: { identifier: `pwd:${user.id}` },
        });
        if (!pwd?.token) return null;

        const ok = await bcrypt.compare(credentials.password, pwd.token);
        if (!ok) return null;

        // Return only the properties that NextAuth expects on User
        const safeUser: User = {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          // do NOT include `role` here to avoid the TS error
        } as User;

        return safeUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        // since only ADMIN can log in, set it directly
        token.role = "ADMIN";
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id ?? "";
        // only ADMIN logs in; keep this assignment simple
        session.user.role = "ADMIN";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
