// server component
import AdminShell from "@/components/admin/AdminShell";
import SessionProviders from "@/components/auth/SessionProviders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin | Cost Estimator" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ✅ server-side gate (no loops, no client flashes)
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <SessionProviders session={session}>
      <AdminShell>{children}</AdminShell>
    </SessionProviders>
  );
}
