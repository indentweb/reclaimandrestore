import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Shared instance — loaded lazily once per page session
let _ffmpeg: FFmpeg | null = null;

async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (_ffmpeg) return _ffmpeg;
  const ff = new FFmpeg();
  if (onLog) ff.on("log", ({ message }) => onLog(message));

  // Load the single-threaded core from CDN (no SharedArrayBuffer needed)
  const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ff.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
  });

  _ffmpeg = ff;
  return ff;
}

export interface CompressOptions {
  /** 0–100 reported to the caller as progress ticks (default: no-op) */
  onProgress?: (pct: number) => void;
  /** Max height in px (default: 720) */
  maxHeight?: number;
  /** CRF quality — lower = bigger/better (default: 28 ≈ good for web) */
  crf?: number;
}

/**
 * Compress a video File using ffmpeg.wasm in the browser.
 * Returns a new File (MP4/H.264 + AAC) that is typically 5–15x smaller.
 */
export async function compressVideo(
  file: File,
  opts: CompressOptions = {},
): Promise<File> {
  const { onProgress, maxHeight = 720, crf = 28 } = opts;

  const ff = await getFFmpeg();

  if (onProgress) {
    ff.on("progress", ({ progress }) => {
      onProgress(Math.min(99, Math.round(progress * 100)));
    });
  }

  const inExt = file.name.slice(file.name.lastIndexOf(".")) || ".mov";
  const inName = `in${inExt}`;
  const outName = "out.mp4";

  await ff.writeFile(inName, await fetchFile(file));

  await ff.exec([
    "-i", inName,
    // Scale to maxHeight, keep aspect ratio, ensure even dimensions
    "-vf", `scale=-2:'min(${maxHeight},ih)'`,
    "-c:v", "libx264",
    "-crf", String(crf),
    "-preset", "fast",
    "-c:a", "aac",
    "-b:a", "128k",
    // Optimise for streaming start
    "-movflags", "+faststart",
    outName,
  ]);

  const data = await ff.readFile(outName);

  // Clean up virtual FS
  await ff.deleteFile(inName).catch(() => void 0);
  await ff.deleteFile(outName).catch(() => void 0);

  // Remove old progress listener to avoid stacking on subsequent calls
  ff.off("progress", () => void 0);

  const baseName = file.name.slice(0, file.name.lastIndexOf(".")) || "video";
  // Copy into a plain ArrayBuffer to satisfy TypeScript's strict BlobPart types
  const raw = data as Uint8Array;
  const buf = new ArrayBuffer(raw.byteLength);
  new Uint8Array(buf).set(raw);
  return new File([buf], `${baseName}.mp4`, {
    type: "video/mp4",
  });
}

/** True if a file is a video that should be compressed before upload. */
export function isVideoFile(file: File): boolean {
  return (
    file.type.startsWith("video/") ||
    /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(file.name)
  );
}
