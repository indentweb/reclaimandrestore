import Image from "next/image";
import { site } from "@/lib/site";

const highlights = [
  "Steam & shampoo deep cleaning",
  "Interior & exterior detailing",
  "Fully mobile — we come to you",
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_80%_-10%,rgba(47,111,228,0.18),transparent_55%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:gap-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div>
          <p className="eyebrow-rule text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
            Mobile Auto Detailing · North Alabama
          </p>

          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:mt-6 sm:text-5xl lg:text-[3.5rem]">
            Professional detailing,
            <br />
            done right in your driveway.
          </h1>

          <p className="mt-4 hidden max-w-xl text-lg leading-relaxed text-mist sm:mt-6 sm:block">
            Reclaim &amp; Restore brings full-service interior and exterior
            detailing to your home or workplace. Steam cleaning, shampoo and
            extraction, and a finish that looks and feels brand new.
          </p>

          <ul className="mt-5 space-y-2.5 sm:mt-8 sm:space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <svg
                  className="h-5 w-5 shrink-0 text-brand-bright"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href="#book"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-bright active:bg-brand-bright"
            >
              Book a Date
            </a>
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-7 py-3.5 text-base font-semibold text-white transition-colors hover:border-brand-bright active:border-brand-bright"
            >
              Call {site.phoneDisplay}
            </a>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-sm sm:block">
          <div className="rounded-2xl border border-line bg-white p-8 shadow-[0_30px_80px_-30px_rgba(47,111,228,0.45)]">
            <Image
              src="/brand/logo-shield.png"
              alt="Reclaim & Restore — Restoration Services"
              width={576}
              height={1024}
              className="mx-auto h-auto w-full max-w-[16rem]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
