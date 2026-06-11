"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/lib/gallery";

const PW_KEY = "rr_admin_pw";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(PW_KEY);
    if (saved) setPassword(saved);
    void refresh();
  }, []);

  async function refresh() {
    try {
      const res = await fetch("/api/gallery", { cache: "no-store" });
      const json = await res.json();
      setImages(json.images ?? []);
    } catch {
      /* ignore */
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const files = fileInput.current?.files;
    if (!password) {
      setError("Enter the owner password first.");
      return;
    }
    if (!files || files.length === 0) {
      setError("Choose at least one photo to upload.");
      return;
    }

    const data = new FormData();
    data.append("password", password);
    Array.from(files).forEach((f) => data.append("files", f));

    setBusy(true);
    try {
      const res = await fetch("/api/gallery", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Upload failed.");
      }
      sessionStorage.setItem(PW_KEY, password);
      setNotice(`Uploaded ${json.saved.length} photo(s).`);
      if (fileInput.current) fileInput.current.value = "";
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(name: string) {
    if (!password) {
      setError("Enter the owner password first.");
      return;
    }
    if (!confirm("Remove this photo from the gallery?")) return;

    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/gallery", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Delete failed.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="eyebrow-rule text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
        Owner Dashboard
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Manage gallery photos
      </h1>
      <p className="mt-3 max-w-xl text-mist">
        Upload before-and-after photos of your work. They appear on the home
        page and gallery automatically.
      </p>

      <form
        onSubmit={handleUpload}
        className="mt-8 rounded-2xl border border-line bg-ink-card p-6 sm:p-8"
      >
        <div className="grid gap-5">
          <div className="grid gap-2">
            <label htmlFor="pw" className="text-sm font-medium text-slate-200">
              Owner password
            </label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="max-w-xs rounded-lg border border-line bg-ink px-4 py-2.5 text-white outline-none focus:border-brand"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="files" className="text-sm font-medium text-slate-200">
              Photos
            </label>
            <input
              id="files"
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-bright"
            />
            <p className="text-xs text-slate-500">
              JPG, PNG, WEBP, GIF or AVIF · up to 12 MB each.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-lg border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-brand-soft">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-fit items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
          >
            {busy ? "Uploading..." : "Upload photos"}
          </button>
        </div>
      </form>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">
          Current photos{" "}
          <span className="text-slate-500">({images.length})</span>
        </h2>
        {images.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            No photos uploaded yet.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.src}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-ink-card"
              >
                <Image
                  src={img.src}
                  alt="Gallery photo"
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(img.name)}
                  className="absolute right-2 top-2 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
