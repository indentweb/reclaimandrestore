import { site } from "@/lib/site";

export default function Contact() {
  return (
    <section id="contact" className="section-edge py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-ink-card px-8 py-14 sm:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_100%_0%,rgba(47,111,228,0.16),transparent_60%)]" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to book your detail?
              </h2>
              <p className="mt-4 max-w-xl text-lg text-mist">
                Give us a call and let&apos;s get your vehicle looking and
                feeling new again. {site.serviceArea}.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <a
                href={site.phoneHref}
                className="inline-flex items-center justify-center gap-3 rounded-md bg-brand px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-brand-bright"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                {site.phoneDisplay}
              </a>
              <a
                href="#book"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-line px-8 py-4 text-base font-semibold text-white transition-colors hover:border-brand-bright"
              >
                Book online
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
