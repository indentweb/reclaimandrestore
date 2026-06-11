import { site } from "@/lib/site";
import BookingForm from "./BookingForm";
import SectionHeading from "./SectionHeading";

export default function Booking() {
  return (
    <section id="book" className="section-edge bg-ink-soft py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Book a Date"
            title="Reserve your detail"
            description="Tell us about your vehicle and pick a day that works. We'll call you back to confirm the time and finalize the details."
          />

          <div className="mt-8 space-y-3">
            <InfoRow
              title="Prefer to talk?"
              value={site.phoneDisplay}
              href={site.phoneHref}
            />
            <InfoRow title="Service area" value={site.serviceArea} />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-ink-card p-6 sm:p-8">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-ink px-5 py-4">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-bright" />
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400">{title}</p>
        {href ? (
          <a
            href={href}
            className="text-lg font-semibold text-white hover:text-brand-soft"
          >
            {value}
          </a>
        ) : (
          <p className="text-base font-medium text-slate-200">{value}</p>
        )}
      </div>
    </div>
  );
}
