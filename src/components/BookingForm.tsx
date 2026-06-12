"use client";

import { useState, useRef } from "react";
import type { Service } from "@/lib/content";
import { useToast } from "@/components/Toaster";

type Status = "idle" | "uploading" | "submitting" | "success";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB per photo
const MAX_PHOTOS = 5;

async function uploadBookingPhoto(file: File): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const ext = file.name.slice(file.name.lastIndexOf(".")) || ".jpg";
  const filename = `customer-photos/${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;

  const res = await fetch(`${url}/storage/v1/object/gallery/${filename}`, {
    method: "POST",
    headers: { "Content-Type": file.type, apikey: key },
    body: file,
  });

  if (!res.ok) {
    console.error("[booking-photo] upload failed:", res.status, await res.text());
    return null;
  }

  return `${url}/storage/v1/object/public/gallery/${encodeURIComponent(filename)}`;
}

export default function BookingForm({
  services,
  phoneDisplay,
  phoneHref,
}: {
  services: Service[];
  phoneDisplay: string;
  phoneHref: string;
}) {
  const { toast } = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [inlineError, setInlineError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const photoInput = useRef<HTMLInputElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const valid = files.filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > MAX_PHOTO_BYTES) {
        toast(`${f.name} is over 10 MB — please use a smaller photo.`, "error");
        return false;
      }
      return true;
    });
    const combined = [...photos, ...valid].slice(0, MAX_PHOTOS);
    setPhotos(combined);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    if (photoInput.current) photoInput.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    data.service = formData.getAll("service").join(", ");

    if (!data.service) {
      setInlineError("Please select at least one service.");
      return;
    }

    setInlineError("");

    // Upload photos first if any
    let car_photo_urls: string[] = [];
    if (photos.length > 0) {
      setStatus("uploading");
      const results = await Promise.all(photos.map(uploadBookingPhoto));
      car_photo_urls = results.filter((u): u is string => u !== null);
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, car_photo_urls }),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        setStatus("success");
        form.reset();
        setPhotos([]);
        setPreviews([]);
        toast("Booking request sent! We'll call you to confirm.", "success");
        return;
      }

      throw new Error(json.error ?? "Request failed");
    } catch {
      setStatus("idle");
      toast(`Something went wrong. Please call us at ${phoneDisplay}.`, "error");
    }
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
          <a href={phoneHref} className="font-semibold text-brand-soft">
            {phoneDisplay}
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

  const busy = status === "uploading" || status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-5">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Field label="Your name" name="name" placeholder="Jane Smith" required autoComplete="name" />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="(256) 555-0123"
          required
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      <Field
        label="Vehicle"
        name="vehicle"
        placeholder="Year, make & model — e.g. 2019 Toyota Tacoma"
        required
        autoComplete="off"
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
          className="rounded-lg border border-line bg-ink px-4 py-3.5 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-brand"
        />
      </div>

      {/* Car photos */}
      <div className="grid gap-2">
        <p className="text-sm font-medium text-slate-200">
          Photos of your vehicle{" "}
          <span className="font-normal text-slate-500">(optional — up to {MAX_PHOTOS})</span>
        </p>
        <p className="text-xs text-slate-500">
          Help us see what we&apos;re working with before we arrive.
        </p>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-ink-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Car photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white hover:bg-red-600"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < MAX_PHOTOS && (
          <>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
              id="car-photos"
            />
            <label
              htmlFor="car-photos"
              className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line bg-ink px-4 py-3 text-sm text-slate-400 transition-colors hover:border-brand hover:text-slate-200"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M12 16V8m-4 4 4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 16.7A4 4 0 0 0 18 9h-1.26A8 8 0 1 0 4 16.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {photos.length === 0 ? "Add photos" : "Add more photos"}
            </label>
          </>
        )}
      </div>

      {inlineError && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {inlineError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-md bg-brand px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-bright active:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "uploading"
          ? "Uploading photos…"
          : status === "submitting"
          ? "Sending…"
          : "Request My Date"}
      </button>
      <p className="text-center text-xs text-slate-500">
        We&apos;ll confirm your appointment by phone.
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
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-line bg-ink px-4 py-3.5 text-sm text-slate-200 transition-colors hover:border-brand has-checked:border-brand has-checked:bg-brand/10 active:bg-ink-soft">
      <input
        type="checkbox"
        name="service"
        value={value}
        className="h-5 w-5 shrink-0 accent-brand"
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
  autoComplete,
  inputMode,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
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
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="rounded-lg border border-line bg-ink px-4 py-3.5 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-brand scheme-dark"
      />
    </div>
  );
}
