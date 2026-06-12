import { NextResponse } from "next/server";
import path from "path";
import { serverClient, GALLERY_BUCKET } from "@/lib/supabase";
import { listGalleryImages } from "@/lib/gallery";

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
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { ok: false, error: "Storage is not configured." },
      { status: 503 },
    );
  }

  // Validate auth token forwarded from the browser client session.
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "No files provided." }, { status: 400 });
  }

  const supabase = serverClient();
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

    const { error } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(filename, bytes, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Failed to upload ${file.name}: ${error.message}` },
        { status: 500 },
      );
    }

    const { data: urlData } = supabase.storage
      .from(GALLERY_BUCKET)
      .getPublicUrl(filename);
    saved.push(urlData.publicUrl);
  }

  return NextResponse.json({ ok: true, saved });
}

export async function DELETE(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { ok: false, error: "Storage is not configured." },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
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

  const supabase = serverClient();
  const { error } = await supabase.storage.from(GALLERY_BUCKET).remove([name]);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
