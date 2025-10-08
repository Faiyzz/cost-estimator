// middleware.ts (root)
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/:path*"], // only guard admin
};
