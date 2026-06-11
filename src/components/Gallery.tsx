import Link from "next/link";
import Image from "next/image";
import { listGalleryImages } from "@/lib/gallery";
import SectionHeading from "./SectionHeading";
import GalleryGrid from "./GalleryGrid";

export default async function Gallery() {
  const images = (await listGalleryImages()).slice(0, 6);

  return (
    <section id="work" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Our Work"
            title="Recent details"
            description="A look at vehicles we've brought back to life across North Alabama."
          />
          {images.length > 0 && (
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-brand-bright"
            >
              View full gallery
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>

        <div className="mt-12">
          {images.length > 0 ? (
            <GalleryGrid images={images} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-ink-card/50 px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white p-2 ring-1 ring-line">
                <Image
                  src="/brand/logo-monogram.png"
                  alt="Reclaim & Restore"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </span>
              <p className="mt-5 text-lg font-medium text-white">
                Project photos coming soon
              </p>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                We&apos;re building our gallery of before-and-after results.
                Check back soon to see our latest work.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
