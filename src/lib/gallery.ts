import { GALLERY_BUCKET } from "./supabase";

export type GalleryItem = {
  src: string;
  name: string;
  type: "image" | "video";
  uploadedAt: number;
};

/** @deprecated Use GalleryItem */
export type GalleryImage = GalleryItem;

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".avi"]);

function mediaType(name: string): "image" | "video" | null {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return null;
}

async function fetchGalleryOrder(url: string, key: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${url}/rest/v1/site_settings?key=eq.gallery_order&select=value`,
      { headers: { apikey: key }, cache: "no-store" },
    );
    if (!res.ok) return [];
    const data: Array<{ value: string }> = await res.json();
    if (!data[0]?.value) return [];
    return JSON.parse(data[0].value) as string[];
  } catch {
    return [];
  }
}

export async function listGalleryImages(): Promise<GalleryItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return [];

  try {
    // Use a raw fetch so we only send the `apikey` header (no Authorization
    // Bearer) — the new sb_publishable_... format is not a JWT so supabase-js
    // would fail JWT validation on the storage server.  The public_read RLS
    // policy (SELECT true) allows anonymous reads with just the apikey header.
    const [storageRes, order] = await Promise.all([
      fetch(`${url}/storage/v1/object/list/${GALLERY_BUCKET}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: key },
        body: JSON.stringify({
          prefix: "",
          limit: 500,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        }),
        cache: "no-store",
      }),
      fetchGalleryOrder(url, key),
    ]);

    if (!storageRes.ok) {
      console.error("[gallery] list error:", storageRes.status, await storageRes.text());
      return [];
    }

    const data: Array<{ name: string; id: string; created_at?: string }> =
      await storageRes.json();

    const items = data
      .filter(
        (item) =>
          !item.name.startsWith(".") &&
          !item.name.startsWith("brand/") &&
          mediaType(item.name) !== null,
      )
      .map((item) => ({
        src: `${url}/storage/v1/object/public/${GALLERY_BUCKET}/${encodeURIComponent(item.name)}`,
        name: item.name,
        type: mediaType(item.name) as "image" | "video",
        uploadedAt: new Date(item.created_at ?? 0).getTime(),
      }));

    // Apply saved custom order — items not in the order list go to the end
    if (order.length > 0) {
      const orderMap = new Map(order.map((name, idx) => [name, idx]));
      items.sort((a, b) => {
        const ai = orderMap.get(a.name) ?? Infinity;
        const bi = orderMap.get(b.name) ?? Infinity;
        if (ai !== bi) return ai - bi;
        // Stable sort: fall back to upload date for ties (new items at end)
        return b.uploadedAt - a.uploadedAt;
      });
    }

    return items;
  } catch (err) {
    console.error("[gallery] fetch failed:", err);
    return [];
  }
}

