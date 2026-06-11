import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";
import SectionHeading from "@/components/SectionHeading";
import { listGalleryImages } from "@/lib/gallery";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery | Reclaim & Restore Mobile Detailing",
  description:
    "Before-and-after photos of interior and exterior detailing work by Reclaim & Restore in North Alabama.",
};

export default async function GalleryPage() {
  const images = await listGalleryImages();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="border-b border-line bg-ink-soft py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Our Work"
              title="Detailing gallery"
              description="A growing collection of vehicles we've reclaimed and restored across North Alabama."
            />
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {images.length > 0 ? (
              <GalleryGrid images={images} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-ink-card/50 px-6 py-20 text-center">
                <p className="text-lg font-medium text-white">
                  No photos yet
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  Our gallery is being built. In the meantime, give us a call to
                  hear about our recent work.
                </p>
                <a
                  href={site.phoneHref}
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-bright"
                >
                  Call {site.phoneDisplay}
                </a>
              </div>
            )}

            <div className="mt-14 rounded-2xl border border-line bg-ink-card p-8 text-center sm:p-12">
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Want results like these?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-mist">
                Book your mobile detail today and we&apos;ll bring the shine to
                your driveway.
              </p>
              <Link
                href="/#book"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-bright"
              >
                Book a Date
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
