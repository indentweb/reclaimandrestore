import { services } from "@/lib/site";
import SectionHeading from "./SectionHeading";

const icons: Record<string, React.ReactNode> = {
  steam: (
    <>
      <path d="M8 19a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" />
      <path d="M13 19a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" />
      <path d="M18 19a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" />
    </>
  ),
  shampoo: (
    <>
      <path d="M3 7h6l1-2h4l1 2h6" />
      <path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
      <path d="M9 12h6" />
    </>
  ),
  interior: (
    <>
      <path d="M4 18v-6a4 4 0 0 1 4-4h2a3 3 0 0 1 3 3v7" />
      <path d="M4 18h13a3 3 0 0 0 3-3v-1a3 3 0 0 0-3-3" />
      <path d="M4 18l-1 3M17 18l1 3" />
    </>
  ),
  exterior: (
    <>
      <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
      <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M7 16h.01M17 16h.01" />
    </>
  ),
};

export default function Services() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Our Services"
          title="Detailing built around your vehicle"
          description="From a quick interior refresh to a full restoration, we bring professional-grade tools and products directly to you."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-ink-card p-8 transition-colors hover:bg-ink-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand/12 text-brand-bright ring-1 ring-inset ring-brand/25">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {icons[service.id]}
                </svg>
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white">
                {service.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-brand-soft">
                {service.short}
              </p>
              <p className="mt-4 leading-relaxed text-mist">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
