"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  X,
  LayoutGrid,
  ClipboardList,
  LogOut,
  User2,
  Database,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Submissions", href: "/admin/submissions", icon: ClipboardList },
] as const;

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const activeIdx = useMemo(
    () =>
      NAV.findIndex((n) =>
        n.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(n.href)
      ),
    [pathname]
  );

  const email = session?.user?.email ?? "admin";
  const role =
    (session?.user?.role as "ADMIN" | "EMPLOYEE" | "CLIENT" | undefined) ??
    "ADMIN";

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-gray-200">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111111]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-gray-300 hover:text-black hover:bg-yellow-400 transition-colors md:hidden"
              onClick={() => setOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link
              href="/admin"
              className="group flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="h-10 w-auto md:h-12 object-contain"
                priority
              />
              <span className="text-[13px] md:text-sm font-semibold tracking-wide leading-none text-gray-200 group-hover:text-yellow-400 transition-colors">
                Admin <span className="text-yellow-400">Console</span>
              </span>
            </Link>
          </div>

          {/* Right side: user info + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-white/10 bg-[#0F0F0F] px-2 py-1.5">
              <User2 size={16} className="text-gray-400" />
              <span className="text-xs text-gray-300">{email}</span>
              <span className="mx-1.5 text-gray-600">•</span>
              <span className="rounded border border-yellow-400/25 bg-yellow-300/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-300">
                {role}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-md bg-yellow-400 px-3 py-2 text-sm font-medium text-black hover:bg-yellow-300 hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-16 left-0 z-30 w-60 transform bg-[#111111] p-3 shadow-lg shadow-black/40 transition-transform duration-200 md:static md:w-[240px] md:transform-none md:shadow-none md:sticky md:top-16 md:self-start md:h-[calc(100vh-64px)] md:overflow-y-auto md:border-r md:border-white/10",
            open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="space-y-1">
            {NAV.map((item, i) => {
              const Icon = item.icon;
              const active = i === activeIdx;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400",
                    active
                      ? "bg-yellow-400 text-black"
                      : "text-gray-300 hover:bg-yellow-400 hover:text-black"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Icon
                    size={16}
                    className={clsx(
                      active
                        ? "text-black"
                        : "text-gray-400 group-hover:text-black"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="mt-4 rounded-md border border-white/10 bg-[#0D0D0D] p-3">
              <div className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <Database size={14} /> Status
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Neon DB{" "}
                <span className="rounded border border-green-400/20 bg-green-300/10 px-1.5 py-0.5 text-green-300">
                  Connected
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Blob{" "}
                <span className="rounded border border-green-400/20 bg-green-300/10 px-1.5 py-0.5 text-green-300">
                  OK
                </span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="min-h-[calc(100vh-64px)] bg-[#0D0D0D]">
          <div className="mx-auto max-w-7xl p-4 md:p-6 text-gray-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
