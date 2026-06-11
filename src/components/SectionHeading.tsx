export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft ${
          align === "left" ? "eyebrow-rule" : ""
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-mist sm:mt-4 sm:text-lg">{description}</p>
      )}
    </div>
  );
}
