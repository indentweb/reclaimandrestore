import { getSiteContent } from "@/lib/content";

export default async function MobileActionBar() {
  const { phoneDisplay, phoneHref } = await getSiteContent();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-ink md:hidden">
      <a
        href={phoneHref}
        className="flex flex-1 items-center justify-center gap-2.5 border-r border-line bg-ink-card py-4 text-sm font-semibold text-white transition-colors active:bg-ink-soft"
        aria-label={`Call ${phoneDisplay}`}
      >
        <svg
          className="h-5 w-5 shrink-0 text-brand-bright"
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
        Call Now
      </a>
      <a
        href="#book"
        className="flex flex-1 items-center justify-center gap-2.5 bg-brand py-4 text-sm font-semibold text-white transition-colors active:bg-brand-bright"
      >
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Book a Date
      </a>
    </div>
  );
}
