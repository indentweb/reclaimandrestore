"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import type { GalleryItem } from "@/lib/gallery";

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9 drop-shadow-lg">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => setActiveIdx(null), []);

  const prev = useCallback(
    () =>
      setActiveIdx((i) =>
        i === null ? null : i === 0 ? items.length - 1 : i - 1,
      ),
    [items.length],
  );

  const next = useCallback(
    () =>
      setActiveIdx((i) =>
        i === null ? null : i === items.length - 1 ? 0 : i + 1,
      ),
    [items.length],
  );

  useEffect(() => {
    if (activeIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIdx, close, prev, next]);

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = activeIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeIdx]);

  const activeItem = activeIdx !== null ? items[activeIdx] : null;

  return (
    <>
      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setActiveIdx(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-ink-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={`Open ${item.type} ${i + 1} of ${items.length}`}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.src + "#t=0.001"}
                  preload="metadata"
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white transition-colors group-hover:bg-black/50">
                  <PlayIcon />
                </span>
              </>
            ) : (
              <>
                <Image
                  src={item.src}
                  alt="Reclaim &amp; Restore detailing work"
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {activeItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          onClick={close}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
            touchStartX.current = null;
          }}
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-white/10"
            onClick={close}
          >
            <CloseIcon />
          </button>

          {/* Counter */}
          {items.length > 1 && (
            <span className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white tabular-nums">
              {(activeIdx ?? 0) + 1} / {items.length}
            </span>
          )}

          {/* Prev arrow */}
          {items.length > 1 && (
            <button
              type="button"
              aria-label="Previous"
              className="absolute left-2 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-white/10 sm:left-4"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft />
            </button>
          )}

          {/* Next arrow */}
          {items.length > 1 && (
            <button
              type="button"
              aria-label="Next"
              className="absolute right-2 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white transition-colors hover:bg-white/10 sm:right-4"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight />
            </button>
          )}

          {/* Media content */}
          <div
            className="relative flex h-[80vh] w-full max-w-5xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.type === "video" ? (
              <video
                key={activeItem.src}
                src={activeItem.src}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] max-w-full rounded-lg"
              />
            ) : (
              <Image
                src={activeItem.src}
                alt="Reclaim &amp; Restore detailing work"
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            )}
          </div>

          {/* Dot strip (only when ≤ 24 items) */}
          {items.length > 1 && items.length <= 24 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to item ${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIdx
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
