import { NextResponse } from "next/server";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req.headers, "enquiry"), 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot — silently accept bot submissions.
  if (clean(body.company_website)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 160);
  const email = clean(body.email, 200).toLowerCase();
  const phone = clean(body.phone, 40);
  const message = clean(body.message, 4000);

  if (!name) return NextResponse.json({ ok: false, error: "Please tell us your name." }, { status: 400 });
  if (!phone && !email) return NextResponse.json({ ok: false, error: "Add a phone number or email." }, { status: 400 });
  if (email && !isValidEmail(email)) return NextResponse.json({ ok: false, error: "That email address does not look right." }, { status: 400 });
  if (!message) return NextResponse.json({ ok: false, error: "Tell us briefly what you need." }, { status: 400 });

  try {
    await db.insert(enquiries).values({
      name,
      email,
      phone,
      whatsapp: clean(body.whatsapp, 40),
      location: clean(body.location, 160),
      service: clean(body.service, 160),
      propertyType: clean(body.propertyType, 80),
      message,
      source: clean(body.source, 40) || "contact",
      status: "new",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[tres] enquiry insert failed", err);
    return NextResponse.json({ ok: false, error: "We could not save your enquiry. Please try WhatsApp or email." }, { status: 500 });
  }
}
