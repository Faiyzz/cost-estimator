"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React, { useRef, useState } from "react";
import clsx from "clsx";

type LocalFile = { file: File; id: string };

export default function EstimatePage() {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (list: FileList | File[]) => {
    const next: LocalFile[] = [];
    Array.from(list).forEach((f) => {
      if (!f || f.size === 0) return;
      next.push({ file: f, id: crypto.randomUUID() });
    });
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (

    <main className="min-h-screen bg-black text-white">
      <div
      className=""
      >
        <Navbar/>
      </div>
      <section className="mx-auto max-w-3xl px-6 py-32">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Get a Cost Estimate
          </h1>
          <p className="mt-3 text-zinc-300">
            Answer a few questions and  upload map files. Our team will review and respond.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 shadow-2xl">
          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setPending(true);
              setErr(null);
              setOk(null);

              const formEl = e.currentTarget as HTMLFormElement;
              const fd = new FormData(formEl);

              // Attach multiple files under "files"
              files.forEach(({ file }) => {
                fd.append("files", file);
              });

              const res = await fetch("/api/visitor/submit", {
                method: "POST",
                body: fd,
              });

              const j = await res.json().catch(() => ({}));
              setPending(false);

              if (res.ok) {
                setOk("Submitted! We’ll email you shortly.");
                formEl.reset();
                setFiles([]);
              } else {
                setErr(j?.error || "Submission failed. Please try again.");
              }
            }}
          >
            {/* Contact */}
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Full Name</span>
                <input
                  name="fullName"
                  required
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Jane Doe"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="jane@email.com"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Phone</span>
                <input
                  name="phone"
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="+92 3XX XXXXXXX"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Property Type</span>
                <select
                  name="propertyType"
                  required
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Select…</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Industrial</option>
                </select>
              </label>
            </div>

            {/* Location / Sizing */}
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Location/City</span>
                <input
                  name="location"
                  required
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Lahore"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Plot Size</span>
                <input
                  name="plotSize"
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="1 Kanal"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Covered Area (sqft)</span>
                <input
                  name="coveredArea"
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., 2500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Floors</span>
                <input
                  type="number"
                  min={0}
                  name="floors"
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="2"
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Timeline</span>
                <input
                  name="timeline"
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., 3–4 months"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-200">Budget Range</span>
                <input
                  name="budgetRange"
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="USD "
                />
              </label>
            </div>

            {/* Notes */}
            <label className="block">
              <span className="text-sm font-medium text-zinc-200">Additional Notes</span>
              <textarea
                name="extraNotes"
                rows={4}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-black px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Anything else we should know?"
              />
            </label>

            {/* Files: drag & drop + list */}
            <div>
              <span className="text-sm font-medium text-zinc-200">Upload Files (any format)</span>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
                }}
                className={clsx(
                  "mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
                  dragOver ? "border-yellow-400 bg-yellow-400/10" : "border-zinc-800 bg-zinc-950"
                )}
              >
                <p className="text-zinc-300">
                  Drag & drop files here, or{" "}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="underline decoration-yellow-400 underline-offset-4 hover:opacity-90"
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Up to 10 files • Total &lt;= 200MB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  name="files"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const list = e.currentTarget.files;
                    if (list && list.length) addFiles(list);
                    // keep the input clear so the same file can be reselected if removed
                    e.currentTarget.value = "";
                  }}
                />
              </div>

              {files.length > 0 && (
                <ul className="mt-4 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between px-4 py-3 bg-zinc-900/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {f.file.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-800"
                        aria-label={`Remove ${f.file.name}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                disabled={pending}
                className={clsx(
                  "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition",
                  "bg-yellow-400 text-black hover:bg-yellow-300",
                  pending && "opacity-70 cursor-not-allowed"
                )}
              >
                {pending ? "Submitting…" : "Submit Request"}
              </button>
            </div>

            {ok && <p className="text-green-400">{ok}</p>}
            {err && <p className="text-red-400">{err}</p>}
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          We respect your privacy. Files are stored securely and used only to prepare your estimate.
        </p>
      </section>
      <Footer/>
    </main>
  );
}
