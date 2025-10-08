import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export const dynamic = "force-dynamic";

export default async function AdminHome() {
const session = await getServerSession(authOptions);
if (!session) redirect("/login");
if ((session.user as any)?.role !== "ADMIN") redirect("/");
  const [total, responded, recent] = await Promise.all([
    prisma.visitorSubmission.count(),
    prisma.visitorSubmission.count({ where: { estimate: { isNot: null } } }),
    prisma.visitorSubmission.findMany({
      include: { estimate: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const pending = total - responded;
  const responseRate = total ? Math.round((responded / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Submissions" value={total} />
        <KpiCard title="Responded" value={responded} />
        <KpiCard title="Pending" value={pending} tone="warn" />
        <KpiCard title="Response Rate" value={`${responseRate}%`} tone="ok" />
      </section>

      {/* Quick actions */}
      <section className="rounded-lg border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Quick Links</h2>
          <div className="flex gap-2">
            <Link
              href="/admin/submissions?status=pending"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              View Pending
            </Link>
            <Link
              href="/admin/submissions"
              className="rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-yellow-300"
            >
              All Submissions
            </Link>
          </div>
        </div>
      </section>

      {/* Recent */}
      <section className="rounded-lg border bg-white">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Recent Submissions</h2>
          <Link href="/admin/submissions" className="text-sm text-yellow-700 hover:underline">
            View all
          </Link>
        </div>

        <div className="divide-y">
          {recent.map((s) => (
            <Link
              key={s.id}
              href={`/admin/submissions/${s.id}`}
              className="flex items-center justify-between p-4 hover:bg-yellow-50"
            >
              <div>
                <div className="font-medium">
                  {s.fullName} — {s.propertyType}
                </div>
                <div className="text-sm text-gray-600">
                  {s.email} · {fmtDate(s.createdAt)}
                </div>
              </div>
              <span
                className={
                  "rounded px-2 py-1 text-xs " +
                  (s.estimate ? "bg-green-100 text-green-800" : "bg-yellow-200 text-gray-900")
                }
              >
                {s.estimate ? "Responded" : "Pending"}
              </span>
            </Link>
          ))}
          {recent.length === 0 && (
            <div className="p-6 text-center text-gray-500">No submissions yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: number | string;
  tone?: "ok" | "warn";
}) {
  const toneCls =
    tone === "ok" ? "bg-green-50 text-green-800 border-green-200" :
    tone === "warn" ? "bg-yellow-50 text-yellow-900 border-yellow-200" :
    "bg-gray-50 text-gray-900 border-gray-200";

  return (
    <div className={`rounded-lg border ${toneCls} p-4`}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
