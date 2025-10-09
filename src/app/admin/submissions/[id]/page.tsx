// app/admin/submissions/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

type ParamsPromise = Promise<{ id: string }>;
type SearchParamsPromise = Promise<Record<string, string | string[] | undefined>>;

export default async function SubmissionDetail(props: {
  params: ParamsPromise;
  searchParams: SearchParamsPromise;
}) {
  // Ensure authenticated
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 👇 FIX: await params + search params
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const sent = searchParams?.sent === "1";

  const submission = await prisma.visitorSubmission.findUnique({
    where: { id },
    include: { estimate: true },
  });

  if (!submission) return notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/admin" className="text-sm text-gray-600">
          &larr; Back
        </Link>

        <h1 className="mt-2 text-2xl font-semibold">
          {submission.fullName}{" "}
          <span className="text-sm text-gray-500">({submission.email})</span>
        </h1>

        {/* ✅ Success note when redirected after sending estimate */}
        {sent && (
          <div className="mt-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
            Estimate saved and client notified.
          </div>
        )}

        <div className="mt-6 grid gap-3 rounded border p-4">
          <div><b>Property Type:</b> {submission.propertyType}</div>
          <div><b>Location:</b> {submission.location}</div>
          <div><b>Plot Size:</b> {submission.plotSize || "-"}</div>
          <div><b>Covered Area:</b> {submission.coveredArea || "-"}</div>
          <div><b>Floors:</b> {submission.floors ?? "-"}</div>
          <div><b>Timeline:</b> {submission.timeline || "-"}</div>
          <div><b>Budget:</b> {submission.budgetRange || "-"}</div>
          <div><b>Notes:</b> {submission.extraNotes || "-"}</div>

          {/* Files list from filesJson, with single-file fallback */}
          {Array.isArray((submission as any).filesJson) && (submission as any).filesJson.length > 0 ? (
            <div>
              <b>Files:</b>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {(submission as any).filesJson.map((f: any, idx: number) => (
                  <li key={idx}>
                    <a
                      className="text-yellow-600 underline"
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {f.name || `File ${idx + 1}`}
                    </a>
                    {typeof f.size === "number" ? (
                      <span className="text-gray-500"> ({(f.size / 1048576).toFixed(2)} MB)</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : submission.fileUrl ? (
            <div>
              <b>File:</b>{" "}
              <a
                className="text-yellow-600 underline"
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
          hasEstimate={!!submission.estimate}
          estimate={submission.estimate || null}
        />
      </div>
    </main>
  );
}

function formatPKR(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

async function EstimateEditor({
  submissionId,
  hasEstimate,
  estimate,
}: {
  submissionId: string;
  hasEstimate: boolean;
  estimate: any;
}) {
  return (
    <form
      action={`/api/estimate/${submissionId}`}
      method="post"
      className="mt-8 rounded border p-4"
    >
      <h2 className="text-xl font-semibold">
        {hasEstimate ? "Update Estimate" : "Add Estimate"}
      </h2>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <span className="text-sm font-medium">Amount (PKR)</span>
          <input
            name="amountPKR"
            type="number"
            min={0}
            required
            defaultValue={estimate?.amountPKR || ""}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Breakdown / Notes</span>
          <textarea
            name="breakdown"
            rows={5}
            className="mt-1 w-full rounded border px-3 py-2"
            defaultValue={estimate?.breakdown || ""}
          />
        </label>
      </div>

      <button className="mt-4 rounded bg-yellow-400 px-4 py-2 font-medium text-gray-900 hover:bg-yellow-300">
        {hasEstimate ? "Save Changes" : "Save & Notify Client"}
      </button>

      {hasEstimate && (
        <p className="mt-2 text-sm text-gray-600">
          Current: {formatPKR(estimate.amountPKR)}
        </p>
      )}
    </form>
  );
}
