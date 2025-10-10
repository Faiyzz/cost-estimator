import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SubmissionsFilters from "@/components/admin/SubmissionsFilters";

type VSWhere = NonNullable<
  Parameters<typeof prisma.visitorSubmission.findMany>[0]
>["where"];

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const status = (searchParams.status ?? "all").toLowerCase();
  const page = Math.max(parseInt(searchParams.page ?? "1", 10) || 1, 1);
  const take = 20;
  const skip = (page - 1) * take;

  const where: VSWhere = {};

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { propertyType: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  if (status === "pending") where.estimate = { is: null };
  else if (status === "responded") where.estimate = { isNot: null };

  const [rows, total] = await Promise.all([
    prisma.visitorSubmission.findMany({
      where,
      include: { estimate: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.visitorSubmission.count({ where }),
  ]);

  const pages = Math.max(Math.ceil(total / take), 1);

  return (
    <div className="space-y-4 text-neutral-100">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Submissions</h1>
        <span className="text-sm text-neutral-400">{total} total</span>
      </div>

      <SubmissionsFilters initialQ={q} initialStatus={status} />

      <div className="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1.5fr_1fr_100px] bg-neutral-900/40 px-4 py-2 text-sm font-medium text-neutral-400">
          <div>Name / Email</div>
          <div>Property</div>
          <div>Location</div>
          <div>Created</div>
          <div>Status</div>
        </div>

        <ul className="divide-y divide-neutral-700">
          {rows.map((s) => (
            <li key={s.id} className="p-4 hover:bg-neutral-700/40">
              <Link
                href={`/admin/submissions/${s.id}`}
                className="grid gap-2 md:grid-cols-[2fr_1fr_1.5fr_1fr_100px] md:items-center"
              >
                <div>
                  <div className="font-medium text-neutral-100">
                    {s.fullName}
                  </div>
                  <div className="text-sm text-neutral-400">{s.email}</div>
                </div>
                <div className="text-sm text-neutral-200">{s.propertyType}</div>
                <div className="text-sm text-neutral-200">{s.location}</div>
                <div className="text-sm text-neutral-400">
                  {fmtDate(s.createdAt)}
                </div>
                <div>
                  <span
                    className={
                      "rounded border px-2 py-1 text-xs " +
                      (s.estimate
                        ? "bg-green-900/40 text-green-300 border-green-700"
                        : "bg-amber-900/40 text-amber-300 border-amber-700")
                    }
                  >
                    {s.estimate ? "Responded" : "Pending"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="p-6 text-center text-neutral-400">No results.</li>
          )}
        </ul>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <PageBtn
          label="Prev"
          page={page - 1}
          disabled={page <= 1}
          q={q}
          status={status}
        />
        <span className="text-sm text-neutral-400">
          Page {page} of {pages}
        </span>
        <PageBtn
          label="Next"
          page={page + 1}
          disabled={page >= pages}
          q={q}
          status={status}
        />
      </div>
    </div>
  );
}

function PageBtn({
  label,
  page,
  disabled,
  q,
  status,
}: {
  label: string;
  page: number;
  disabled: boolean;
  q: string;
  status: string;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  params.set("page", String(Math.max(page, 1)));

  return (
    <Link
      aria-disabled={disabled}
      href={`/admin/submissions?${params.toString()}`}
      className={`rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-100 ${
        disabled ? "pointer-events-none opacity-40" : "hover:bg-neutral-700/60"
      }`}
    >
      {label}
    </Link>
  );
}
