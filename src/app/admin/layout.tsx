// app/admin/layout.tsx
import AdminShell from "@/components/admin/AdminShell";
import SessionProviders from "@/components/auth/SessionProviders";

export const metadata = {
  title: "Admin | Cost Estimator",
};

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <SessionProviders>
      <AdminShell>{children}</AdminShell>
    </SessionProviders>
  );
}
