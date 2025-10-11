// components/auth/SessionProviders.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

export default function SessionProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null; // <-- accept session
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
