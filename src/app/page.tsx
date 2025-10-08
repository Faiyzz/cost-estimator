"use client";

import { useState } from "react";

export default function EstimatePage() {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Get a Cost Estimate</h1>
        <p className="mt-2 text-sm text-gray-600">
          Answer a few questions and upload a site map or photo.
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true); setErr(null); setOk(null);
            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const res = await fetch("/api/visitor/submit", { method: "POST", body: fd });
            const j = await res.json();
            setPending(false);
            res.ok ? setOk("Submitted! We’ll email you shortly.") : setErr(j?.error || "Failed.");
            if (res.ok) (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <div className="grid gap-4">
            <label className="block">
              <span className="text-sm font-medium">Full Name</span>
              <input name="fullName" required className="mt-1 w-full rounded border px-3 py-2" />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input type="email" name="email" required className="mt-1 w-full rounded border px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Phone</span>
                <input name="phone" className="mt-1 w-full rounded border px-3 py-2" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Property Type</span>
              <select name="propertyType" className="mt-1 w-full rounded border px-3 py-2" required>
                <option value="">Select...</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Location/City</span>
                <input name="location" className="mt-1 w-full rounded border px-3 py-2" required />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Plot Size (e.g. 1 Kanal)</span>
                <input name="plotSize" className="mt-1 w-full rounded border px-3 py-2" />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Covered Area (sqft)</span>
                <input name="coveredArea" className="mt-1 w-full rounded border px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Floors</span>
                <input type="number" name="floors" min={0} className="mt-1 w-full rounded border px-3 py-2" />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Timeline</span>
                <input name="timeline" className="mt-1 w-full rounded border px-3 py-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Budget Range</span>
                <input name="budgetRange" className="mt-1 w-full rounded border px-3 py-2" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Additional Notes</span>
              <textarea name="extraNotes" rows={4} className="mt-1 w-full rounded border px-3 py-2" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Upload Map / Image</span>
              <input type="file" name="file" accept="image/*,.pdf" className="mt-1 w-full" />
            </label>

            <button
              disabled={pending}
              className="inline-flex items-center rounded bg-yellow-400 px-4 py-2 font-medium text-gray-900 hover:bg-yellow-300 disabled:opacity-50"
            >
              {pending ? "Submitting..." : "Submit"}
            </button>

            {ok && <p className="text-green-600">{ok}</p>}
            {err && <p className="text-red-600">{err}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}
