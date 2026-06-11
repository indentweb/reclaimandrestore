import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "How It Works" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#area", label: "Service Area" },
  { href: "/#book", label: "Book" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-md bg-white p-1 ring-1 ring-line">
            <Image
              src="/brand/logo-monogram.png"
              alt="Reclaim & Restore"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold uppercase tracking-wide text-white">
              Reclaim <span className="text-brand-bright">&amp;</span> Restore
            </span>
            <span className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
              {site.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <a
          href={site.phoneHref}
          className="hidden items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-bright sm:inline-flex"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
          </svg>
          {site.phoneDisplay}
        </a>
      </div>
    </header>
  );
}
