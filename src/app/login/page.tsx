"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-white">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all hover:shadow-2xl">
        {/* 🔹 Logo section */}
        <div className="flex flex-col items-center mb-6">
          {/* Replace the src below when you add your logo */}
        <div className="flex flex-col items-center mb-6">
  {/* ✅ Larger, explicit dimensions */}
  <Image
    src="/images/logo.png"
    alt="Company Logo"
    width={240}
    height={240}
    className="mb-3 object-contain drop-shadow-sm"
    priority
  />
  
</div>
          <h1 className="text-2xl font-semibold text-gray-800">Admin Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage client estimates
          </p>
        </div>

        {/* 🔹 Form */}
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            setLoading(true);

            const fd = new FormData(e.currentTarget as HTMLFormElement);
            const email = String(fd.get("email") || "");
            const password = String(fd.get("password") || "");

            const res = await signIn("credentials", {
              email,
              password,
              redirect: true,
              callbackUrl: "/admin",
            });

            if (res?.error) {
              setErr("Invalid email or password");
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@company.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 shadow hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-200 disabled:opacity-70 transition-all"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {err && <p className="mt-2 text-sm text-red-600 text-center">{err}</p>}
        </form>

        {/* 🔹 Footer note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
      </div>
    </main>
  );
}
