// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    // You said there's only one role that can log in.
    role: "ADMIN";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN";
  }
}
