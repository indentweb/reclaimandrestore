import { getSiteContent } from "@/lib/content";
import SectionHeading from "./SectionHeading";

export default async function Process() {
  const { processSteps } = await getSiteContent();

  return (
    <section id="process" className="section-edge bg-ink-soft py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="A simple, straightforward process"
        />

        <ol className="mt-8 grid grid-cols-2 gap-4 sm:mt-12 lg:grid-cols-4">
          {processSteps.map((step) => (
            <li
              key={step.id}
              className="relative rounded-xl border border-line bg-ink-card p-5 sm:p-6"
            >
              <span className="font-display text-2xl font-semibold text-brand-bright">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
