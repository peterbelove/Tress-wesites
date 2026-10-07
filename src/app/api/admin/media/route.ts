import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getAdminUser } from "@/lib/auth";
import { getAllMedia } from "@/lib/cms";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { ALLOWED_TYPES, FILE_ROUTE_PREFIX, MEDIA_CATEGORIES, UPLOAD_DIR, safeFilename } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const items = await getAllMedia({
    category: url.searchParams.get("category") || undefined,
    type: url.searchParams.get("type") || undefined,
    q: url.searchParams.get("q") || undefined,
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const limit = rateLimit(clientKey(req.headers, "upload"), 60, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many uploads. Please wait a moment." }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "No file received." }, { status: 400 });

  const spec = ALLOWED_TYPES[file.type];
  if (!spec) {
    return NextResponse.json(
      { ok: false, error: "Unsupported file type. Use JPG, PNG, WEBP, AVIF, SVG, MP4 or WEBM." },
      { status: 415 },
    );
  }
  if (file.size > spec.maxBytes) {
    return NextResponse.json(
      { ok: false, error: `File is too large. Maximum for this type is ${Math.round(spec.maxBytes / 1024 / 1024)} MB.` },
      { status: 413 },
    );
  }

  const original = safeFilename(path.parse(file.name).name) || "media";
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}-${original}.${spec.ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // Light SVG sanitation: reject scripts/foreign objects/event handlers.
  if (spec.ext === "svg") {
    const text = buffer.toString("utf8");
    if (/<script|<foreignObject|on\w+\s*=|javascript:/i.test(text)) {
      return NextResponse.json({ ok: false, error: "SVG contains disallowed content." }, { status: 400 });
    }
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  } catch (err) {
    console.error("[tres] upload write failed", err);
    return NextResponse.json({ ok: false, error: "Could not store the file. Please try again." }, { status: 500 });
  }

  const category = String(form.get("category") || "general");
  const width = parseInt(String(form.get("width") || ""), 10);
  const height = parseInt(String(form.get("height") || ""), 10);

  const [row] = await db
    .insert(media)
    .values({
      filename,
      url: `${FILE_ROUTE_PREFIX}${filename}`,
      title: String(form.get("title") || original).slice(0, 200),
      altText: String(form.get("altText") || "").slice(0, 300),
      description: String(form.get("description") || "").slice(0, 1000),
      type: spec.kind,
      mimeType: file.type,
      width: Number.isFinite(width) && width > 0 ? width : null,
      height: Number.isFinite(height) && height > 0 ? height : null,
      size: file.size,
      category: (MEDIA_CATEGORIES as readonly string[]).includes(category) ? category : "general",
      source: "upload",
    })
    .returning();

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, item: row });
}
