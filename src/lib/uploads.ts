import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");
export const FILE_ROUTE_PREFIX = "/api/files/";

export const ALLOWED_TYPES: Record<string, { ext: string; kind: "image" | "video"; maxBytes: number }> = {
  "image/jpeg": { ext: "jpg", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "image/png": { ext: "png", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "image/webp": { ext: "webp", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "image/avif": { ext: "avif", kind: "image", maxBytes: 15 * 1024 * 1024 },
  "image/svg+xml": { ext: "svg", kind: "image", maxBytes: 2 * 1024 * 1024 },
  "video/mp4": { ext: "mp4", kind: "video", maxBytes: 300 * 1024 * 1024 },
  "video/webm": { ext: "webm", kind: "video", maxBytes: 300 * 1024 * 1024 },
};

export const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
};

export const MEDIA_CATEGORIES = [
  "hero",
  "services",
  "markets",
  "projects",
  "about",
  "insights",
  "drone",
  "videos",
  "general",
] as const;

export function safeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
}
