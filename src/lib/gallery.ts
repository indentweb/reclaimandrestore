import { promises as fs } from "fs";
import path from "path";

export const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export type GalleryImage = {
  src: string;
  name: string;
  uploadedAt: number;
};

export async function listGalleryImages(): Promise<GalleryImage[]> {
  try {
    const entries = await fs.readdir(GALLERY_DIR, { withFileTypes: true });
    const images = await Promise.all(
      entries
        .filter(
          (e) =>
            e.isFile() &&
            IMAGE_EXT.has(path.extname(e.name).toLowerCase()) &&
            !e.name.startsWith("."),
        )
        .map(async (e) => {
          const stat = await fs.stat(path.join(GALLERY_DIR, e.name));
          return {
            src: `/gallery/${e.name}`,
            name: e.name,
            uploadedAt: stat.mtimeMs,
          };
        }),
    );
    return images.sort((a, b) => b.uploadedAt - a.uploadedAt);
  } catch {
    return [];
  }
}
