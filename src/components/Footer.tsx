"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

type LinkItem = { label: string; href: string; external?: boolean };
type CSSVars = React.CSSProperties &
  Record<"--accent" | "--tw-ring-color", string>;

const ACCENT = "#FFE241";

const groups: { heading: string; links: LinkItem[] }[] = [
  {
    heading: "Company",
    links: [
      { label: "Services", href: "/services" },
      { label: "Articles", href: "/blogs" },
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  React.useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("footer [data-animate]")
    );
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("is-inview")
        ),
      { threshold: 0.12 }
    );
    els.forEach((el) => {
      el.classList.add("reveal");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <footer className="bg-neutral-950 text-neutral-300">
      {/* Top grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-10 justify-items-center text-center">
          {/* Brand + blurb + Calendly */}
          <section className="max-w-sm" data-animate>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3"
            >
              <Image
                src="/images/logo.png"
                alt="Ridgeback Builders"
                width={220}
                height={80}
                className="h-19 w-auto"
                priority={false}
              />
            </Link>

            <p className="mt-4 text-sm leading-6 text-neutral-400">
              Design-first construction & remodeling. Premium materials,
              transparent timelines, and craftsmanship that lasts.
            </p>

            <Link
              href="https://calendly.com/ridgebackbuildersinc/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
              style={
                {
                  backgroundColor: ACCENT,
                  color: "#0A0A0A",
                  "--tw-ring-color": ACCENT,
                } as CSSVars
              }
            >
              Book via Calendly
            </Link>
          </section>

          {/* Links (Company) */}
          <LinksColumn g={groups[0]} />

          {/* Social / Get in touch */}
          <section className="max-w-sm" data-animate aria-label="Get in touch">
            <h3 className="text-sm font-semibold tracking-wide text-neutral-200">
              Get in touch
            </h3>

            <div className="mt-4 flex items-center justify-center gap-3">
              <SocialIcon
                label="Instagram"
                href="https://www.instagram.com/ridgebackbuilders/"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5ZM18 6.75a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 18 6.75Z" />
                </svg>
              </SocialIcon>

              <SocialIcon
                label="Facebook"
                href="https://www.facebook.com/p/Ridgeback-Builders-100083112463811/"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.4 22V12.9h3.1l.5-3.6h-3.6V7.1c0-1 .3-1.7 1.8-1.7h1.9V2.1c-1.3-.1-2.4-.1-2.7-.1-2.7 0-4.6 1.6-4.6 4.7v2.6H7.1v3.6h3.1V22h3.2z" />
                </svg>
              </SocialIcon>

              <SocialIcon
                label="YouTube"
                href="https://www.youtube.com/@RidgebackBuilt"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M23 7.2s-.2-1.6-.8-2.3c-.8-.8-1.7-.8-2.2-.9C16.8 3.7 12 3.7 12 3.7s-4.8 0-8 .3c-.5 0-1.4.1-2.2.9C1.2 5.6 1 7.2 1 7.2S.8 9.2.8 11.2v1.6c0 2 .2 4 .2 4s.2 1.6.8 2.3c.8.8 1.9.8 2.4.9 1.8.2 7.8.3 7.8.3s4.8 0 8-.3c.5 0 1.4-.1 2.2-.9.6-.7.8-2.3.8-2.3s.2-2 .2-4V11.2c0-2-.2-4-.2-4zM9.8 14.8V7.9l6.3 3.4-6.3 3.5z" />
                </svg>
              </SocialIcon>
            </div>

            <div className="mt-4 space-y-2 text-sm text-neutral-400">
              <Link
                href="tel:(813) 921-1717"
                className="hover:text-white underline-offset-4 hover:underline"
              >
                (813) 921-1717
              </Link>
              <br />
              <Link
                href="mailto:info@ridgebackbuilt.com"
                className="hover:text-white underline-offset-4 hover:underline"
              >
                info@ridgebackbuilt.com
              </Link>
            </div>
          </section>
        </div>

        {/* Newsletter row */}
        <section className="mt-8" data-animate aria-label="Newsletter">
          <div className="relative overflow-hidden rounded-2xl px-5 sm:px-8">
            <div className="relative mx-auto max-w-3xl text-center">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-50">
                Subscribe to our newsletter
              </h3>
              <NewsletterInline
                ctaText="Subscribe"
                accentColor={ACCENT}
                newsletterApi="/api/newsletter"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-400">
            © {year} Ridgeback Builders. All Rights Reserved.
          </p>
          <ul className="flex items-center gap-5 text-xs text-neutral-400">
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Fade-in animation */}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          .reveal {
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 480ms ease, transform 480ms ease;
          }
          .reveal.is-inview {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </footer>
  );
}

/* ---------- Pieces ---------- */
function LinksColumn({ g }: { g: { heading: string; links: LinkItem[] } }) {
  return (
    <section className="max-w-sm" data-animate>
      <nav aria-labelledby={`footer-${g.heading.replace(/\s+/g, "-")}`}>
        <h3
          id={`footer-${g.heading.replace(/\s+/g, "-")}`}
          className="text-sm font-semibold tracking-wide text-neutral-200"
        >
          {g.heading}
        </h3>
        <ul className="mt-4 space-y-3">
          {g.links.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                {...(l.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-sm text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                style={{ "--tw-ring-color": ACCENT } as CSSVars}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

function SocialIcon({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-neutral-300 transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
      style={{ "--accent": ACCENT, "--tw-ring-color": ACCENT } as CSSVars}
    >
      <span className="inline-flex transition-colors group-hover:text-[--accent]">
        {children}
      </span>
      <span className="sr-only">{label}</span>
    </Link>
  );
}

/* ---------- Newsletter (inline CTA) ---------- */
function NewsletterInline({
  ctaText = "Subscribe",
  accentColor = ACCENT,
  newsletterApi = "/api/newsletter",
}: {
  ctaText?: string;
  accentColor?: string;
  newsletterApi?: string;
}) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "err">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const r = await fetch(newsletterApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) throw new Error();
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="mt-4 sm:mt-5">
      <form onSubmit={onSubmit} aria-label="Newsletter subscription">
        <div className="mx-auto w-full max-w-2xl">
          <div className="relative">
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-full border border-white/10 bg-neutral-900/90 px-5 py-3 pr-40 text-base text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-white/20 focus:ring-2"
              style={{ "--tw-ring-color": accentColor } as CSSVars}
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="absolute right-1 top-1 bottom-1 inline-flex items-center justify-center rounded-full px-5 text-sm font-semibold text-black transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-60"
              style={
                {
                  backgroundColor: accentColor,
                  "--tw-ring-color": accentColor,
                } as CSSVars
              }
            >
              {status === "loading" ? "Submitting…" : ctaText}
            </button>
          </div>
        </div>

        <div
          className="mt-2 h-5 text-center text-sm"
          aria-live="polite"
          role="status"
        >
          {status === "ok" && (
            <span className="text-green-500">Thanks! Check your inbox.</span>
          )}
          {status === "err" && (
            <span className="text-red-500">
              Something went wrong. Try again.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}