"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { browserClient } from "@/lib/supabase";
import { DEFAULTS } from "@/lib/content";
import { useToast } from "@/components/Toaster";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Service, ProcessStep } from "@/lib/content";
import { compressVideo, isVideoFile } from "@/lib/compress-video";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BookingStatus = "new" | "confirmed" | "completed" | "cancelled";

type Booking = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  service: string | null;
  preferred_date: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
};

type GalleryImage = { src: string; name: string; uploadedAt: number };

type Tab = "bookings" | "gallery" | "business" | "hero" | "services" | "process" | "area";

// ---------------------------------------------------------------------------
// File preview helpers
// ---------------------------------------------------------------------------

function MediaPreview({
  files,
  onRemove,
}: {
  files: File[];
  onRemove: (i: number) => void;
}) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const newUrls = files.map((f) => URL.createObjectURL(f));
    setUrls(newUrls);
    return () => newUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  if (files.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {files.map((file, i) => (
        <div
          key={i}
          className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-brand/30 bg-ink-card"
        >
          {file.type.startsWith("video/") ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={urls[i] + "#t=0.001"}
                preload="metadata"
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={urls[i]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <span className="absolute bottom-0 left-0 right-0 truncate bg-black/70 px-2 py-1 text-[10px] text-white">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom confirm dialog (replaces native window.confirm)
// ---------------------------------------------------------------------------

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-line bg-ink-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </span>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{title}</h3>
            {message && <p className="mt-1 text-sm text-slate-400">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SingleFilePreview({ file }: { file: File | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) { setUrl(null); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  if (!url || !file) return null;

  return (
    <div className="mt-2 flex items-start gap-3 rounded-lg border border-brand/30 bg-ink p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Preview"
        className="h-16 w-16 rounded object-contain"
      />
      <span className="mt-1 truncate text-xs text-slate-400">{file.name}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root: handles auth state
// ---------------------------------------------------------------------------

export default function AdminDashboard() {
  const [supabase] = useState(() => browserClient());
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  if (!authReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!user) return <LoginForm supabase={supabase} />;
  return <Dashboard supabase={supabase} user={user} />;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

function LoginForm({ supabase }: { supabase: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <p className="eyebrow-rule text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">
        Owner Login
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
        Dashboard
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-200">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
            className="rounded-lg border border-line bg-ink px-4 py-3 text-white outline-none focus:border-brand" />
        </div>
        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
            className="rounded-lg border border-line bg-ink px-4 py-3 text-white outline-none focus:border-brand" />
        </div>
        {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
        <button type="submit" disabled={busy}
          className="mt-1 w-full rounded-md bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard shell
// ---------------------------------------------------------------------------

const TAB_LABELS: Record<Tab, string> = {
  bookings: "Bookings",
  gallery: "Gallery",
  business: "Business",
  hero: "Hero",
  services: "Services",
  process: "How It Works",
  area: "Service Area",
};

function Dashboard({ supabase, user }: { supabase: SupabaseClient; user: User }) {
  const [tab, setTab] = useState<Tab>("bookings");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow-rule text-xs font-semibold uppercase tracking-[0.28em] text-brand-soft">Owner Dashboard</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Reclaim &amp; Restore
          </h1>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-brand-bright hover:text-white">
          Sign out
        </button>
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div className="mt-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 rounded-xl border border-line bg-ink-card p-1">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t ? "bg-brand text-white" : "text-slate-400 hover:text-white"
              }`}>
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {tab === "bookings" && <BookingsTab supabase={supabase} />}
        {tab === "gallery"  && <GalleryTab  supabase={supabase} />}
        {tab === "business" && <BusinessTab supabase={supabase} />}
        {tab === "hero"     && <HeroTab     supabase={supabase} />}
        {tab === "services" && <ServicesTab supabase={supabase} />}
        {tab === "process"  && <ProcessTab  supabase={supabase} />}
        {tab === "area"     && <AreaTab     supabase={supabase} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function SaveButton({ busy, label = "Save changes" }: { busy: boolean; label?: string }) {
  return (
    <button type="submit" disabled={busy}
      className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-60">
      {busy ? "Saving…" : label}
    </button>
  );
}

function Notice({ ok, msg }: { ok: boolean | null; msg: string }) {
  if (!msg) return null;
  return (
    <p className={`rounded-lg border px-4 py-3 text-sm ${
      ok ? "border-brand/40 bg-brand/10 text-brand-soft" : "border-red-500/40 bg-red-500/10 text-red-200"
    }`}>{msg}</p>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-white outline-none focus:border-brand";
const TEXTAREA = `${INPUT} resize-none`;

async function upsertSetting(supabase: SupabaseClient, key: string, value: string) {
  return supabase.from("site_settings").upsert({ key, value });
}

// ---------------------------------------------------------------------------
// Bookings tab
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New", confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled",
};
const STATUS_COLORS: Record<BookingStatus, string> = {
  new: "bg-brand/15 text-brand-soft border-brand/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  completed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

function BookingsTab({ supabase }: { supabase: SupabaseClient }) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | "all">("all");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void fetchBookings(); }, [fetchBookings]);

  async function updateStatus(id: string, status: BookingStatus) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
      toast(`Marked as ${STATUS_LABELS[status].toLowerCase()}.`, "success");
    } else {
      toast(error.message, "error");
    }
  }

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const counts = bookings.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), {} as Record<string, number>);

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" /></div>;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["all", "new", "confirmed", "completed", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1 text-xs font-semibold capitalize transition-colors ${
              filter === s ? "border-brand bg-brand/15 text-brand-soft" : "border-line text-slate-400 hover:text-white"
            }`}>
            {s === "all" ? "All" : STATUS_LABELS[s]} <span className="opacity-60">({s === "all" ? bookings.length : (counts[s] ?? 0)})</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line py-14 text-center text-sm text-slate-400">
          {bookings.length === 0 ? "No booking requests yet." : "No requests match this filter."}
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-xl border border-line bg-ink-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{b.name}</p>
                  <a href={`tel:${b.phone.replace(/\D/g, "")}`} className="text-sm text-brand-soft hover:underline">{b.phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${STATUS_COLORS[b.status]}`}>{STATUS_LABELS[b.status]}</span>
                  <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)}
                    className="rounded-md border border-line bg-ink px-2 py-1 text-xs text-slate-300 outline-none focus:border-brand">
                    {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 grid gap-1 text-sm text-mist">
                <p><span className="text-slate-500">Vehicle:</span> {b.vehicle}</p>
                {b.service && <p><span className="text-slate-500">Service:</span> {b.service}</p>}
                {b.preferred_date && <p><span className="text-slate-500">Date requested:</span> {new Date(b.preferred_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>}
                {b.notes && <p><span className="text-slate-500">Notes:</span> {b.notes}</p>}
              </div>
              <p className="mt-3 text-xs text-slate-500">Submitted {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery tab — uploads/deletes go directly via the browser Supabase client
// so the user's session JWT is used (avoids new-format service-role key issues)
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "video/mp4", "video/webm", "video/quicktime", "video/avi",
]);
const MAX_BYTES = 500 * 1024 * 1024;

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 40);
}

function GalleryTab({ supabase }: { supabase: SupabaseClient }) {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [shieldBusy, setShieldBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ name: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const shieldInput = useRef<HTMLInputElement>(null);

  // Preview state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  const [pendingShield, setPendingShield] = useState<File | null>(null);

  // Compression progress state
  const [compressStatus, setCompressStatus] = useState<string | null>(null);
  const [compressPct, setCompressPct] = useState(0);

  // Drag-to-reorder state
  const [orderedImages, setOrderedImages] = useState<GalleryImage[]>([]);
  const [savedOrder, setSavedOrder] = useState<string[]>([]);
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const BUCKET = "gallery";
  const MEDIA_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".mp4", ".webm", ".mov", ".avi"]);

  const refresh = useCallback(async () => {
    const [listResult, orderResult] = await Promise.all([
      supabase.storage.from(BUCKET).list("", { sortBy: { column: "created_at", order: "desc" } }),
      supabase.from("site_settings").select("value").eq("key", "gallery_order").maybeSingle(),
    ]);
    if (!listResult.data) return;
    const imgs: GalleryImage[] = listResult.data
      .filter((item) => MEDIA_EXT.has(item.name.slice(item.name.lastIndexOf(".")).toLowerCase()) && !item.name.startsWith("brand/"))
      .map((item) => {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(item.name);
        return { src: urlData.publicUrl, name: item.name, type: "image" as const, uploadedAt: new Date(item.created_at ?? 0).getTime() };
      });

    let order: string[] = [];
    try { order = JSON.parse(orderResult.data?.value ?? "[]") as string[]; } catch { order = []; }
    setSavedOrder(order);

    if (order.length > 0) {
      const orderMap = new Map(order.map((n, i) => [n, i]));
      imgs.sort((a, b) => (orderMap.get(a.name) ?? Infinity) - (orderMap.get(b.name) ?? Infinity));
    }

    setImages(imgs);
    setOrderedImages(imgs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const files = fileInput.current?.files;
    if (!files || files.length === 0) { toast("Choose at least one file first.", "error"); return; }
    setBusy(true);
    let uploaded = 0;
    for (const rawFile of Array.from(files)) {
      if (!ALLOWED_TYPES.has(rawFile.type) && !isVideoFile(rawFile)) {
        toast(`Unsupported type: ${rawFile.name}`, "error"); setBusy(false); return;
      }

      let file = rawFile;

      // Auto-compress videos so they fit within Supabase's 50 MB free-tier limit
      if (isVideoFile(rawFile)) {
        const needsCompress = rawFile.size > 40 * 1024 * 1024; // > 40 MB
        if (needsCompress) {
          try {
            setCompressStatus(`Loading video compressor…`);
            setCompressPct(0);
            // First call downloads ffmpeg.wasm (~10 MB) — subsequent calls are instant
            file = await compressVideo(rawFile, {
              onProgress: (pct) => {
                setCompressStatus(`Compressing ${rawFile.name}… ${pct}%`);
                setCompressPct(pct);
              },
            });
            setCompressStatus(null);
            const origMB = (rawFile.size / 1024 / 1024).toFixed(1);
            const newMB  = (file.size  / 1024 / 1024).toFixed(1);
            toast(`Compressed ${rawFile.name}: ${origMB} MB → ${newMB} MB`, "success");
          } catch (err) {
            setCompressStatus(null);
            console.error("[compress] error:", err);
            toast(`Could not compress ${rawFile.name}. Try reducing the video length or using a smaller file.`, "error");
            setBusy(false); return;
          }
        }
      }

      const ext = file.name.slice(file.name.lastIndexOf("."));
      const base = slugify(rawFile.name.slice(0, rawFile.name.lastIndexOf("."))) || "photo";
      const filename = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(filename, file, { contentType: file.type });
      if (uploadErr) {
        const msg = uploadErr.message.toLowerCase().includes("maximum allowed size")
          ? `${file.name} is still over Supabase's limit after compression. Try a shorter clip or upgrade Supabase to Pro.`
          : `Failed to upload ${file.name}: ${uploadErr.message}`;
        toast(msg, "error"); setBusy(false); return;
      }
      uploaded++;
    }
    toast(`${uploaded} file${uploaded > 1 ? "s" : ""} uploaded successfully!`, "success");
    if (fileInput.current) fileInput.current.value = "";
    setPendingFiles([]);
    await refresh();
    setBusy(false);
  }

  async function handleDelete(name: string) {
    const { error: delErr } = await supabase.storage.from(BUCKET).remove([name]);
    setConfirmDelete(null);
    if (delErr) { toast(delErr.message, "error"); return; }
    toast("Deleted successfully.", "success");
    await refresh();
  }

  // ---- Drag-to-reorder ----
  // Only reorder on drop (not on dragOver) — updating state during dragOver
  // causes React to re-render the dragged element which interrupts the drag.
  function onDragStart(idx: number) { setDragSrcIdx(idx); }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault(); // required to allow drop
    setDragOverIdx(idx);
  }

  function onDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragSrcIdx === null || dragSrcIdx === idx) {
      setDragSrcIdx(null); setDragOverIdx(null); return;
    }
    setOrderedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragSrcIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragSrcIdx(null);
    setDragOverIdx(null);
  }

  function onDragEnd() {
    setDragSrcIdx(null);
    setDragOverIdx(null);
  }

  const orderChanged = orderedImages.map((i) => i.name).join(",") !== savedOrder.join(",") && orderedImages.length > 0;

  async function saveOrder() {
    const order = orderedImages.map((i) => i.name);
    await upsertSetting(supabase, "gallery_order", JSON.stringify(order));
    setSavedOrder(order);
    toast("Order saved! The gallery will now show in this order.", "success");
  }

  async function uploadBrandAsset(
    inputRef: React.RefObject<HTMLInputElement | null>,
    settingKey: string,
    setBusy: (v: boolean) => void,
  ) {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setBusy(true);
    const ext = file.name.slice(file.name.lastIndexOf("."));
    const filename = `brand/${settingKey}-${Date.now()}${ext}`;
    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(filename, file, { upsert: true, contentType: file.type });
    if (uploadErr) { toast(uploadErr.message, "error"); setBusy(false); return; }
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    await upsertSetting(supabase, settingKey, urlData.publicUrl);
    toast("Logo updated! Reload the public site to see it.", "success");
    if (inputRef.current) inputRef.current.value = "";
    if (settingKey === "logo_url") setPendingLogo(null);
    if (settingKey === "shield_url") setPendingShield(null);
    setBusy(false);
  }

  return (
    <>
    <div className="grid gap-8">
      {/* Brand assets */}
      <div className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Brand logos</h2>
        <p className="mt-1 text-sm text-slate-400">Replace the logo shown in the header, footer, and hero.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Header / footer logo</p>
            <input ref={logoInput} type="file" accept="image/*"
              onChange={(e) => setPendingLogo(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-bright" />
            <SingleFilePreview file={pendingLogo} />
            <button type="button" disabled={logoBusy || !pendingLogo} onClick={() => uploadBrandAsset(logoInput, "logo_url", setLogoBusy)}
              className="w-fit rounded-md bg-ink border border-line px-4 py-1.5 text-xs font-semibold text-slate-300 hover:border-brand-bright disabled:opacity-40">
              {logoBusy ? "Uploading…" : "Upload logo"}
            </button>
          </div>
          <div className="grid gap-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hero shield / badge</p>
            <input ref={shieldInput} type="file" accept="image/*"
              onChange={(e) => setPendingShield(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-bright" />
            <SingleFilePreview file={pendingShield} />
            <button type="button" disabled={shieldBusy || !pendingShield} onClick={() => uploadBrandAsset(shieldInput, "shield_url", setShieldBusy)}
              className="w-fit rounded-md bg-ink border border-line px-4 py-1.5 text-xs font-semibold text-slate-300 hover:border-brand-bright disabled:opacity-40">
              {shieldBusy ? "Uploading…" : "Upload shield"}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery photos */}
      <div className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Work photos &amp; videos</h2>
        <p className="mt-1 text-sm text-slate-400">JPG, PNG, WEBP · MP4, MOV, WEBM · Videos are auto-compressed before upload</p>
        <p className="mt-1 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300">
          📱 <strong>iPhone tip:</strong> For best browser compatibility, go to <strong>Settings → Camera → Formats → Most Compatible</strong> before recording. This saves as MP4 instead of MOV/HEVC.
        </p>
        <form onSubmit={handleUpload} className="mt-4 grid gap-3">
          <input id="files" ref={fileInput} type="file" accept="image/*,video/*" multiple
            onChange={(e) => setPendingFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-bright" />
          <MediaPreview
            files={pendingFiles}
            onRemove={(i) => {
              setPendingFiles((prev) => {
                const next = prev.filter((_, idx) => idx !== i);
                if (next.length === 0 && fileInput.current) fileInput.current.value = "";
                return next;
              });
            }}
          />
          {/* Compression progress bar */}
          {compressStatus && (
            <div className="grid gap-1.5">
              <p className="text-xs text-slate-300">{compressStatus}</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${compressPct}%` }}
                />
              </div>
            </div>
          )}
          <button type="submit" disabled={busy || pendingFiles.length === 0}
            className="w-fit rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-bright disabled:opacity-40">
            {busy
              ? compressStatus ? "Compressing…" : "Uploading…"
              : `Upload ${pendingFiles.length > 0 ? `${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""}` : "photos & videos"}`}
          </button>
        </form>
        {orderedImages.length > 0 && (
          <>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Drag items to reorder. First = shown first on the site.</p>
              {orderChanged && (
                <button type="button" onClick={saveOrder}
                  className="shrink-0 rounded-md bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-bright">
                  Save order
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {orderedImages.map((img, idx) => (
                <div
                  key={img.src}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  onDrop={(e) => onDrop(e, idx)}
                  onDragEnd={onDragEnd}
                  className={[
                    "group relative aspect-[4/3] cursor-grab overflow-hidden rounded-lg border bg-ink-card transition-all active:cursor-grabbing",
                    dragSrcIdx === idx ? "opacity-40 scale-95" : "",
                    dragOverIdx === idx && dragSrcIdx !== idx
                      ? "border-brand ring-2 ring-brand scale-[1.03]"
                      : "border-line",
                  ].join(" ")}
                >
                  {img.src.match(/\.(mp4|webm|mov|avi)(\?|$)/i) ? (
                    <>
                      <video src={img.src + "#t=0.001"} preload="metadata" muted playsInline className="absolute inset-0 h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white pointer-events-none">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8"><path d="M8 5v14l11-7z"/></svg>
                      </span>
                    </>
                  ) : (
                    <Image src={img.src} alt="Gallery photo" fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
                  )}
                  {/* Drag handle */}
                  <span className="absolute left-2 top-2 rounded bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-white">
                      <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </span>
                  <button type="button" onClick={() => setConfirmDelete({ name: img.name })}
                    className="absolute right-2 top-2 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>

    {confirmDelete && (
      <ConfirmDialog
        title="Delete this photo?"
        message="This can't be undone. The file will be permanently removed from storage."
        confirmLabel="Yes, delete"
        onConfirm={() => handleDelete(confirmDelete.name)}
        onCancel={() => setConfirmDelete(null)}
      />
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Business Info tab
// ---------------------------------------------------------------------------

function BusinessTab({ supabase }: { supabase: SupabaseClient }) {
  const { toast } = useToast();
  const [fields, setFields] = useState({ business_name: "", tagline: "", phone_display: "", phone_href: "", service_area: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("key, value").then(({ data }) => {
      if (!data) return;
      const map: Record<string, string> = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
      setFields({
        business_name: map.business_name ?? DEFAULTS.businessName,
        tagline:       map.tagline       ?? DEFAULTS.tagline,
        phone_display: map.phone_display ?? DEFAULTS.phoneDisplay,
        phone_href:    map.phone_href    ?? DEFAULTS.phoneHref,
        service_area:  map.service_area  ?? DEFAULTS.serviceArea,
      });
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const rows = Object.entries(fields).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) toast(error.message, "error"); else toast("Business info saved!", "success");
    setBusy(false);
  }

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">Business information</h2>
      <p className="mt-1 text-sm text-slate-400">Appears in the header, footer, and booking confirmation.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Business name" id="bn"><input id="bn" value={fields.business_name} onChange={set("business_name")} className={INPUT} /></Field>
        <Field label="Tagline (under logo)" id="tl"><input id="tl" value={fields.tagline} onChange={set("tagline")} className={INPUT} /></Field>
        <Field label="Phone (display)" id="pd"><input id="pd" value={fields.phone_display} onChange={set("phone_display")} placeholder="256-508-5285" className={INPUT} /></Field>
        <Field label="Phone (tel: link)" id="ph"><input id="ph" value={fields.phone_href} onChange={set("phone_href")} placeholder="tel:+12565085285" className={INPUT} /></Field>
        <Field label="Service area (short description)" id="sa">
          <input id="sa" value={fields.service_area} onChange={set("service_area")} className={INPUT} />
        </Field>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <SaveButton busy={busy} />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Hero tab
// ---------------------------------------------------------------------------

function HeroTab({ supabase }: { supabase: SupabaseClient }) {
  const { toast } = useToast();
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("site_settings").select("key, value").in("key", ["hero_headline", "hero_description"]),
      supabase.from("hero_bullets").select("id, text, sort_order").order("sort_order"),
    ]).then(([settingsRes, bulletsRes]) => {
      const map: Record<string, string> = Object.fromEntries((settingsRes.data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
      setHeadline(map.hero_headline ?? DEFAULTS.heroHeadline);
      setDescription(map.hero_description ?? DEFAULTS.heroDescription);
      setBullets(bulletsRes.data?.map((b: { text: string }) => b.text) ?? DEFAULTS.heroBullets);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const [s1, s2] = await Promise.all([
      upsertSetting(supabase, "hero_headline", headline),
      upsertSetting(supabase, "hero_description", description),
    ]);
    await supabase.from("hero_bullets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const inserts = bullets.filter(Boolean).map((text, i) => ({ text, sort_order: i + 1 }));
    const s3 = inserts.length ? await supabase.from("hero_bullets").insert(inserts) : { error: null };
    const err = s1.error || s2.error || s3.error;
    if (err) toast(err.message, "error"); else toast("Hero section saved!", "success");
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">Hero section</h2>
      <p className="mt-1 text-sm text-slate-400">The first thing visitors see at the top of the page.</p>
      <div className="mt-5 grid gap-4">
        <Field label="Headline" id="hh">
          <input id="hh" value={headline} onChange={(e) => setHeadline(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Description paragraph (desktop only)" id="hd">
          <textarea id="hd" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={TEXTAREA} />
        </Field>
        <div className="grid gap-2">
          <p className="text-sm font-medium text-slate-300">Bullet points</p>
          {bullets.map((b, i) => (
            <div key={i} className="flex gap-2">
              <input value={b} onChange={(e) => setBullets((prev) => prev.map((v, j) => j === i ? e.target.value : v))}
                className={`${INPUT} flex-1`} placeholder={`Bullet ${i + 1}`} />
              <button type="button" onClick={() => setBullets((prev) => prev.filter((_, j) => j !== i))}
                className="rounded-md border border-line px-3 py-2 text-xs text-slate-400 hover:border-red-500 hover:text-red-400">
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setBullets((prev) => [...prev, ""])}
            className="w-fit text-sm font-medium text-brand-soft hover:underline">
            + Add bullet
          </button>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <SaveButton busy={busy} />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Services tab
// ---------------------------------------------------------------------------

function ServicesTab({ supabase }: { supabase: SupabaseClient }) {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("services").select("*").order("sort_order").then(({ data }) => {
      setServices((data as Service[]) ?? DEFAULTS.services);
    });
  }, [supabase]);

  const update = (id: string, field: keyof Service, value: string) =>
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("services").upsert(services);
    if (error) toast(error.message, "error"); else toast("Services saved!", "success");
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">Services</h2>
        <p className="mt-1 text-sm text-slate-400">Edit the name, tagline, and description for each service.</p>
      </div>
      {services.map((s) => (
        <div key={s.id} className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-soft">{s.id}</p>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Service name" id={`${s.id}-name`}>
                <input id={`${s.id}-name`} value={s.name} onChange={(e) => update(s.id, "name", e.target.value)} className={INPUT} />
              </Field>
              <Field label="Short tagline" id={`${s.id}-short`}>
                <input id={`${s.id}-short`} value={s.short} onChange={(e) => update(s.id, "short", e.target.value)} className={INPUT} />
              </Field>
            </div>
            <Field label="Description" id={`${s.id}-desc`}>
              <textarea id={`${s.id}-desc`} rows={3} value={s.description} onChange={(e) => update(s.id, "description", e.target.value)} className={TEXTAREA} />
            </Field>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4">
        <SaveButton busy={busy} />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Process / How It Works tab
// ---------------------------------------------------------------------------

function ProcessTab({ supabase }: { supabase: SupabaseClient }) {
  const { toast } = useToast();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("process_steps").select("*").order("sort_order").then(({ data }) => {
      setSteps((data as ProcessStep[]) ?? DEFAULTS.processSteps);
    });
  }, [supabase]);

  const update = (id: string, field: keyof ProcessStep, value: string) =>
    setSteps((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("process_steps").upsert(steps);
    if (error) toast(error.message, "error"); else toast("Steps saved!", "success");
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-white">How It Works steps</h2>
        <p className="mt-1 text-sm text-slate-400">The 4-step process shown on the home page.</p>
      </div>
      {steps.map((s) => (
        <div key={s.id} className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
          <p className="mb-4 text-2xl font-display font-semibold text-brand-bright">{s.n}</p>
          <div className="grid gap-4">
            <Field label="Step title" id={`step-${s.id}-title`}>
              <input id={`step-${s.id}-title`} value={s.title} onChange={(e) => update(s.id, "title", e.target.value)} className={INPUT} />
            </Field>
            <Field label="Step description" id={`step-${s.id}-body`}>
              <textarea id={`step-${s.id}-body`} rows={2} value={s.body} onChange={(e) => update(s.id, "body", e.target.value)} className={TEXTAREA} />
            </Field>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4">
        <SaveButton busy={busy} />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Service Area tab
// ---------------------------------------------------------------------------

function AreaTab({ supabase }: { supabase: SupabaseClient }) {
  const { toast } = useToast();
  const [towns, setTowns] = useState<Array<{ id: string; name: string; sort_order: number }>>([]);
  const [newTown, setNewTown] = useState("");

  useEffect(() => {
    supabase.from("service_towns").select("id, name, sort_order").order("sort_order").then(({ data }) => {
      setTowns(data ?? DEFAULTS.serviceTowns.map((name, i) => ({ id: String(i), name, sort_order: i + 1 })));
    });
  }, [supabase]);

  async function addTown() {
    if (!newTown.trim()) return;
    const { data, error } = await supabase.from("service_towns").insert({ name: newTown.trim(), sort_order: towns.length + 1 }).select().single();
    if (!error && data) { setTowns((prev) => [...prev, data]); setNewTown(""); toast(`"${newTown.trim()}" added.`, "success"); }
    else toast(error?.message ?? "Failed to add.", "error");
  }

  async function removeTown(id: string, name: string) {
    await supabase.from("service_towns").delete().eq("id", id);
    setTowns((prev) => prev.filter((t) => t.id !== id));
    toast(`"${name}" removed.`, "success");
  }

  return (
    <div className="rounded-2xl border border-line bg-ink-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">Service area towns</h2>
      <p className="mt-1 text-sm text-slate-400">The towns shown in the Service Area section.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {towns.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5 rounded-md border border-line bg-ink px-3 py-1.5 text-sm text-slate-200">
            {t.name}
            <button type="button" onClick={() => removeTown(t.id, t.name)} className="text-slate-500 hover:text-red-400 ml-1">✕</button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input value={newTown} onChange={(e) => setNewTown(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void addTown(); } }}
          placeholder="Add a town…" className={`${INPUT} flex-1`} />
        <button type="button" onClick={addTown}
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-bright">
          Add
        </button>
      </div>
    </div>
  );
}
