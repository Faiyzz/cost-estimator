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
  if (session.user?.role !== "ADMIN") redirect("/");

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
    <div className="space-y-6 text-neutral-100">
      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Submissions" value={total} />
        <KpiCard title="Responded" value={responded} />
        <KpiCard title="Pending" value={pending} tone="warn" />
        <KpiCard title="Response Rate" value={`${responseRate}%`} tone="ok" />
      </section>

      {/* Quick actions */}
      <section className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-100">
            Quick Links
          </h2>
          <div className="flex gap-2">
            <Link
              href="/admin/submissions?status=pending"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-100 hover:bg-neutral-750 hover:bg-neutral-700/60"
            >
              View Pending
            </Link>
            <Link
              href="/admin/submissions"
              className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-300"
            >
              All Submissions
            </Link>
          </div>
        </div>
      </section>

      {/* Recent */}
      <section className="rounded-lg border border-neutral-700 bg-neutral-800">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-neutral-100">
            Recent Submissions
          </h2>
          <Link
            href="/admin/submissions"
            className="text-sm text-amber-300 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-neutral-700">
          {recent.map((s) => (
            <Link
              key={s.id}
              href={`/admin/submissions/${s.id}`}
              className="flex items-center justify-between p-4 hover:bg-neutral-750 hover:bg-neutral-700/40"
            >
              <div>
                <div className="font-medium text-neutral-100">
                  {s.fullName} — {s.propertyType}
                </div>
                <div className="text-sm text-neutral-400">
                  {s.email} · {fmtDate(s.createdAt)}
                </div>
              </div>
              <span
                className={
                  "rounded px-2 py-1 text-xs " +
                  (s.estimate
                    ? "bg-green-900/40 text-green-300 border border-green-700"
                    : "bg-amber-900/40 text-amber-300 border border-amber-700")
                }
              >
                {s.estimate ? "Responded" : "Pending"}
              </span>
            </Link>
          ))}
          {recent.length === 0 && (
            <div className="p-6 text-center text-neutral-400">
              No submissions yet.
            </div>
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
    tone === "ok"
      ? "bg-green-900/30 text-green-300 border-green-700"
      : tone === "warn"
      ? "bg-amber-900/30 text-amber-300 border-amber-700"
      : "bg-neutral-800 text-neutral-100 border-neutral-700";

  return (
    <div className={`rounded-lg border ${toneCls} p-4`}>
      <div className="text-sm text-neutral-400">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
