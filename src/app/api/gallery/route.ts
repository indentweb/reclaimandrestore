import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { GALLERY_DIR, listGalleryImages } from "@/lib/gallery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};
const MAX_BYTES = 12 * 1024 * 1024; // 12 MB per image

function authorized(request: Request, formPassword?: string | null) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = request.headers.get("x-admin-password");
  return header === expected || formPassword === expected;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40);
}

export async function GET() {
  const images = await listGalleryImages();
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { ok: false, error: "Uploads are not configured. Set ADMIN_PASSWORD." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const password = form.get("password");
  if (!authorized(request, typeof password === "string" ? password : null)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files provided." }, { status: 400 });
  }

  await fs.mkdir(GALLERY_DIR, { recursive: true });

  const saved: string[] = [];
  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported file type: ${file.name}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: `${file.name} is larger than 12 MB.` },
        { status: 400 },
      );
    }

    const ext = EXT_BY_TYPE[file.type] ?? ".jpg";
    const base = slugify(path.basename(file.name, path.extname(file.name))) || "photo";
    const filename = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(GALLERY_DIR, filename), bytes);
    saved.push(`/gallery/${filename}`);
  }

  return NextResponse.json({ ok: true, saved });
}

export async function DELETE(request: Request) {
  const password = request.headers.get("x-admin-password");
  if (!authorized(request, password)) {
    return NextResponse.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = body.name ?? "";
  // Guard against path traversal — only allow a bare filename.
  if (!name || name.includes("/") || name.includes("\\") || name.includes("..")) {
    return NextResponse.json({ ok: false, error: "Invalid file name." }, { status: 400 });
  }

  try {
    await fs.unlink(path.join(GALLERY_DIR, name));
  } catch {
    return NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
