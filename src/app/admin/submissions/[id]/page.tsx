// app/admin/submissions/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Estimate, VisitorSubmission } from "@prisma/client";

/* ---------- helpers & types ---------- */

type FileItem = {
  url: string;
  name?: string;
  size?: number; // bytes
};

type SubmissionWithEstimate = VisitorSubmission & {
  estimate: Estimate | null;
};

function isFileish(
  v: unknown
): v is { url: unknown; name?: unknown; size?: unknown } {
  return (
    typeof v === "object" &&
    v !== null &&
    "url" in (v as Record<string, unknown>)
  );
}

function coerceFilesJson(value: unknown): FileItem[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(isFileish).map((v) => {
      const item = v as Record<string, unknown>;
      return {
        url: String(item.url ?? ""),
        name: typeof item.name === "string" ? item.name : undefined,
        size: typeof item.size === "number" ? item.size : undefined,
      };
    });
  }

  // If somehow stored as JSON string
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return coerceFilesJson(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

function formatPKR(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

/* ---------- page ---------- */

export default async function SubmissionDetail(props: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Require auth
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = props.params;
  const sent = props.searchParams?.sent === "1";

  const submission = (await prisma.visitorSubmission.findUnique({
    where: { id },
    include: { estimate: true },
  })) as SubmissionWithEstimate | null;

  if (!submission) return notFound();

  const files = coerceFilesJson(
    (submission as unknown as { filesJson?: unknown }).filesJson
  );

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-gray-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/admin"
          className="text-sm text-gray-400 hover:text-amber-300 transition-colors"
        >
          &larr; Back
        </Link>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          {submission.fullName}{" "}
          <span className="text-sm text-gray-400">({submission.email})</span>
        </h1>

        {sent && (
          <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Estimate saved and client notified.
          </div>
        )}

        <div className="mt-6 grid gap-3 rounded-xl border border-slate-800 bg-neutral-900/50 p-4">
          <div>
            <b className="text-gray-300">Property Type:</b>{" "}
            <span className="text-gray-100">{submission.propertyType}</span>
          </div>
          <div>
            <b className="text-gray-300">Location:</b>{" "}
            <span className="text-gray-100">{submission.location}</span>
          </div>
          <div>
            <b className="text-gray-300">Plot Size:</b>{" "}
            <span className="text-gray-100">{submission.plotSize ?? "-"}</span>
          </div>
          <div>
            <b className="text-gray-300">Covered Area:</b>{" "}
            <span className="text-gray-100">
              {submission.coveredArea ?? "-"}
            </span>
          </div>
          <div>
            <b className="text-gray-300">Floors:</b>{" "}
            <span className="text-gray-100">{submission.floors ?? "-"}</span>
          </div>
          <div>
            <b className="text-gray-300">Timeline:</b>{" "}
            <span className="text-gray-100">{submission.timeline ?? "-"}</span>
          </div>
          <div>
            <b className="text-gray-300">Budget:</b>{" "}
            <span className="text-gray-100">
              {submission.budgetRange ?? "-"}
            </span>
          </div>
          <div>
            <b className="text-gray-300">Notes:</b>{" "}
            <span className="text-gray-100">
              {submission.extraNotes ?? "-"}
            </span>
          </div>

          {/* Files */}
          {files.length > 0 ? (
            <div>
              <b className="text-gray-300">Files:</b>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {files.map((f, idx) => (
                  <li key={`${f.url}-${idx}`}>
                    <a
                      className="underline text-amber-300 hover:bg-amber-300 hover:text-black rounded px-0.5 transition-colors"
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {f.name || `File ${idx + 1}`}
                    </a>
                    {typeof f.size === "number" && (
                      <span className="text-gray-400">
                        {" "}
                        ({(f.size / 1048576).toFixed(2)} MB)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : submission.fileUrl ? (
            <div>
              <b className="text-gray-300">File:</b>{" "}
              <a
                className="underline text-amber-300 hover:bg-amber-300 hover:text-black rounded px-0.5 transition-colors"
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {submission.fileName || "View"}
              </a>
            </div>
          ) : null}
        </div>

        <EstimateEditor
          submissionId={submission.id}
          hasEstimate={Boolean(submission.estimate)}
          estimate={submission.estimate}
        />
      </div>
    </main>
  );
}

/* ---------- estimate editor (server component) ---------- */

function EstimateEditor({
  submissionId,
  hasEstimate,
  estimate,
}: {
  submissionId: string;
  hasEstimate: boolean;
  estimate: Estimate | null;
}) {
  return (
    <form
      action={`/api/estimate/${submissionId}`}
      method="post"
      className="mt-8 rounded-xl border border-slate-800 bg-neutral-900/50 p-4"
    >
      <h2 className="text-xl font-semibold text-white">
        {hasEstimate ? "Update Estimate" : "Add Estimate"}
      </h2>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="text-sm font-medium text-gray-300">
            Amount (PKR)
          </span>
          <input
            name="amountPKR"
            type="number"
            min={0}
            required
            defaultValue={estimate?.amountPKR ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-neutral-950 px-3 py-2 text-gray-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            placeholder="e.g. 2500000"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-300">
            Breakdown / Notes
          </span>
          <textarea
            name="breakdown"
            rows={5}
            className="mt-1 w-full rounded-lg border border-slate-800 bg-neutral-950 px-3 py-2 text-gray-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            defaultValue={estimate?.breakdown ?? ""}
            placeholder="Optional details for the client..."
          />
        </label>
      </div>

      <button
        className="mt-4 rounded-lg bg-amber-400 px-4 py-2 font-medium text-gray-900 hover:bg-amber-300 transition-colors"
        type="submit"
      >
        {hasEstimate ? "Save Changes" : "Save & Notify Client"}
      </button>

      {hasEstimate && typeof estimate?.amountPKR === "number" && (
        <p className="mt-2 text-sm text-gray-400">
          Current:{" "}
          <span className="text-gray-100">{formatPKR(estimate.amountPKR)}</span>
        </p>
      )}
    </form>
  );
}
