import SectionHeading from "./SectionHeading";

const steps = [
  {
    n: "01",
    title: "Request a date",
    text: "Tell us about your vehicle, the services you want, and a day that works for you.",
  },
  {
    n: "02",
    title: "We confirm by phone",
    text: "We call to lock in your time and answer any questions about the job.",
  },
  {
    n: "03",
    title: "We come to you",
    text: "Our mobile setup arrives at your home or workplace — anywhere in North Alabama.",
  },
  {
    n: "04",
    title: "Reclaim & restore",
    text: "We steam, shampoo, and detail until your vehicle looks and feels new again.",
  },
];

export default function Process() {
  return (
    <section id="process" className="section-edge bg-ink-soft py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="A simple, straightforward process"
        />

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.n}
              className="relative rounded-xl border border-line bg-ink-card p-6"
            >
              <span className="font-display text-2xl font-semibold text-brand-bright">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
