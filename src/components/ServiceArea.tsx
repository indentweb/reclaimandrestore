import { site } from "@/lib/site";
import SectionHeading from "./SectionHeading";

const towns = [
  "Huntsville",
  "Madison",
  "Decatur",
  "Athens",
  "Cullman",
  "Scottsboro",
  "Guntersville",
  "Florence",
];

export default function ServiceArea() {
  return (
    <section id="area" className="section-edge py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Service Area"
            title="We come to you"
            description={`${site.serviceArea}. There's no need to drop your vehicle off or wait at a shop — we bring the complete detailing setup to your driveway or workplace.`}
          />

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {towns.map((town) => (
              <li
                key={town}
                className="rounded-md border border-line bg-ink-card px-4 py-1.5 text-sm font-medium text-slate-200"
              >
                {town}
              </li>
            ))}
            <li className="rounded-md border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand-soft">
              + surrounding areas
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-ink-card p-10">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-brand/12 text-brand-bright ring-1 ring-inset ring-brand/25">
              <svg
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <p className="mt-5 text-xl font-semibold text-white">North Alabama</p>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              Fully mobile service. Not sure if you&apos;re in range? Give us a
              call and we&apos;ll let you know.
            </p>
            <a
              href={site.phoneHref}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-bright"
            >
              Call {site.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
