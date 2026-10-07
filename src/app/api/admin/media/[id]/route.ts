import { unlink } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getAdminUser } from "@/lib/auth";
import { FILE_ROUTE_PREFIX, MEDIA_CATEGORIES, UPLOAD_DIR } from "@/lib/uploads";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const mediaId = parseInt(id, 10);
  if (!Number.isFinite(mediaId)) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Partial<typeof media.$inferInsert> = {};
  if (typeof body.title === "string") patch.title = body.title.slice(0, 200);
  if (typeof body.altText === "string") patch.altText = body.altText.slice(0, 300);
  if (typeof body.description === "string") patch.description = body.description.slice(0, 1000);
  if (typeof body.category === "string" && (MEDIA_CATEGORIES as readonly string[]).includes(body.category)) {
    patch.category = body.category;
  }
  const [row] = await db.update(media).set(patch).where(eq(media.id, mediaId)).returning();
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, item: row });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await getAdminUser())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const mediaId = parseInt(id, 10);
  if (!Number.isFinite(mediaId)) return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
  const [row] = await db.delete(media).where(eq(media.id, mediaId)).returning();
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (row.source === "upload" && row.url.startsWith(FILE_ROUTE_PREFIX)) {
    const name = path.basename(row.url);
    await unlink(path.join(UPLOAD_DIR, name)).catch(() => undefined);
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
