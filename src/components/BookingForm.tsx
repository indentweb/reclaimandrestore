"use client";

import { useState } from "react";
import { services, site } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

export default function BookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    // Multiple services can be checked — join them into one field.
    data.service = formData.getAll("service").join(", ");

    if (!data.service) {
      setStatus("error");
      setMessage("Please select at least one service.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        return;
      }

      // Email isn't configured on the server — fall back to the user's mail app
      // so the lead is never lost.
      if (json.fallback) {
        openMailto(data as Record<string, string>);
        setStatus("success");
        form.reset();
        return;
      }

      throw new Error(json.error ?? "Request failed");
    } catch {
      setStatus("error");
      setMessage(
        `Something went wrong sending your request. Please call us at ${site.phoneDisplay}.`,
      );
    }
  }

  function openMailto(data: Record<string, string>) {
    const subject = `Booking request — ${data.name ?? ""}`;
    const body = [
      `Name: ${data.name ?? ""}`,
      `Phone: ${data.phone ?? ""}`,
      `Vehicle: ${data.vehicle ?? ""}`,
      `Service: ${data.service ?? ""}`,
      `Preferred date: ${data.date ?? ""}`,
      `Location/notes: ${data.notes ?? ""}`,
    ].join("\n");
    window.location.href = `mailto:${site.bookingEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand/40 bg-brand/10 p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-wide text-white">
          Request sent!
        </h3>
        <p className="mt-2 text-slate-300">
          Thanks for reaching out. We&apos;ll call you at the number you provided
          to confirm your detailing date.
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Need to reach us sooner? Call{" "}
          <a href={site.phoneHref} className="font-semibold text-brand-soft">
            {site.phoneDisplay}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-brand-soft underline-offset-4 hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" placeholder="Jane Smith" required />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="(256) 555-0123"
          required
        />
      </div>

      <Field
        label="Vehicle"
        name="vehicle"
        placeholder="Year, make & model — e.g. 2019 Toyota Tacoma"
        required
      />

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-slate-200">
          Service(s) <span className="text-brand-bright">*</span>
          <span className="ml-2 font-normal text-slate-500">
            (select all that apply)
          </span>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {services.map((s) => (
            <ServiceCheckbox key={s.id} value={s.name} label={s.name} />
          ))}
          <ServiceCheckbox
            value="Not sure — help me decide"
            label="Not sure — help me decide"
          />
        </div>
      </fieldset>

      <Field label="Preferred date" name="date" type="date" />

      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-medium text-slate-200">
          Location &amp; notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Where should we come? Any stains, pet hair, or details we should know about?"
          className="rounded-lg border border-line bg-ink px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-brand"
        />
      </div>

      {status === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-brand px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Request My Date"}
      </button>
      <p className="text-center text-xs text-slate-500">
        We&apos;ll confirm your appointment by phone. No spam, ever.
      </p>
    </form>
  );
}

function ServiceCheckbox({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-ink px-4 py-3 text-sm text-slate-200 transition-colors hover:border-brand has-checked:border-brand has-checked:bg-brand/10">
      <input
        type="checkbox"
        name="service"
        value={value}
        className="h-4 w-4 shrink-0 accent-brand"
      />
      {label}
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm font-medium text-slate-200">
        {label} {required && <span className="text-brand-bright">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-line bg-ink px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-brand scheme-dark"
      />
    </div>
  );
}
