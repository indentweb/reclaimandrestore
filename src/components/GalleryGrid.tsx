"use client";

import Image from "next/image";
import { useState } from "react";
import type { GalleryImage } from "@/lib/gallery";

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((img) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(img.src)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-ink-card"
          >
            <Image
              src={img.src}
              alt="Reclaim & Restore detailing work"
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            onClick={() => setActive(null)}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative h-[80vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active}
              alt="Reclaim & Restore detailing work"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
