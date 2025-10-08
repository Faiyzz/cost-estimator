"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, LayoutGrid, ClipboardList, LogOut, User2, Database } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Submissions", href: "/admin/submissions", icon: ClipboardList },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const activeIdx = useMemo(
    () => NAV.findIndex((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href))),
    [pathname]
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border md:hidden"
              onClick={() => setOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Logo" width={28} height={28} className="object-contain" />
              <span className="text-sm font-semibold tracking-wide">
                Admin <span className="text-yellow-500">Console</span>
              </span>
            </Link>
          </div>

          {/* Right side: user */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-md border px-2 py-1.5">
              <User2 size={16} className="text-gray-500" />
              <span className="text-xs text-gray-700">{session?.user?.email ?? "admin"}</span>
              <span className="mx-1.5 text-gray-300">•</span>
              <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800">
                {(session?.user as any)?.role ?? "ADMIN"}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-md bg-yellow-400 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-300"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main area */}
    {/* Main area */}
<div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
  {/* Sidebar: flush to left, sticky on desktop, drawer on mobile */}
  <aside
    className={clsx(
      "hidden md:block md:sticky md:top-14 md:self-start md:h-[calc(100vh-56px)] md:overflow-y-auto md:border-r md:bg-white",
      "fixed inset-y-14 left-0 z-30 w-64 transform bg-white p-3 shadow-lg transition-transform duration-200 md:static md:w-[220px] md:transform-none md:shadow-none",
      open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}
  >
    <nav className="space-y-1">
      {NAV.map((item, i) => {
        const Icon = item.icon;
        const active = i === activeIdx;
        return (
          <Link
            key={item.href + i}
            href={item.href}
            className={clsx(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
              active ? "bg-yellow-100 text-yellow-900" : "text-gray-700 hover:bg-gray-50"
            )}
            onClick={() => setOpen(false)}
          >
            <Icon size={16} className={active ? "text-yellow-700" : "text-gray-500"} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="mt-4 rounded-md border p-3">
        <div className="text-xs font-semibold text-gray-600 flex items-center gap-1">
          <Database size={14} /> Status
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Neon DB <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">Connected</span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Blob <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-700">OK</span>
        </div>
      </div>
    </nav>
  </aside>

  {/* Content */}
    <main className="min-h-[calc(100vh-56px)]">
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      {children}
    </div>
  </main>
</div>

    </div>
  );
}
