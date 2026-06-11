import Image from "next/image";
import Link from "next/link";
import { site, services } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="section-edge bg-ink py-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-md bg-white p-1 ring-1 ring-line">
              <Image
                src="/brand/logo-monogram.png"
                alt="Reclaim & Restore"
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-display text-xl font-semibold uppercase tracking-wide text-white">
              Reclaim <span className="text-brand-bright">&amp;</span> Restore
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Mobile auto detailing — steam, shampoo, interior &amp; exterior.{" "}
            {site.serviceArea}.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Services
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {services.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
            <li>
              <Link href="/gallery" className="hover:text-white">
                Gallery
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={site.phoneHref}
                className="font-semibold text-brand-soft hover:text-white"
              >
                {site.phoneDisplay}
              </a>
            </li>
            <li className="text-slate-400">North Alabama &amp; surrounding areas</li>
            <li>
              <a
                href="/#book"
                className="inline-flex rounded-md bg-brand px-5 py-2 font-semibold text-white transition-colors hover:bg-brand-bright"
              >
                Book a Date
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 pt-6 sm:px-6">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Reclaim &amp; Restore. All rights reserved.
        </p>
        <Link href="/admin" className="text-xs text-slate-600 hover:text-slate-400">
          Owner login
        </Link>
      </div>
    </footer>
  );
}
