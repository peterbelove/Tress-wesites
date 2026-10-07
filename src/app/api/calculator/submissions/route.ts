import { NextResponse } from "next/server";
import { db } from "@/db";
import { calculatorSubmissions } from "@/db/schema";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req.headers, "calc"), 30, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });
  try {
    const text = await req.text();
    if (text.length > 20_000) return NextResponse.json({ ok: false }, { status: 413 });
    const body = JSON.parse(text) as { inputs?: unknown; results?: unknown };
    if (!body || typeof body.inputs !== "object" || typeof body.results !== "object") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await db.insert(calculatorSubmissions).values({
      inputs: body.inputs as Record<string, unknown>,
      results: body.results as Record<string, unknown>,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
