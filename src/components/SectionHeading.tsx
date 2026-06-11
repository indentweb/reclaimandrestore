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
      <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-mist">{description}</p>
      )}
    </div>
  );
}
