"use client";

import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SubmissionsFilters({
  initialQ,
  initialStatus,
}: {
  initialQ: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const update = useDebouncedCallback((q: string, status: string) => {
    const params = new URLSearchParams(sp.toString());
    if (q) params.set("q", q);
    else params.delete("q");

    if (status && status !== "all") params.set("status", status);
    else params.delete("status");

    params.delete("page"); // reset pagination on filter change
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        defaultValue={initialQ}
        onChange={(e) => update(e.target.value, (sp.get("status") ?? initialStatus))}
        placeholder="Search name, email, location…"
        className="w-full rounded-md border px-3 py-2 text-sm"
      />
      <select
        defaultValue={initialStatus}
        onChange={(e) => update((sp.get("q") ?? ""), e.target.value)}
        className="w-full rounded-md border px-3 py-2 text-sm sm:w-48"
      >
        <option value="all">All</option>
        <option value="pending">Pending</option>
        <option value="responded">Responded</option>
      </select>
    </div>
  );
}
