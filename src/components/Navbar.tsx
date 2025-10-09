"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const ACCENT = "#FFE241";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Blogs", href: "/blogs" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="absolute inset-x-0 top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 pt-4 md:pt-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="RB"
              width={100}
              height={100}
              className="h-full w-full drop-shadow-[0_2px_12px_rgba(0,0,0,.6)]"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "text-sm font-medium transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]",
                    active ? "text-white" : "text-white/90 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* CTA */}
            <Link
              href="/contact"
              className="group relative inline-flex items-center"
              aria-label="Contact Us"
            >
              <span
                className="relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold text-white/90 transition-colors drop-shadow-[0_2px_10px_rgba(0,0,0,.6)]"
                style={{
                  border: `1px solid ${ACCENT}`,
                  background: "transparent",
                }}
              >
                <span className="relative z-10">Contact Us</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-full w-1/1 translate-x-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.9),transparent)] transition-transform duration-700 group-hover:translate-x-[280%]"
                />
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90 md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6 drop-shadow-[0_2px_8px_rgba(0,0,0,.6)]" />
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm md:hidden">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Image
                  src="/images/PNG 1.png"
                  alt="RB"
                  width={50}
                  height={50}
                  className="h-9 w-auto"
                />
              </Link>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="py-6">
              <ul className="space-y-2">
                {navLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={clsx(
                          "block rounded-lg px-3 py-2 text-base hover:text-black",
                          active ? "text-white" : "text-white/90"
                        )}
                        style={{ transition: "all .2s" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = ACCENT;
                          e.currentTarget.style.color = "#000";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = active
                            ? "#fff"
                            : "rgba(255,255,255,0.9)";
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}

                {/* Mobile Projects accordion */}
              </ul>

              <div className="mt-6">
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full px-5 py-2 text-white/90"
                  style={{ border: `1px solid ${ACCENT}` }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}