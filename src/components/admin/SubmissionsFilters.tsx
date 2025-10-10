"use client";

import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SubmissionsFilters({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: string; // "all" | "pending" | "responded"
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Always read the *current* values from the URL so the UI stays in sync after navigation
  const q = sp.get("q") ?? initialQ ?? "";
  const status = (sp.get("status") ?? initialStatus ?? "all").toLowerCase();

  const replaceWith = (nextQ: string, nextStatus: string) => {
    const params = new URLSearchParams(sp.toString());
    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");

    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    else params.delete("status");

    params.delete("page"); // reset pagination on filter change
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Debounce only text input; select can be instant
  const updateQ = useDebouncedCallback((nextQ: string) => {
    replaceWith(nextQ, status);
  }, 300);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        value={q}
        onChange={(e) => updateQ(e.target.value)}
        placeholder="Search name, email, location…"
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
      />

      <select
        value={status}
        onChange={(e) => replaceWith(q, e.target.value)}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 sm:w-48 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="responded">Responded</option>
      </select>
    </div>
  );
}
