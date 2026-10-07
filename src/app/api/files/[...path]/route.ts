import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { CONTENT_TYPES, UPLOAD_DIR } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/** Serves uploaded media with range support (needed for video seeking). */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const name = path.basename(segments?.[segments.length - 1] || "");
  if (!name || name.includes("..")) return new Response("Not found", { status: 404 });
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return new Response("Not found", { status: 404 });

  const filePath = path.join(UPLOAD_DIR, name);
  let size: number;
  try {
    const s = await stat(filePath);
    if (!s.isFile()) throw new Error("not file");
    size = s.size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };
  if (ext === "svg") headers["Content-Security-Policy"] = "script-src 'none'";

  const range = req.headers.get("range");
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2]
        ? Math.min(parseInt(match[2], 10), size - 1)
        : Math.min(start + 2 * 1024 * 1024 - 1, size - 1);
      if (start >= size || start > end) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      }
      const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
      return new Response(stream, {
        status: 206,
        headers: {
          ...headers,
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
  }

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new Response(stream, { status: 200, headers: { ...headers, "Content-Length": String(size) } });
}
